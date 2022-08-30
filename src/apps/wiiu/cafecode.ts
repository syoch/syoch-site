

let d = new cs.Capstone(cs.ARCH_PPC, cs.MODE_BIG_ENDIAN);

// https://stackoverflow.com/a/37471538
// Thanks!!!

function parseFloat(integer): number {
  let sign = ((integer >>> 31) == 0) ? 1.0 : -1.0;
  let e = ((integer >>> 23) & 0xff);
  let m = (e == 0) ? (integer & 0x7fffff) << 1 : (integer & 0x7fffff) | 0x800000;
  return sign * m * Math.pow(2, e - 150);
}

const OPERATOR_TYPES = {
  EQ: "==",
  NE: "!=",
  GT: ">",
  LT: "<",
  GE: ">=",
  LE: "<=",
  AND: "&",
  OR: "|"
};

const CONST_CODE = {
  TERMINATOR: [
    0xD0, 0x00, 0x00, 0x00,
    0xDE, 0xAD, 0xCA, 0xFE
  ],
  TIMER_TERMINATOR: [
    0xD2, 0x00, 0x00, 0x00,
    0xCA, 0xFE, 0xBA, 0xBE
  ]
};

abstract class Stmt {
  _errors: string[];

  constructor() {
    this._errors = [];
  }

  abstract stringify(): string;

  detect_errors() {
    this._errors.push("Stmt is abstract");
  }

  toString() {
    this.detect_errors();

    let ret = this.stringify();
    if (this._errors.length > 0) {
      ret += "\n  // " + this._errors.join(", ");
    }
    return ret;
  }

}
abstract class BlockStmt extends Stmt {
  constructor(protected _stmts: Stmt[]) {
    super();
  }
  toString() {
    let ret = super.toString();

    ret += "\n{ \n";
    for (let stmt of this._stmts) {
      ret += stmt.
        toString().
        split("\n").
        map(v => "  " + v).
        join("\n");
      ret += "\n";
    }
    ret += "}";

    return ret;
  }
}

class IfNode extends BlockStmt {

  constructor(
    protected pointer_type: number, protected size: number, protected address: number, protected op: string, protected right: number, protected _stmts: Stmt[]) {
    super(_stmts);

  }
  detect_errors() {
    if (this.right >= 2 ** this.size) {
      this._errors.push("Out of bounds");
    }

    if (this.pointer_type != 0 && this.pointer_type != 1) {
      this._errors.push(`Invalid pointer type ${this.pointer_type}`);
    }
  }
  stringify() {
    let ret = "";
    ret += "if ([";

    let addr = "0x" + this.address.toString(16);
    if (this.pointer_type == 0) { // Not pointer
      ret += `[${addr}]`;
    } else if (this.address == 0) { // Offset = 0
      ret += "[ptr]"
    } else {
      ret += "[ptr + " + addr + "]";
    }

    ret += " ";
    ret += this.op;
    ret += " ";
    ret += "0x" + this.right.toString(16);
    ret += ` as ${this.size}bits`
    ret += ")";

    return ret;
  }
}
class LoadPointerStmt extends Stmt {
  constructor(
    protected pointer_type: number,
    protected address: number,
    protected start: number,
    protected end: number
  ) {
    super();

  }
  detect_errors() {
    if (this.pointer_type != 0 && this.pointer_type != 1) {
      this._errors.push(`Invalid pointer type ${this.pointer_type}`);
    }
  }
  stringify() {
    let ret = "";
    ret += "ptr = ";

    let addr = "0x" + this.address.toString(16);
    if (this.pointer_type == 0) {
      ret += `[${addr}]  `;
    } else if (this.address == 0) {
      ret += "[ptr]  "
    } else {
      ret += "[ptr + " + addr + "]  ";
    }

    ret += `// Range: from ${this.start.toString(16)} to ${this.end.toString(16)}`;

    return ret;
  }
}
class AddOffsetStmt extends Stmt {
  constructor(protected offset: number) {
    super()
  }

  detect_errors() {
    if (this.offset >= 2 ** 24) {
      this._errors.push("Out of bounds");
    }
  }

