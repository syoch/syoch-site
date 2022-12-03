<script lang="ts">
  import { TerminalSession } from "./Terminal";

  export let command_handler = (cmd: string, write: (s: string) => void) => {
    write("<Default cmd handler> " + cmd);
    return;
  };
  export let prompt = (): string => "$ ";

  export let session = new TerminalSession();

  let output = session.output;

  $output = prompt();

  let command = "";
</script>

<pre
  class="wrapper"
  tabindex="-1"
  on:keydown={(e) => {
    console.log(e.key);
    if (e.key === "Enter") {
      session.write("\n");
      command_handler(command, (s) => {
        session.write(s);
      });
      command = "";
      session.write(prompt());
    } else if (e.key === "Backspace") {
      session.backspace();
      command = command.slice(0, -1);
    } else if (e.key.length === 1) {
      command += e.key;
      session.write(e.key);
    }
  }}>{$output}</pre>

<style>
  .wrapper {
    border: 1px solid black;
    width: 100%;
    margin: 0 10px;
    padding: 10px;
    border-radius: 5px;

    height: 20rem;
    background-color: #444;
    color: #eee;

    font-family: "Fira Code Light", "Roboto Mono", monospace;
    font-size: 18px;

    overflow: scroll;
  }
</style>
