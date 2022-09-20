type Instruction = cs.Instruction;

namespace values {
  export abstract class Value {
    abstract toString(): string;

    is_undefined(): boolean {
      return false;
    }
  }

  class ApplyOperator extends Value {
    constructor(public left: Value, public right: Value) {
      super();
    }

    is_undefined(): boolean {
      return this.left.is_undefined() || this.right.is_undefined();
    }

    toString(): string {
      return `(${this.left} + ${this.right})`;
    }
  }
  export class Add extends ApplyOperator {
    toString(): string {
      return `(${this.left} + ${this.right})`;
    }
  }
  export class Or extends ApplyOperator {
    toString(): string {
      return `(${this.left} | ${this.right})`;
    }
  }

  export class Sub extends ApplyOperator {
    toString(): string {
      return `(${this.left} - ${this.right})`;
    }
  }

  export class Immediate extends Value {
    constructor(public value: number) {
      super();
    }

    toString() {
      return "0x" + this.value.toString(16);
    }
  }
  export class Reference extends Value {
    constructor(public ptr: Value) {
      super();
    }

    toString() {
      return "*" + this.ptr.toString();
    }
  }

  export class FunctionCall extends Value {
    constructor(public address: Value, public args: Value[]) {
      super();
    }

    toString() {
      let args = this.args.map((arg) => arg.toString()).join(', ');
      return `func[${this.address}](${args})`;
    }
  }

  class UndefinedValueClass extends Value {
    toString() {
      return 'undefined';
    }
    is_undefined(): boolean {
      return true;
    }
  }
  export let undefinedValue = new UndefinedValueClass();

  export function add(value: Value, v: Value): Value {
    if (value instanceof Immediate) {
      if (v instanceof Immediate) {
        return new Immediate(value.value + v.value);
      }
    }
    return new Add(value, v);
  }

  export function or(value: Value, v: Value): Value {
    if (value instanceof Immediate) {
      if (v instanceof Immediate) {
        return new Immediate(value.value | v.value);
      }
    }
    return new Or(value, v);
  }


}

export class FoldingProcessor {
  general_registers: values.Value[];
  floating_registers: values.Value[];
  ctr: values.Value;

  constructor() {
    this.general_registers = (new Array(32)).fill(values.undefinedValue);
    this.floating_registers = (new Array(32)).fill(values.undefinedValue);
    this.ctr = values.undefinedValue;
  }

  get_register(reg: string): values.Value {
    if (reg.startsWith('r')) {
      return this.general_registers[parseInt(reg.slice(1))];
    } else if (reg.startsWith('f')) {
      return this.floating_registers[parseInt(reg.slice(1))];
    } else {
      throw new Error(`Unknown register ${reg}`);
    }
  }

  assign_register(reg: string, value: values.Value) {
    if (reg.startsWith('r')) {
      this.general_registers[parseInt(reg.slice(1))] = value;
    } else if (reg.startsWith('f')) {
      this.floating_registers[parseInt(reg.slice(1))] = value;
    } else {
      throw new Error(`Unknown register ${reg}`);
    }
  }


  public foldInstruction(inst: Instruction): string {
    let args = inst.op_str.split(", ");
    switch (inst.mnemonic) {
      case "li": {
        this.assign_register(args[0], new values.Immediate(parseInt(args[1])));
        break;
      }
      case "lis": {
        this.assign_register(args[0], new values.Immediate(parseInt(args[1]) << 16));
        break;
      }
      case "addi": {
        let l = parseInt(args[0].slice(1));
        let a = parseInt(args[1].slice(1));
        let b = parseInt(args[2]);
        let value = values.add(this.general_registers[a], new values.Immediate(b));
        this.general_registers[l] = value;
        break;
      }
      case "ori": {
        let l = parseInt(args[0].slice(1));
        let a = parseInt(args[1].slice(1));
        let b = parseInt(args[2]);
        let value = values.or(this.general_registers[a], new values.Immediate(b));
        this.general_registers[l] = value;
        break;
      }
      case "mtctr": {
        this.ctr = this.get_register(args[0]);
        break;
      }
      case "bctrl": {
        let last_argument_register = 3;
        for (let i = 3; i <= 10; i++) {
          if (this.general_registers[i].is_undefined()) {
            last_argument_register = i - 1;
            break;
          }
        }

        const args = this.general_registers.slice(3, last_argument_register + 1);
        const ret = `func[${this.ctr}](${args.join(", ")})`;

        // clear argument registers
        for (let i = 3; i <= last_argument_register; i++) {
          this.general_registers[i] = values.undefinedValue;
        }

        // Sets return value to r3
        this.general_registers[3] = new values.FunctionCall(this.ctr, args);

        return ret;
      }
      case "mr": {
        this.assign_register(args[0], this.get_register(args[1]));
        break;
      }
      case "lwz": {
        const dest = parseInt(args[0].slice(1));
        const [_, offset_str, regname] = args[1].match(/(.*)\((.+)\)$/);
        const base = this.get_register(regname);
        const offset = parseInt(offset_str || "0");
        this.general_registers[dest] = new values.Reference(values.add(base, new values.Immediate(offset)));

        return `r${dest} = *(${base} + ${offset})`;
      }
      case "stw": {
        const dest = parseInt(args[0].slice(1));
        const [_, offset_str, regname] = args[1].match(/(.*)\((.+)\)$/);
        const base = this.get_register(regname);
        const offset = parseInt(offset_str || "0");

        return `*(${base} + ${offset}) = ${this.general_registers[dest]}`;
      }
      default: {
        return inst.mnemonic + " " + inst.op_str;
      }

    }
    return null;

  }
}
