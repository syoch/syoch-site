<script lang="ts">
  import Paper, { Title, Content } from "@smui/paper";
  import IconText from "@components/LeadingIcon.svelte";

  import { contacts } from "@datas/introducation";
</script>

<Paper>
  <Title>Contact</Title>

  <Content>
    {#each contacts as contact}
      <IconText icon={contact.icon}>
        {contact.name}:&nbsp;
        {#if contact.href}
          <a href={contact.href} class="l">{contact.link_text}</a>
        {/if}
        {#if contact.text}
          {contact.text}
        {/if}
      </IconText>
    {/each}
  </Content>
</Paper>

<style>
  .l {
    color: #00bcd4;
    text-decoration: none;
  }

  .l:hover {
    text-decoration: underline;
  }
</style>
