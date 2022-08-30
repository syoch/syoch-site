/// <reference types="svelte" />

namespace cs {
  const ARCH_PPC = 4;

  const MODE_BIG_ENDIAN = -2147483648;


  declare class Instruction {
    id: number;
    address: number;
    size: number;
    bytes: number[];
    mnemonic: string;
    op_str: string;

  }

  declare class Capstone {
    arch: number;
    mode: number;
    handle_ptr: number;

    constructor(arch: number, mode: number);
    option(option: any, value: any): any;
    disasm(buffer: number[], addr: number, max: number): Instruction[];
    reg_name(reg_id: number): string;
    insn_name(insn_id: number): string;
    group_name(group_id: number): string;
    errno(): number;
    close(): void;
  }
}
