<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import { fade } from 'svelte/transition';
	import Label from '$lib/components/ui/Label.svelte';
	import { keyStore } from '$lib/stores/app.stores';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { type Doc, getDoc } from '@junobuild/core-peer';
	import type { DocDrawingData } from '$lib/types/juno';
	import { onDestroy } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import IconDone from '$lib/components/icons/IconDone.svelte';
	import IconOpenAI from '$lib/components/icons/IconOpenAI.svelte';

	let state: 'awaiting' | 'processing' | 'processed' = 'awaiting';

	let doc: Doc<DocDrawingData> | undefined;

	// Simplistic approach. IRL this should be a recursive function until success with a max timeout.
	const loadDrawing = async () => {
		try {
			// We now the fullPath is defined here, just a simplification for demo purpose
			doc = await getDoc({
				collection: 'drawings',
				key: $keyStore!
			});

			if (nonNullish(doc)) {
				state = 'processed';

				clearInterval(timerDoc);
				clearInterval(timerDisplay);
			}
		} catch (err: unknown) {
			toasts.error({
				msg: { text: 'An unexpected error happened while fetching the results.' },
				err
			});
			return;
		}
	};

	// eslint-disable-next-line no-undef
	let timerDoc: NodeJS.Timeout;

	// eslint-disable-next-line no-undef
	let timerDisplay: NodeJS.Timeout;
	let counter = 1;

	const pollState = () => {
		if (isNullish($keyStore)) {
			state = 'awaiting';
			return;
		}

		state = 'processing';

		timerDoc = setInterval(loadDrawing, 2500);
		timerDisplay = setInterval(() => counter++, 1000);
	};

	$: $keyStore, pollState();

	onDestroy(() => {
		clearInterval(timerDoc);
		clearInterval(timerDisplay);
	});
</script>

{#if state === 'processing'}
	<div in:fade class="w-full">
		<Container>
			<div class="flex flex-col justify-center h-full">
				<div class="flex flex-col gap-2 items-center animate-bounce">
					<div class="animate-spin-slow"><IconOpenAI /></div>

					<p>Wait for it <small>({counter}s)</small>...</p>
				</div>
			</div>
		</Container>
	</div>
{:else if state === 'processed'}
	<div in:fade class="w-full">
		{#if nonNullish(doc)}
			<Container>
				{#if 'error' in doc.data}
					<span>{doc.data.error}</span>
				{:else}
					<div class="result">
						{#if doc.data.drawing.drawing_type === 'Svg'}
							<Html text={doc.data.drawing.content} />
						{:else}
							<img src={doc.data.drawing.content} alt="" loading="lazy" />
						{/if}
					</div>
				{/if}
			</Container>

			<Label>
				Generated <IconDone />
			</Label>
		{/if}
	</div>
{/if}

<style lang="scss">
	.result {
		overflow: auto;
		width: 100%;
		height: 100%;
	}
</style>
