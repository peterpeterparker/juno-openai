import { writable, type Readable } from 'svelte/store';

// An app wide busy state

export interface Busy {
	spinner: boolean;
	close: boolean;
}

export interface BusyStore extends Readable<Busy | undefined> {
	start: () => void;
	show: () => void;
	stop: () => void;
}

const initBusyStore = (): BusyStore => {
	const { subscribe, set } = writable<Busy | undefined>(undefined);

	return {
		subscribe,

		start() {
			set({ spinner: true, close: false });
		},

		show() {
			set({ spinner: true, close: true });
		},

		stop() {
			set(undefined);
		}
	};
};

export const busy = initBusyStore();

// A particular busy state used in wizards

export interface WizardBusyData {
	metadata: boolean;
	content: boolean;
}

export interface BusyWizardStore extends Readable<WizardBusyData> {
	start: (id: keyof WizardBusyData) => void;
	stop: (id: keyof WizardBusyData) => void;
}

const initWizardBusyStore = (): BusyWizardStore => {
	const { subscribe, update } = writable<WizardBusyData>({
		metadata: false,
		content: false
	});

	return {
		subscribe,

		start(id: keyof WizardBusyData) {
			update((state) => ({ ...state, [id]: true }));
		},

		stop(id: keyof WizardBusyData) {
			update((state) => ({ ...state, [id]: false }));
		}
	};
};

export const wizardBusy = initWizardBusyStore();
