<script lang="ts">
  import InlineConverter from "@components/InlineConverter.svelte";
  import Textfield from "@smui/textfield";

  let d = new cs.Capstone(cs.ARCH_PPC, cs.MODE_BIG_ENDIAN);

  let value = "";
  let code: Array<number>;
  let copy_buffer: string;
  let disassembled: Array<any> = [{ mnemonic: "", op_str: "" }];

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
    disassembled = d.disasm(code, offset, 0);
  } catch (error) {
    disassembled = [{ mnemonic: "Error", op_str: "" }];
  }

  $: copy_buffer = disassembled
    .filter((_, i) => selection_range_start <= i && i <= selection_range_end)
    .map((x) => `${x.mnemonic ?? ""} ${x.op_str ?? ""}`)
    .join("\n");

  let offset_str = "02000000";
  $: offset_str = offset_str.replace(/[^0-9a-fA-F]/g, "");

  let offset = 0;
  $: offset = offset_str ? parseInt(offset_str, 16) : 0;

  let selection_start = 0;
  let selection_end = 0;

  $: selection_range_start = Math.floor(selection_start / 9);
  $: selection_range_end = Math.floor(selection_end / 9);
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
        class:highlight-cyan={selection_range_start <= i &&
          i <= selection_range_end}
      >
        {asm.mnemonic ?? ""}
        {asm.op_str ?? ""}
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
