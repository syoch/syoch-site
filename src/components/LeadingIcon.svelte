<script lang="ts">
  import Icon from "@iconify/svelte";

  export let icon: string;
</script>

<Icon icon="mdi:{icon}" inline={true} />
<slot /><br />
