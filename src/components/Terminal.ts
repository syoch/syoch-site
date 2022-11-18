import { writable } from "svelte/store";

type OnUpdateHandler = (output: string) => void;

export class TerminalSession {
  private output = "";
  private evt_on_update_output: OnUpdateHandler[] = [];

  protected write(str: string) {
    this.output += str;

    for (const f of this.evt_on_update_output) {
      f(this.output);
    }
  }

  public put_input(character: string) {
    this.on_input(character);
  }

  on_text_update(kind: string, f: OnUpdateHandler) {
    if (kind == "output_update") {
      this.evt_on_update_output.push(f)
    } else {
      this.write(`Unknown kind in on_text_update(): ${kind}`);
    }
  }

  on_input(character: string) {
    this.write(`<I:${character}>`);
  }
}