import init, { demangle_str } from "@src/wasm/pkg";

export function ghs_demangle(str: string): string {
  return demangle_str(str);
}

await init();