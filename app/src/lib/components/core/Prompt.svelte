<script lang="ts">
	import { promptStore } from '$lib/stores/app.stores';
	import InputSelect from '$lib/components/ui/InputSelect.svelte';
	import IconPencil from '$lib/components/icons/IconPencil.svelte';
	import IconBrush from '$lib/components/icons/IconBrush.svelte';
	import { keyLoaded } from '$lib/derived/asset.derived';

	let prompt = $promptStore;

	const onChange = () => promptStore.set(prompt);
</script>

<InputSelect bind:value={prompt} on:change={onChange} disabled={$keyLoaded}>
	<option value="write">Write</option>
	<option value="draw">Draw</option>

	<div class="p-2" slot="logo">
		{#if prompt === 'write'}
			<IconPencil />
		{:else}
			<IconBrush />
		{/if}
	</div>
</InputSelect>
