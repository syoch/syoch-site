<script lang="ts">
  import SizedTextarea from "@components/SizedTextarea.svelte";

  import Parser from "./cafecode";

  let source = "";
  let converted = "";

  $: source = source
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "")
    .split(/(................)/)
    .filter(Boolean)
    .map((x) => `${x.slice(0, 8)} ${x.slice(8)}`)
    .join("\n")
    .trim();

  $: {
    let parser = new Parser(source);
    let ast = parser.parse();
    converted = ast.map((v) => v.toString()).join("\n");
  }
</script>

<div style:display="flex" style:height="100%">
  <SizedTextarea
    width="50%"
    height="100%"
    style="margin: 0px; box-sizing: border-box;"
    bind:value={source}
  />
  <div style:width="16px" />
  <SizedTextarea
    width="50%"
    height="100%"
    style="margin: 0px; box-sizing: border-box;"
    bind:value={converted}
  />
</div>

<style>
  :global(.highlight-cyan) {
    background-color: #2edcff69;
  }
</style>