  stringify() {
    return `ptr += 0x${this.offset.toString(16)}`;
  }
}
class RamWriteStmt extends Stmt {
  constructor(protected pointer_type: number, protected size: number, protected address: number, protected value: number) {
    super();
  }
  detect_errors() {
    if (this.value >= 2 ** this.size) {
      this._errors.push("Out of bounds");
    }

    if (this.pointer_type != 0 && this.pointer_type != 1) {
      this._errors.push("Invalid pointer type");
    }
  }
  stringify() {
    let ret = "";

    let addr = "0x" + this.address.toString(16);
    if (!this.pointer_type) {
      ret += `[${addr}] = `;
    } else if (this.address == 0) {
      ret += "[ptr] = "
    } else {
      ret += "[ptr + " + addr + "] = ";
    }
    ret += "0x" + this.value.toString(16);
    ret += ` as ${this.size}bits`;

    return ret;
  }
}
class StringWriteStmt extends Stmt {
  constructor(protected pointer_type: number, protected address: number, protected values: number[], protected last: number) {
    super();
    this.pointer_type = pointer_type;
    this.address = address;
    this.values = values;
    this.last = last;
  }
  detect_errors() {
    if (this.pointer_type != 0 && this.pointer_type != 1) {
      this._errors.push("Invalid pointer type");
    }
    if (this.last != 0xff) {
      this._errors.push("Invalid terminator");
    }
  }
  stringify() {
    let ret = "write_string(";
    ret += this.pointer_type ? "ptr + " : "";
    ret += "0x" + this.address.toString(16);
    ret += ", [";
    ret += this.values.
      map((v) => {
        let valid =
          (v > 47 && v < 58) || // number keys
          v == 32 || v == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
          (v > 64 && v < 91) || // letter keys
          (v > 95 && v < 112) || // numpad keys
          (v > 185 && v < 193) || // ;=,-./` (in order)
          (v > 218 && v < 223);   // [\]' (in order)
        if (valid) {
          let ch = String.fromCharCode(v);
          return `'${ch}'`;
        } else {
          console.log("v =", v);
          return v;
          // return "0x" + v.toString(16);
        }
      }).
      join(", ");
    ret += "])";


    return ret;
  }
}
class AssemblyExecuteStmt extends Stmt {
  instructions: any[]; // TODO: fix this

  constructor(machine_codes: number[]) {
    super();
    let raw_machinecode = [];
    for (let i = 0; i < machine_codes.length; i++) {
      raw_machinecode.push(machine_codes[i] >> 0x18 & 0xff);
      raw_machinecode.push(machine_codes[i] >> 0x10 & 0xff);
      raw_machinecode.push(machine_codes[i] >> 0x08 & 0xff);
      raw_machinecode.push(machine_codes[i] >> 0x00 & 0xff);
    }
    this.instructions = d.disasm(raw_machinecode, 0x0, 0);
  }

  detect_errors() { }

  stringify() {
    let ret = "";
    ret += "asm {\n";
    for (const element of this.instructions) {
      let instruction = element;
      ret += `  ${instruction.mnemonic ?? "mne"} ${instruction.op_str ?? "op"}\n`;
    }
    ret += "}\n"

    return ret;
  }
}
class RegisterAssign extends Stmt {
  size: String;

  constructor(protected pointer_type: number, size: number | null, protected register: number, protected address: number, protected is_integer: boolean, protected is_load: boolean) {
    super();
    this.size = size ? size.toString() : "";
  }

  detect_errors() {
    if (this.pointer_type != 0 && this.pointer_type != 1) {
      this._errors.push("Invalid pointer type");
    }
    if (this.register <= 0 || 7 < this.register) {
      this._errors.push("Invalid register");
    }
    if (this.size == undefined) {
      this._errors.push("Invalid size");
      this.size = "?";
    }
  }
  stringify() {
    let reg = (this.is_integer ? "r" : "f") + this.register;

    let val = "";
    val = `0x${this.address.toString(16)}`
    if (this.pointer_type == 1) {
      val = `ptr + ${val}`;
    }
    val = `[${val}] as ${this.size}bits`

    let ret = "";
    if (this.is_load) {
      ret = `${reg} = ${val}`;
    } else {
      ret = `${val} = ${reg}`;
    }

    return ret;
  }
}
class RegisterOperatorStmt extends Stmt {
  constructor(protected is_int: boolean, protected type: number, protected right: number, protected left: number, protected value: number, protected is_immidiate: boolean) {
    super();
  }
  detect_errors() {
    if (8 < this.type && this.type < 0) {
      this._errors.push("Invalid operator type");
    }
    if (7 < this.left || this.left < 0) {
      this._errors.push("Invalid left register");
    }

    if (7 < this.right || this.right < 0) {
      this._errors.push("Invalid right register");
    }
  }
  stringify() {
    let prefix = this.is_int ? "r" : "f";

    let op = ["+", "-", "/", "*"][this.type] + "=";

    let left = prefix + this.left;

    let right = "";
    if (this.is_immidiate) {
      right = parseFloat(this.value).toString();
    } else {
      right = prefix + this.right;
    }

    let ret = `${left} ${op} ${right}`;

    if (this.type == 8) {
      ret = `${left} = ${right}`;
    }
    return ret;
  }
}
class TimerStmt extends BlockStmt {
  constructor(protected frames: number, body) {
    super(body);
  }

