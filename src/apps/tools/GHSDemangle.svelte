<script lang="ts">
  import Textfield from "@smui/textfield";
  import { ghs_demangle } from "@src/libs";

  let inp = "a__2ABFv";
</script>

<Textfield bind:value={inp} label="Input" /><br />
Demangled: {ghs_demangle(inp)}<br />
