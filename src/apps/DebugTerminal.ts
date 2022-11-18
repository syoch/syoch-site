import { TerminalSession } from "../components/Terminal";

export class DebugTerminalSession extends TerminalSession {
  private input = "";

  on_input(character: string): void {
    if (character == "\n") {
      this.handler(this.input);
    }

    this.input += character;
  }

  handler(cmd: string): void {
    this.write(`cmd: ${cmd}`);
  }
}