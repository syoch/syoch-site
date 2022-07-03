<script lang="ts">
	import Drawer, {
		Content,
		Header,
		Title as DrawerTitle,
		Subtitle,
		AppContent,
	} from "@smui/drawer";
	import List, { Separator, Subheader } from "@smui/list";
	import { H6 } from "@smui/common/elements";
	import TopAppBar, { Section, Title } from "@smui/top-app-bar";
	import IconButton from "@smui/icon-button";

	import DrawerItem from "@components/DrawerItem.svelte";

	import CafeCode from "./apps/wiiu/CafeCode.svelte";
	import PNGExtractor from "./apps/tools/PNGExtractor.svelte";
	import HexAdder from "./apps/tools/HexAdder.svelte";
	import PPCDisassembler from "./apps/wiiu/PPCDisassembler.svelte";
	import Introducation from "./apps/Introducation/index.svelte";
	import Calc from "./apps/calc/index.svelte";

	let active = "Calculator";
	let open = false;
</script>

<Drawer variant="dismissible" bind:open>
	<Header>
		<DrawerTitle>syoch's home page</DrawerTitle>
		<Subtitle>nankairoiro</Subtitle>
	</Header>

	<Content>
		<List>
			<DrawerItem name="syoch" icon="contact_mail" bind:active bind:open />
			<Separator />

			<Subheader component={H6}>Converters</Subheader>
			<DrawerItem
				name="Cafecode Converter"
				icon="sports_esports"
				bind:active
				bind:open
			/>
			<DrawerItem
				name="PowerPC Disassembler"
				icon="undo"
				bind:active
				bind:open
			/>

			<Separator />

			<Subheader component={H6}>Tools</Subheader>
			<DrawerItem
				name="PNG Extractor"
				icon="filter_list"
				bind:active
				bind:open
			/>
			<DrawerItem name="HEX Adder" icon="hexagon" bind:active bind:open />
			<DrawerItem name="Calculator" icon="hexagon" bind:active bind:open />
		</List>
	</Content>
</Drawer>

<AppContent class="app-content">
	<TopAppBar variant="static" class="app-bar">
		<Section>
			<IconButton
				class="material-icons"
				on:click={() => {
					open = !open;
				}}>menu</IconButton
			>
			<Title>{active}</Title>
		</Section>
	</TopAppBar>

	<main class="main-content">
		{#if active == "Cafecode Converter"}
			<CafeCode />
		{:else if active == "PowerPC Disassembler"}
			<PPCDisassembler />
		{:else if active == "PNG Extractor"}
			<PNGExtractor />
		{:else if active == "HEX Adder"}
			<HexAdder />
		{:else if active == "syoch"}
			<Introducation />
		{:else if active == "Calculator"}
			<Calc />
		{/if}
	</main>
</AppContent>

<style>
	:global(.app-content) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		padding: 16px;
		flex: 1;
	}
</style>
