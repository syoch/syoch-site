import { writable } from "svelte/store";

type OnUpdateHandler = (output: string) => void;

export class TerminalSession {
  private output = writable("");
  public input = "";

  public subscribe_output = this.output.subscribe;

  public write(s) {
    this.output.update(x => x + s);
  }
}