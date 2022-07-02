<script lang="ts">
  import SizedTextarea from "./SizedTextarea.svelte";

  export let value: string;
  export let style = "";
  export let font = "monospace";
  export let textarea: HTMLTextAreaElement = null;
</script>

<SizedTextarea
  width="100%"
  height="100%"
  bind:value
  bind:style
  bind:font
  bind:textarea
/>
