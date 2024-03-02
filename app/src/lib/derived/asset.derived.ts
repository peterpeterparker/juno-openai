import { keyStore } from '$lib/stores/app.stores';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const keyLoaded: Readable<boolean> = derived(keyStore, nonNullish);

export const keyNotLoaded: Readable<boolean> = derived(keyStore, isNullish);
