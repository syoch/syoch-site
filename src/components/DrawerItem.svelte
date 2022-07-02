<script lang="ts">
  import { Item } from "@smui/list";
  import IconText from "./IconText.svelte";

  export let icon: string = "";
  export let name: string = "";

  export let active: string;
  export let open: boolean;
</script>

<Item
  href="javascript:void(0)"
  on:click={() => {
    active = name;
    open = false;
  }}
  activated={active === name}
>
  <IconText {icon} text={name} />
</Item>
