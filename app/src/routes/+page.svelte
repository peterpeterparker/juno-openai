<script lang="ts">
	import Juno from '$lib/components/core/Juno.svelte';
	import Draw from '$lib/components/prompts/Draw.svelte';
	import Drawing from '$lib/components/results/Drawing.svelte';
	import Write from '$lib/components/prompts/Write.svelte';
	import { fade } from 'svelte/transition';
	import { promptStore } from '$lib/stores/app.stores';
</script>

<Juno>
	<aside
		class="bg-yellow-200 border-b-2 lg:border-b-0 lg:border-r-2 border-black pt-28 md:pt-36 pb-16 px-24"
	>
		{#if $promptStore === 'draw'}
			<div in:fade class="w-full h-full flex flex-col items-center">
				<Draw />
			</div>
		{:else}
			<div in:fade class="w-full h-full flex flex-col items-center">
				<Write />
			</div>
		{/if}
	</aside>

	<section class="bg-cyan-200 pt-28 md:pt-36 pb-16 px-24 flex flex-col items-center min-h-dvh">
		<Drawing />
	</section>
</Juno>
