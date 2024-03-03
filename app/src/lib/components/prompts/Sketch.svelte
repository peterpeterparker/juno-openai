<script lang="ts">
	import Canvas from '$lib/components/prompts/Canvas.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import IconCamera from '$lib/components/icons/IconCamera.svelte';
	import { uploadBlob } from '@junobuild/core-peer';
	import { nanoid } from 'nanoid';
	import { isNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { canvasToBlob } from '$lib/utils/canvas.utils';
	import { busy } from '$lib/stores/busy.store';
	import { keyStore } from '$lib/stores/app.stores';
	import PromptAction from '$lib/components/prompts/PromptAction.svelte';

	let canvas: HTMLCanvasElement | undefined | null;
	let untouched: boolean;

	const snapshot = async () => {
		if (isNullish(canvas)) {
			toasts.error({
				msg: { text: "No canvas defined. That's quite unexpected." }
			});
			return;
		}

		if (untouched) {
			toasts.error({
				msg: { text: 'Please draw something first.' }
			});
			return;
		}

		busy.start();

		try {
			const blob = await canvasToBlob({ canvas, type: 'image/png' });

			if (isNullish(blob)) {
				toasts.error({
					msg: { text: "The canvas couldn't be converted to a blob. Weird 🤔." }
				});
				return;
			}

			const { fullPath } = await uploadBlob({
				data: blob,
				collection: 'sketches',
				filename: `${nanoid()}.png`
			});

			keyStore.set(fullPath);
		} catch (err: unknown) {
			toasts.error({
				msg: { text: 'Something went wrong while uploading your drawing.' },
				err
			});
		}

		busy.stop();
	};
</script>

<Canvas bind:canvas bind:untouched />

<PromptAction>
	<Button color="quaternary" on:click={async () => await snapshot()}>
		<IconCamera /> Snapshot
	</Button>

	<svelte:fragment slot="done">Sketch saved</svelte:fragment>
</PromptAction>
