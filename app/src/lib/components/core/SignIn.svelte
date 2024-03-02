<script lang="ts">
	import { signIn } from '$lib/services/auth.services';
	import Button from '$lib/components/ui/Button.svelte';
	import IconICMonochrome from '$lib/components/icons/IconICMonochrome.svelte';
</script>

<Button color="quaternary" on:click={async () => await signIn()}>
	<IconICMonochrome /> Continue with Internet Identity
</Button>