  detect_errors() {

  }

  stringify() {
    return `timer (${this.frames})`;
  }
}
class TimerResetStmt extends Stmt {

  constructor(protected value: number, protected addr: number) {
    super();
  }
  detect_errors() {
    if (this.value < 0 || this.value >= 2 ** 16) {
      this._errors.push("Invalid Value(most be 0 to 16bit)");
    }
  }
  stringify() {
    return `if ([${this.addr.toString(16)}] == 0x${this.value.toString(16)} as 16bits) reset_timer()`
  }
}
class SyscallStmt extends Stmt {
  /**
   * @param {number} syscall
   */
  constructor(protected syscall: number) {
    super();
  }
  detect_errors() { }
  stringify() {
    return `syscall(${this.syscall.toString(16)})`;
  }
}
class UndefinedStmt extends Stmt {
  constructor(protected opcode: number) {
    super();
  }

  stringify() {
    return `Undefined<0x${this.opcode.toString(16)}>`;
  }
}

export default class Parser {
  src: Array<number>;
  constructor(_src) {
    /**
     * @type {Array<number>}
    */

    let src = _src.replace(/\r|\n|\s/g, "");
    if (src.length % 2 != 0) {
      src += "0";
    }
    src = src.split(/(..)/).slice(1).filter(x => x.length == 2);
    this.src = src.map(x => parseInt(x, 16));
  }
  read_byte() {
    return this.src.shift();
  }
  read_half() {
    let ret = 0;
    ret += this.read_byte() << 0x08;
    ret += this.read_byte();
    return ret;
  }
  read_word() {
    let ret = 0;
    ret += (this.read_half() << 0x08) * 0x100;
    ret += this.read_half();
    return ret;
  }

  convert_size(src: number): number | null {
    if (src == 0) {
      return 8;
    } else if (src == 1) {
      return 16;
    } else if (src == 2) {
      return 32;
    } else {
      return null;
    }
  }
  convert_operator(src) {
    return [
      "==", "!=", ">", "<",
      ">=", "<=", "&", "|"
    ][src];
  }

  /**
   * @param {Array<number>} bytes
   * @returns {boolean}
   */
  startsWith(bytes) {
    return this.src.
      slice(0, bytes.length).
      every((x, i) => x == bytes[i]);
  }

  parseIf(opcode) {
    let byte = this.read_byte();
    this.read_byte()
    this.read_byte()

    let addr = this.read_word();
    let value = this.read_word();

    this.read_word(); // skip 00000000
    return new IfNode(
      (byte & 0xf0) >> 4,
      this.convert_size(byte & 0x0f),
      addr,
      this.convert_operator(opcode - 0x3),
      value,
      this.parseStmts()
    );
  }

  parseLoadPointer() {
    let pointer_type = this.read_byte() >> 4;
    this.read_byte();
    this.read_byte();

    let address = this.read_word();
    let start = this.read_word();
    let end = this.read_word();
    return new LoadPointerStmt(pointer_type, address, start, end);
  }

  parseAddOffset() {
    this.read_byte();
    this.read_byte();
    this.read_byte();

    let address = this.read_word();
    return new AddOffsetStmt(address);
  }

  parseRamWrite() {
    let ps = this.read_byte();

    let addr = 0;
    let value = 0;

    if (ps >> 4 == 1) {
      addr = this.read_half();
      value = this.read_word();
    } else {
      this.read_half();
      addr = this.read_word();
      value = this.read_word();
      this.read_word();
    }

    return new RamWriteStmt(
      ps >> 4,
      this.convert_size(ps & 0x0f),
      addr, value
    );
  }

