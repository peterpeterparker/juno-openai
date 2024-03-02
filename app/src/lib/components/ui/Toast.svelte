<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { fade, fly } from 'svelte/transition';
	import type { ToastLevel, ToastMsg } from '$lib/types/toast';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { isNullish } from '@dfinity/utils';

	export let msg: ToastMsg;

	const close = () => toasts.hide();

	let text: string;
	let level: ToastLevel;
	let detail: string | undefined;

	$: ({ text, level, detail } = msg);

	let timer: number | undefined;

	onMount(() => {
		const { duration } = msg;

		if (!duration || duration <= 0) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore NodeJS.timeout vs number
		timer = setTimeout(close, duration);
	});

	onDestroy(() => clearTimeout(timer));

	let reorgDetail: string | undefined;
	$: detail,
		(() => {
			if (isNullish(detail)) {
				reorgDetail = undefined;
				return;
			}

			// Present the message we throw in the backend first
			const trapKeywords = 'trapped explicitly:' as const;

			if (!detail.includes(trapKeywords)) {
				reorgDetail = detail;
				return;
			}

			const splits = detail.split(trapKeywords);
			const last = splits.splice(-1);
			reorgDetail = `${last[0]?.trim() ?? ''}${
				splits.length > 0 ? ` | Stacktrace: ${splits.join('').trim()}` : ''
			}`;
		})();
</script>

<div
	role="alert"
	class="toast w-11/12 sm:max-w-lg flex items-center justify-between fixed bottom-2 left-1/2 shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black px-4 py-2"
	class:bg-orange-300={level === 'warn'}
	class:bg-red-400={level === 'error'}
	class:text-white={level === 'error'}
	class:bg-lime-200={level === 'info'}
	in:fly={{ y: 100, duration: 200 }}
	out:fade={{ delay: 100 }}
>
	<p title={text}>
		{text}{reorgDetail ? ` | ${reorgDetail}` : ''}
	</p>

	<button class="text" on:click={close} aria-label="Close"><IconClose /></button>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.toast {
		transform: translate(-50%, 0);
		z-index: calc(var(--z-index) + 999);
	}

	p {
		@include text.clamp(4);

		@include media.min-width(large) {
			@include text.clamp(3);
		}
	}
</style>
