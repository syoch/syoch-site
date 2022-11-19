<script lang="ts">
  import { TerminalSession } from "./Terminal";

  export let handler = (cmd: String, write: (s: String) => void) => {
    write("<Default cmd handler> " + cmd);
    return;
  };
  export let prompt = () => "$";

  export let session = new TerminalSession();

  let output = "";
  session.subscribe_output((x) => {
    output = x;
  });

  let current_prompt = prompt();

  let input_elem: HTMLInputElement;
</script>

<div class="wrapper" on:click={() => input_elem.focus()} on:keypress={() => {}}>
  <pre class="content">{output}</pre>
  <div class="input">
    <div class="prompt">{current_prompt}&nbsp;</div>
    <input
      class="input"
      type="text"
      bind:value={session.input}
      bind:this={input_elem}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          session.write(`${current_prompt} ${session.input}\n`);
          handler(session.input, (s) => {
            session.write(s);
          });
          current_prompt = prompt();
          session.input = "";
        }
      }}
    />
  </div>
</div>

<style>
  .wrapper {
    border: 1px solid black;
    width: 100%;
    margin: 0 10px;
    padding: 10px;
    border-radius: 5px;

    height: 30rem;
    background-color: #444;
    color: #eee;

    font-family: "Fira Code Light", "Roboto Mono", monospace;
    font-size: 18px;

    overflow: scroll;
  }

  .wrapper > *,
  .wrapper > * > * {
    font: inherit;
    background-color: transparent;

    box-sizing: border-box;
  }

  .wrapper > .content {
    margin: 0px;
    padding: 0px;

    overflow: hidden;
  }

  .wrapper > .input {
    position: relative;
    height: 1em;

    display: flex;
    width: 100%;
  }

  .wrapper > .input > * {
    height: 1em;

    padding: 0;
    margin: 0;
  }
  .wrapper > .input > input {
    flex-grow: 1;
    padding: 0 auto 0 0;
    color: #fff;

    border: none;
    outline: none;
  }
</style>
