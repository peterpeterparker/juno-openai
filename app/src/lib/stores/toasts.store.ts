import type { ToastLevel, ToastMsg } from '$lib/types/toast';
import { errorDetailToString } from '$lib/utils/error.utils';
import { nonNullish } from '@dfinity/utils';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

export interface ToastsStore extends Readable<ToastMsg[]> {
	error: (params: { msg: Omit<ToastMsg, 'level'>; err?: unknown }) => void;
	show: (msg: ToastMsg) => void;
	success: (text: string) => void;
	hide: () => void;
	reset: (levels?: ToastLevel[]) => void;
	clean: () => void;
}

const initToastsStore = (): ToastsStore => {
	const { subscribe, update, set } = writable<ToastMsg[]>([]);

	return {
		subscribe,

		error({ msg: { text, ...rest }, err }: { msg: Omit<ToastMsg, 'level'>; err?: unknown }) {
			if (nonNullish(err)) {
				console.error(err);
			}

			this.show({
				text: `${text}${nonNullish(err) ? ` / ${errorDetailToString(err)}` : ''}`,
				...rest,
				level: 'error'
			});
		},

		show(msg: ToastMsg) {
			update((messages: ToastMsg[]) => [...messages, msg]);
		},

		success(text: string) {
			this.show({
				text,
				level: 'info',
				duration: 2000
			});
		},

		hide() {
			update((messages: ToastMsg[]) => messages.slice(1));
		},

		reset(levels?: ToastLevel[]) {
			if (nonNullish(levels) && levels.length > 0) {
				update((messages: ToastMsg[]) => messages.filter(({ level }) => !levels.includes(level)));
				return;
			}

			set([]);
		},

		clean() {
			this.reset(['info', 'warn', 'info']);
		}
	};
};

export const toasts = initToastsStore();
