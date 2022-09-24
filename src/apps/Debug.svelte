<script lang="ts">
  import { generate_user_id } from "@src/wasm/pkg/wasm";

  let id = "";
  try {
    id = generate_user_id();
  } catch (e) {
    id = e.toString();
  }
</script>

<button
  on:click={() => {
    id = generate_user_id();
  }}>Regenerate ID: {id}</button
>
