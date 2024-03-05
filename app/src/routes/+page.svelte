<script lang="ts">
	import Juno from '$lib/components/core/Juno.svelte';
	import Sketch from '$lib/components/prompts/Sketch.svelte';
	import Renderings from '$lib/components/results/Renderings.svelte';
	import Prompt from '$lib/components/prompts/Prompt.svelte';
	import { fade } from 'svelte/transition';
	import { promptStore } from '$lib/stores/app.stores';
</script>

<Juno>
	<aside
		class="bg-yellow-200 border-b-2 lg:border-b-0 lg:border-r-2 border-black pt-28 md:pt-36 md:pb-8 md:px-24 px-8"
	>
		{#if $promptStore === 'draw'}
			<div in:fade class="w-full h-full flex flex-col items-center">
				<Sketch />
			</div>
		{:else}
			<div in:fade class="w-full h-full flex flex-col items-center">
				<Prompt />
			</div>
		{/if}
	</aside>

	<section class="bg-cyan-200 pt-12 md:pt-36 pb-12 md:pb-8 md:px-24 px-8 flex flex-col items-center min-h-[50dvh] md:min-h-dvh">
		<Renderings />
	</section>
</Juno>
