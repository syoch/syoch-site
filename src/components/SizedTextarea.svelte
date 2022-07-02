<script lang="ts">
  import Textfield, { TextfieldComponentDev } from "@smui/textfield";

  export let value: string;
  export let style = "";
  export let font = "monospace";
  export let height: string;
  export let width: string;

  let field: TextfieldComponentDev = null;

  export let textarea: HTMLTextAreaElement = null;
  $: if (field) {
    textarea = field.getElement().children[1]
      .children[0] as HTMLTextAreaElement;
  }
</script>

<Textfield
  textarea
  bind:value
  bind:this={field}
  input$resizable={false}
  style="height: {height}; width: {width}; {style};"
  input$style="margin: 0px; padding: 16px; height: 100%; width: 100%; font-family: {font};"
  class="textfield"
/>

<style>
  :global(.textfield > span) {
    height: 100%;
    width: 100%;
  }
</style>
