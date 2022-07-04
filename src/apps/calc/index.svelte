<script lang="ts">
  import Button, { Icon } from "@smui/button";

  let log: String[] = [];
  let formula: string = "";

  $: console.log(log);

  const html_mapping = {
    and: "&#x2227;",
    or: "&#x2228;",
    xor: "&#x2295;",
    lsht: "&#x2A02;",
    rsht: "&#x2192;",
    not: "&#x00AC;",
    PARENTSIS: "( )",
  };
  const text_mapping = {
    ONE: "1",
    TWO: "2",
    THREE: "3",
    FOUR: "4",
    FIVE: "5",
    SIX: "6",
    SEVEN: "7",
    EIGHT: "8",
    NINE: "9",
    ZERO: "0",
    DOT: ".",

    DIV: "/",
    MUL: "*",
    SUB: "-",
    ADD: "+",

    xor: "^",
    or: "|",
    and: "&",
    lsht: "<<",
    rsht: ">>",
    not: "~",

    neg1: " as neg1",
    neg2: " as neg2",
    negs: " as negs",
  };
  const display_mapping = {
    ONE: "1",
    TWO: "2",
    THREE: "3",
    FOUR: "4",
    FIVE: "5",
    SIX: "6",
    SEVEN: "7",
    EIGHT: "8",
    NINE: "9",
    ZERO: "0",
    DOT: ".",

    DIV: "/",
    MUL: "*",
    SUB: "-",
    ADD: "+",

    xor: "^",
    or: "|",
    and: "&",
    lsht: "<<",
    rsht: ">>",
    not: "~",

    neg1: " as neg1",
    neg2: " as neg2",
    negs: " as negs",
  };
  const icon_mapping = {
    BS: "backspace",
  };
  const config = {
    grid: [
      ["bits", "encode", "presicion", "AC", "PARENTSIS", "DIV"],
      ["or", "and", "SEVEN", "EIGHT", "NINE", "MUL"],
      ["not", "xor", "FOUR", "FIVE", "SIX", "SUB"],
      ["neg2", "neg1", "ONE", "TWO", "THREE", "ADD"],
      ["negs", "neg", "ZERO", "DOT", "BS", "="],
    ],
  };
</script>

<div style="height: 30%; position: relative;">
  <div style="position: absolute; bottom: 30%;">
    {#each log as line}
      {line} <br />
    {/each}
  </div>
  <span
    style:position="absolute"
    style:top="85%"
    style:left="50%"
    style:transform="translate(-50%,-50%)"
    style:font-size="x-large"
  >
    {formula}
  </span>
  <span
    style:position="absolute"
    style:bottom="0"
    style:right="0"
    style:font-size="large"
  >
    => (00000)_{2}
  </span>
</div>

<div id="input_form">
  {#each config.grid as row, r}
    {#each row as cell, c}
      <Button
        style="grid-row: {r + 1}; grid-column: {c + 1}; height: 100%;"
        variant="text"
        on:click={() => {
          formula += display_mapping[cell] || ` ${cell} `;
          log.push(cell);
          log = log;
        }}
      >
        {#if cell in html_mapping}
          <span style="font-size: 5vw;">{@html html_mapping[cell]}</span>
        {:else if cell in text_mapping}
          <span style="font-size: 5vw;">{@html text_mapping[cell]}</span>
        {:else if cell in icon_mapping}
          <Icon class="material-icons" style="font-size: 5vw;"
            >{icon_mapping[cell]}</Icon
          >
        {:else if cell === ""}
          &nbsp;
        {:else}
          {cell}
        {/if}
      </Button>
    {/each}
  {/each}
</div>

<style>
  #input_form {
    border-top: 1px solid black;
    display: grid;
    height: 70%;
    grid-template-rows: repeat(5, 1fr);
    grid-template-columns: repeat(6, 1fr);
  }
</style>
