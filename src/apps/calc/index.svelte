<script lang="ts">
  // import Fab, { Icon } from "@smui/fab";
  import Button, { Icon } from "@smui/button";

  const html_mapping = {
    and: "&#x2227;",
    or: "&#x2228;",
    xor: "&#x2295;",
    lsht: "&#x2A02;",
    rsht: "&#x2192;",
    not: "&#x00AC;",
  };
  const icon_mapping = {
    BS: "backspace",
  };
  const config = {
    grid: [
      ["bits", "encode", "presicion", "AC", "( )", "/"],
      ["or", "and", "7", "8", "9", "*"],
      ["not", "xor", "4", "5", "6", "-"],
      ["neg2", "neg1", "1", "2", "3", "+"],
      ["negs", "neg", "0", ".", "BS", "="],
    ],
  };
</script>

<div style="height: 30%; position: relative;">
  <div style="position: absolute; bottom: 30%;">
    LOG <br />
    LOG2 <br />
    LOG3 <br />
  </div>
  <div
    style:position="absolute"
    style:bottom="0"
    style:left="0"
    style:height="30%"
    style:width="100%"
  >
    <span
      style:position="absolute"
      style:top="50%"
      style:left="50%"
      style:transform="translate(-50%,-50%)"
      style:font-size="x-large"
    >
      hello world!
    </span><br />
    <span
      style:position="absolute"
      style:bottom="0"
      style:right="0"
      style:font-size="large"
    >
      => (00000)_{2}
    </span><br />
  </div>
</div>

<div id="input_form">
  {#each config.grid as row, r}
    {#each row as cell, c}
      <Button
        style="grid-row: {r + 1}; grid-column: {c + 1}; height: 100%;"
        variant="text"
      >
        {#if cell in html_mapping}
          {@html html_mapping[cell]}
        {:else if cell in icon_mapping}
          <Icon class="material-icons">{icon_mapping[cell]}</Icon>
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
