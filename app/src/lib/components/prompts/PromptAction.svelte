<script lang="ts">
	import { userInitialized, userNotSignedIn } from '$lib/derived/user.derived';
	import { fade } from 'svelte/transition';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import { keyNotLoaded } from '$lib/derived/asset.derived';
	import Label from '$lib/components/ui/Label.svelte';
	import IconDone from '$lib/components/icons/IconDone.svelte';
</script>

{#if $userInitialized}
	{#if $userNotSignedIn}
		<div in:fade class="my-8">
			<SignIn />
		</div>
	{:else if $keyNotLoaded}
		<div in:fade class="my-8">
			<slot />
		</div>
	{:else}
		<div in:fade>
			<Label>
				<span><slot name="done" /></span>
				<IconDone />
			</Label>
		</div>
	{/if}
{/if}
