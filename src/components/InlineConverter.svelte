<script lang="ts">
  import OverrayableTextarea from "./OverrayableTextarea.svelte";
  import Paper from "@smui/paper";
  import IconButton from "@smui/icon-button";

  // bind
  export let value = "";

  // imcoming
  export let copy_buffer: string;

  // outgoing
  export let selection_start = 0;
  export let selection_end = 0;
</script>

<div style="height: 100%; width: 100%; display: flex; flex-direction: column;">
  <Paper rows={1} style="display: flex;">
    <slot name="configurations" />

    <IconButton
      class="material-icons"
      on:click={() => {
        selection_start = 0;
        selection_end = value.length;
      }}>select_all</IconButton
    >
    <IconButton
      class="material-icons"
      on:click={() => {
        navigator.clipboard.writeText(copy_buffer);
      }}>content_copy</IconButton
    >
  </Paper>
  <OverrayableTextarea
    style="flex: 1;"
    bind:value
    bind:selection_start
    bind:selection_end
  >
    <slot name="overlay" />
  </OverrayableTextarea>
</div>
