import { userStore } from '$lib/stores/user.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const userInitialized: Readable<boolean> = derived(userStore, (user) => user !== undefined);

export const userNotInitialized: Readable<boolean> = derived(
	userInitialized,
	(initialized) => !initialized
);

export const userSignedIn: Readable<boolean> = derived(userStore, nonNullish);

export const userNotSignedIn: Readable<boolean> = derived(userSignedIn, (signedIn) => !signedIn);
