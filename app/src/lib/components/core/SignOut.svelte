<script lang="ts">
	import { signOut } from '$lib/services/auth.services';
</script>

<button on:click={async () => await signOut()}>Sign-out</button>
