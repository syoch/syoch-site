import { writable } from "svelte/store";

type OnUpdateHandler = (output: string) => void;

export class TerminalSession {
  public output = writable("");

  public backspace() {
    this.output.update(x => x.slice(0, -1))
  }
  public write(s: string) {
    this.output.update(x => x + s);
  }
}