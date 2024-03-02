<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';
	import { isBusy } from '$lib/derived/busy.derived';

	export let transparent = false;
	export let disablePointerEvents = false;

	const dispatch = createEventDispatcher();
	const close = () => dispatch('vrcClose');

	const FADE_IN_DURATION = 75 as const;
	const FADE_OUT_DURATION = 250 as const;
</script>

<div
	role="button"
	tabindex="-1"
	aria-label="Close"
	in:fade|global={{ duration: FADE_IN_DURATION }}
	out:fade|global={{ duration: FADE_OUT_DURATION }}
	class={`backdrop ${transparent ? '' : 'backdrop-blur-sm bg-black/10'}`}
	on:click|stopPropagation={close}
	on:keypress={($event) => handleKeyPress({ $event, callback: close })}
	class:disablePointerEvents={disablePointerEvents || $isBusy}
	data-tid="backdrop"
/>

<style lang="scss">
	@use '../../../lib/styles/mixins/interaction';
	@use '../../../lib/styles/mixins/display';

	.backdrop {
		position: absolute;
		@include display.inset;

		z-index: var(--backdrop-z-index);

		@include interaction.tappable;

		&.disablePointerEvents {
			@include interaction.none;
		}
	}
</style>
