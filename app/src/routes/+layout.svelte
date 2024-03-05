<script lang="ts">
	import '$lib/styles/global.scss';
	import Header from '$lib/components/core/Header.svelte';
	import Busy from '$lib/components/ui/Busy.svelte';
	import Toasts from '$lib/components/ui/Toasts.svelte';
	import { layoutOverflowY } from '$lib/stores/app.stores';
</script>

<Header />

<main
	class="w-full h-full max-h-dvh"
	class:overflow-y-auto={$layoutOverflowY === 'auto'}
	class:overflow-y-hidden={$layoutOverflowY === 'hidden'}
>
	<section class="flex flex-col lg:grid grid-cols-2 min-h-screen">
		<slot />
	</section>
</main>

<Busy />
<Toasts />
