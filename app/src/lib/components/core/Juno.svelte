<script lang="ts">
	import { onMount } from 'svelte';
	import { initJuno } from '@junobuild/core-peer';
	import { isNullish } from '@dfinity/utils';
	import { displayAndCleanLogoutMsg, toastAndReload } from '$lib/services/auth.services';
	import { initOrbiter } from '@junobuild/analytics';
	import { CONTAINER, DEV, ORBITER_ID, SATELLITE_ID } from '$lib/constants/app.constants';

	onMount(async () => {
		await Promise.all([
			initJuno({
				satelliteId: SATELLITE_ID,
				container: CONTAINER,
				workers: {
					auth: true
				}
			}),
			...(DEV || isNullish(ORBITER_ID)
				? []
				: [
						initOrbiter({
							satelliteId: SATELLITE_ID!,
							orbiterId: ORBITER_ID,
							container: CONTAINER
						})
					])
		]);

		displayAndCleanLogoutMsg();
	});

	const automaticSignOut = () =>
		toastAndReload({
			text: 'You have been logged out because your session has expired.',
			level: 'warn'
		});
</script>

<svelte:window on:junoSignOutAuthTimer={automaticSignOut} />

<slot />
