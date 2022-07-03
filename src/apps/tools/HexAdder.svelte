<script lang="ts">
  import Textfield from "@smui/textfield";

  let inp = "00000000";
  let diff = "";

  const diff_storage = localStorage.getItem("diff");
  if (diff_storage) {
    diff = diff_storage;
  }

  $: localStorage.setItem("diff", diff);
</script>

<Textfield bind:value={inp} label="Input" /><br />
added value: {(parseInt(inp, 16) + parseInt(diff, 16)).toString(16)}<br />

<Textfield bind:value={diff} label="A value to add" />
