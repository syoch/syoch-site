<script lang="ts">
  import Paper, { Title, Content } from "@smui/paper";

  import Organization from "./Organization.svelte";
  import { organizations } from "@datas/introducation";
</script>

<Paper>
  <Title>Github organizations which i joined</Title>
  <Content>
    <div style:display="flex">
      {#each organizations as organization}
        <Organization {...organization} />
      {/each}
    </div>
  </Content>
</Paper>
