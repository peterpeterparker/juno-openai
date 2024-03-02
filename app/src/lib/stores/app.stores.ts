import type { Prompt } from '$lib/types/prompt';
import { writable } from 'svelte/store';

export const keyStore = writable<string | undefined>(undefined);

export const promptStore = writable<Prompt>('write');
