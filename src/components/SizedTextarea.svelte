<script lang="ts">
  import Textfield from "@smui/textfield";

  export let value: string;
  export let style = "";
  export let font = "monospace";
  export let height: string;
  export let width: string;

  let field = null;

  if (font == "monospace") {
    font = "'Fira Code Light', monospace";
  }

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
  class="sized-textfield"
/>
