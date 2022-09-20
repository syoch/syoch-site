<script lang="ts">
  import InlineConverter from "@components/InlineConverter.svelte";
  import Textfield from "@smui/textfield";
  import { FoldingProcessor } from "./ppc_folding";

  let d = new cs.Capstone(cs.ARCH_PPC, cs.MODE_BIG_ENDIAN);

  let selection_start = 0;
  let selection_line_start;
  $: selection_line_start = Math.floor(selection_start / 9);

  let selection_end = 0;
  let selection_line_end;
  $: selection_line_end = Math.floor(selection_end / 9);

  let value =
    "38 60 00 02\n" + // li      r3,2
    "3d 80 02 00\n" + // lis     r12,512
    "61 8c 00 40\n" + // ori     r12,r12,64
    "7d 89 03 a6\n" + // mtctr   r12
    "4e 80 04 21\n" + // bctrl
    "38 80 00 03\n" + // li      r4,3
    "3d 80 02 00\n" + // lis     r12,512
    "61 8c 00 80\n" + // ori     r12,r12,128
    "7d 89 03 a6\n" + // mtctr   r12
    "4e 80 04 21\n" + // bctrl
    "3d 80 20 00\n" + // lis     r12,8192
    "81 8c 02 00\n" + // lwz     r12,0x0200(r12)
    "7d 89 03 a6\n" + // mtctr   r12
    "4e 80 04 21\n" + // bctrl
    "";

  $: value = value
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase()
    .split(/(.{8})/g)
    .filter(Boolean)
    .join("\n");

  let disassembled: cs.Instruction[] = [];
  $: try {
    disassembled = d.disasm(
      value
        .split(/(..)/)
        .filter((x) => x.length == 2)
        .map((x) => parseInt(x, 16)),
      offset,
      0
    );
  } catch (error) {
    disassembled = [];
  }

  let folded: string[] = [];
  $: {
    let p = new FoldingProcessor();
    folded = disassembled.map((x) => {
      try {
        let f = p.foldInstruction(x);
        return f ? "# " + f : "";
      } catch (e) {
        return "";
      }
    });
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
    {#each disassembled
      .map((x) => `${x.mnemonic ?? ""} ${x.op_str ?? ""}`)
      .map((x) => x.trim()) as asm, i}
      {@html "&nbsp;".repeat(8) + "|"}
      <span
        class:highlight-cyan={selection_line_start <= i &&
          i <= selection_line_end}
      >
        {asm}
        {@html "&nbsp;".repeat(20 - asm.length)}
      </span>
      <span style:background_color="ff0000">
        {folded[i]}
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
