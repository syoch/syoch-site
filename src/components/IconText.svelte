<script lang="ts">
  import { Text, Graphic } from "@smui/list";

  export let text: string;
  export let icon: string;
</script>

<Graphic class="material-icons" aria-hidden="true">{icon}</Graphic>
<Text>{text}</Text>
