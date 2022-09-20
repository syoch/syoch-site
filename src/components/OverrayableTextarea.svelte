<script lang="ts">
  import FullsizeTextarea from "./FullsizeTextarea.svelte";

  let overlay_element: HTMLElement = null;
  let value_textarea: HTMLTextAreaElement = null;

  // incoming props
  export let value: string;
  export let style = "";

  // outgoing props
  export let selection_start = 0;
  export let selection_end = 0;

  function init() {
    return new Promise((resolve, _reject) => {
      let interval = setInterval(() => {
        if (overlay_element && value_textarea) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  init().then(() => {
    value_textarea.addEventListener("scroll", () => {
      if (overlay_element) {
        overlay_element.scrollTop = value_textarea.scrollTop;
        overlay_element.scrollLeft = value_textarea.scrollLeft;
      }
    });

    value_textarea.addEventListener("selectionchange", () => {
      selection_start = value_textarea.selectionStart;
      selection_end = value_textarea.selectionEnd;
    });
  });

  $: if (value_textarea) {
    value_textarea.setSelectionRange(selection_start, selection_end);
  }
</script>

<div class="overlayable_textarea" style="${style}">
  <div
    bind:this={overlay_element}
    style="position:absolute; top: 0px; left: 0px; width: 100%; height:100%; overflow-y: scroll; padding: 16px; line-height: 1.5rem; font-family: 'Fira Code Light', monospace;letter-spacing: 0.009375rem; font-size: 1rem; font-weight: 400;"
  >
    <slot />
  </div>
  <FullsizeTextarea
    style="position:absolute; top: 0px; left: 0px;"
    bind:value
    bind:textarea={value_textarea}
  />
</div>

<style>
  .overlayable_textarea {
    height: 100%;
    width: 100%;
    position: relative;
  }
</style>
