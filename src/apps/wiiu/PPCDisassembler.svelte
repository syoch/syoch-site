<script lang="ts">
  import InlineConverter from "@components/InlineConverter.svelte";
  import Textfield from "@smui/textfield";

  let d = new cs.Capstone(cs.ARCH_PPC, cs.MODE_BIG_ENDIAN);

  let selection_start = 0;
  let selection_line_start;
  $: selection_line_start = Math.floor(selection_start / 9);

  let selection_end = 0;
  let selection_line_end;
  $: selection_line_end = Math.floor(selection_end / 9);

  let value =
    "38600002\n" +
    "3d800200\n" +
    "618c0040\n" +
    "7d8903a6\n" +
    "4e800421\n" +
    "38800003\n" +
    "3d800200\n" +
    "618c0080\n" +
    "7d8903a6\n" +
    "4e800421";
  let code: Array<number>;
  let disassembled: string[] = [];

  $: value = value
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase()
    .split(/(.{8})/g)
    .filter(Boolean)
    .join("\n");

  $: code = value
    .replace(/[^0-9a-fA-F]/g, "")
    .split(/(..)/)
    .slice(1)
    .filter((x) => x.length == 2)
    .map((x) => parseInt(x, 16));

  $: try {
    disassembled = d
      .disasm(code, offset, 0)
      .map((x) => `${x.mnemonic ?? ""} ${x.op_str ?? ""}`);
  } catch (error) {
    disassembled = [];
  }

  let copy_buffer: string;
  $: copy_buffer = disassembled
    .filter((_, i) => selection_line_start <= i && i <= selection_line_end)
    .join("\n");

  let offset_str = "02000000";
  $: offset_str = offset_str.replace(/[^0-9a-fA-F]/g, "");

  let offset = 0;
  $: offset = offset_str ? parseInt(offset_str, 16) : 0;
</script>

<InlineConverter
  bind:value
  bind:copy_buffer
  bind:selection_start
  bind:selection_end
>
  <svelte:fragment slot="configurations">
    <Textfield bind:value={offset_str} style="flex: 1;" label="Offset" />
  </svelte:fragment>

  <svelte:fragment slot="overlay">
    {#each disassembled as asm, i}
      {@html "&nbsp;".repeat(8) + "|"}
      <span
        class:highlight-cyan={selection_line_start <= i &&
          i <= selection_line_end}
      >
        {asm}
      </span>
      <br />
    {/each}
  </svelte:fragment>
</InlineConverter>

<style>
  :global(.highlight-cyan) {
    background-color: #2edcff69;
  }
</style>
