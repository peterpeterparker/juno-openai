import type { UserOption } from '$lib/types/user';
import { authSubscribe, type User } from '@junobuild/core-peer';
import { readable } from 'svelte/store';

export type UserStore = UserOption;

const initUserStore: UserOption = undefined;

const start = (set: (store: UserStore) => void) => {
	const subscriber: () => void = authSubscribe((user: User | null) => {
		set(user);
	});

	return function stop() {
		subscriber?.();
		set(initUserStore);
	};
};

export const userStore = readable<UserStore>(initUserStore, start);
