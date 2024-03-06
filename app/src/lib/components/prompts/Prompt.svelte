<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import { keyLoaded, keyNotLoaded } from '$lib/derived/asset.derived';
	import PromptAction from '$lib/components/prompts/PromptAction.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import IconSave from '$lib/components/icons/IconSave.svelte';
	import { notEmptyString } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { setDoc } from '@junobuild/core-peer';
	import { nanoid } from 'nanoid';
	import { keyStore } from '$lib/stores/app.stores';
	import type { PromptData } from '$lib/types/juno';

	let editable = true;
	$: editable = $keyNotLoaded;

	let text = '';

	const save = async () => {
		if (!notEmptyString(text)) {
			toasts.error({
				msg: { text: 'Please provide a prompt.' }
			});
			return;
		}

		busy.start();

		try {
			const key = nanoid();

			await setDoc<PromptData>({
				collection: 'prompts',
				doc: {
					key,
					data: {
						prompt: text
					}
				}
			});

			alert("TODO: implement the process, locally!");

			keyStore.set(key);
		} catch (err: unknown) {
			toasts.error({
				msg: { text: 'Something went wrong while saving your prompt.' },
				err
			});
		}

		busy.stop();
	};
</script>

<Container disabled={!editable}>
	<textarea
		bind:value={text}
		class="w-full h-full resize-none outline-none p-2 placeholder-gray-300"
		placeholder="Enter your prompt."
		disabled={$keyLoaded}
		class:opacity-50={$keyLoaded}
	></textarea>
</Container>

<PromptAction>
	<Button color="quaternary" on:click={async () => await save()} disabled={$keyLoaded}>
		<IconSave /> Save prompt
	</Button>

	<svelte:fragment slot="done">Prompt saved</svelte:fragment>
</PromptAction>
