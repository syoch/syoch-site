<script lang="ts">
  import Card, { Content, PrimaryAction, Media } from "@smui/card";

  export let url: string;
  export let name: string;
  export let description: string;
  export let icon_url: string;

  export let width: string = "200px";
</script>

<Card style="width: {width}; margin: 8px;">
  <div style="padding: 1rem;">
    <h2 class="mdc-typography--headline6" style="margin: 0;">{name}</h2>
  </div>
  <PrimaryAction
    on:click={() => {
      document.location = url;
    }}
  >
    <Media style="background-image: url({icon_url});" aspectRatio="square" />
    <Content class="mdc-typography--body2">
      {description}
    </Content>
  </PrimaryAction>
</Card>