  parseStringWrite() {
    let pointer_type = this.read_byte() >> 4;
    let count = this.read_half();

    let address = this.read_word();

    let values = []
    for (let i = 0; i < count; i++) {
      values.push(this.read_byte());
    }

    let last;
    if (count % 8 == 0) {
      this.read_word();
      this.read_half();
      this.read_byte();
      last = this.read_byte();
    } else {
      let padding = 8 - count % 8;
      for (let i = 0; i < padding; i++) {
        last = this.read_byte();
      }
    }

    return new StringWriteStmt(
      pointer_type,
      address,
      values,
      last
    );
  }

  parseAssemblyExecute() {
    this.read_byte();
    let lines_count = this.read_half();
    this.read_word();
    /** @type {Array<number>} */
    let machine_codes = [];
    for (let i = 0; i < lines_count * 2; i++) {
      machine_codes.push(this.read_word());
    }
    return new AssemblyExecuteStmt(machine_codes);
  }

  parseRegisterAssign(opcode) {
    let ps = this.read_byte() | 0x10;
    let pointer_type = (ps & 0xf0) >> 4;
    let size = this.convert_size(ps & 0x0f);

    this.read_byte();
    let register = this.read_byte() & 0x0f | 0;

    let is_integer = opcode == 0x10 || opcode == 0x11;
    let is_load = opcode == 0x10 || opcode == 0x12;

    return new RegisterAssign(
      pointer_type,
      size,
      register,
      this.read_word(),
      is_integer,
      is_load
    );
  }

  parseRegisterOperator(opcode) {
    let type = this.read_byte() | 0;

    let left = this.read_byte() | 0;
    let right = this.read_byte() | 0;

    let value = this.read_word();

    let is_immidiate = type >= 4;

    if (type >= 4) {
      type -= 4;
    }

    return new RegisterOperatorStmt(
      opcode == 0x14,
      type,
      right,
      left,
      value,
      is_immidiate
    );
  }

  parseTimer() {
    this.read_byte();
    this.read_half();
    return new TimerStmt(this.read_word(), this.parseStmts(CONST_CODE.TIMER_TERMINATOR));
  }

  parseTimerReset() {
    this.read_byte();
    let value = this.read_half();
    let addr = this.read_word();
    return new TimerResetStmt(value, addr);
  }

  parseSyscall() {
    this.read_byte();
    let syscall = this.read_half();
    this.read_word();
    return new SyscallStmt(syscall);
  }
  parseStmt() {
    let opcode = this.read_byte();
    if (0x03 <= opcode && opcode <= 0x0A) {
      return this.parseIf(opcode);
    } else if (opcode == 0x30) {
      return this.parseLoadPointer();
    } else if (opcode == 0x31) {
      return this.parseAddOffset();
    } else if (opcode == 0x00) {
      return this.parseRamWrite();
    } else if (opcode == 0x01) {
      return this.parseStringWrite();
    } else if (opcode == 0xc0) {
      return this.parseAssemblyExecute();
    } else if (0x10 <= opcode && opcode <= 0x13) {
      return this.parseRegisterAssign(opcode);
    } else if (opcode == 0x14 || opcode == 0x15) {
      return this.parseRegisterOperator(opcode);
    } else if (opcode == 0x0C) {
      return this.parseTimer();
    } else if (opcode == 0x0D) {
      return this.parseTimerReset();
    } else if (opcode == 0xC1) {
      return this.parseSyscall()
    } else if (opcode == 0xD0 || opcode == 0xD2) {
      this.read_byte();
      this.read_byte();
      this.read_byte();
      this.read_word();
      return null;
    } else {
      return new UndefinedStmt(opcode);
    }
  }

  parseStmts(sentinel = undefined) {
    if (sentinel == undefined) {
      sentinel = CONST_CODE.TERMINATOR;
    }

    let stmts = [];
    while (this.src.length > 0 && !this.startsWith(sentinel)) {
      let stmt = this.parseStmt();
      if (stmt) {
        stmts.push(stmt);
      }
    }
    for (let i = 0; i < sentinel.length; i++) {
      this.read_byte();
    }
    return stmts;
  }

  parse() {
    let stmts = [];
    while (this.src.length > 0) {
      let stmt = this.parseStmt();
      if (stmt) {
        stmts.push(stmt);
      }
    }
    return stmts;
  }
}