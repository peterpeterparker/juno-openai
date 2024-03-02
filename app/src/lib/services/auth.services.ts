import { busy } from '$lib/stores/busy.store';
import { toasts } from '$lib/stores/toasts.store';
import type { ToastLevel, ToastMsg } from '$lib/types/toast';
import { replaceHistory } from '$lib/utils/route.utils';
import { isNullish } from '@dfinity/utils';
import { signIn as junoSignIn, signOut as junoSignOut } from '@junobuild/core-peer';

export const signIn = async () => {
	busy.show();

	try {
		await junoSignIn();

		// We clean previous messages in case user was signed out automatically before sign-in again.
		toasts.clean();

		return { success: 'ok' };
	} catch (err: unknown) {
		if (err === 'UserInterrupt') {
			// We do not display an error if user explicitly cancelled the process of sign-in
			return { success: 'cancelled' };
		}

		toasts.error({
			msg: { text: 'Something went wrong while sign-in.' },
			err
		});

		return { success: 'error', err };
	} finally {
		busy.stop();
	}
};

export const signOut = async () => {
	// To mask not operational UI (a side effect of sometimes slow JS loading after window.reload because of service worker and no cache).
	busy.start();

	await junoSignOut();

	reload();
};

export const toastAndReload = (msg: ToastMsg) => {
	appendMsgToUrl(msg);

	reload();
};

// We reload because agent-js has issue performing following sign-in if AuthClient is not reset. It will notably not be able to open new popup for II.
const reload = () => window.location.reload();

const PARAM_MSG = 'msg';
const PARAM_LEVEL = 'level';

/**
 * If a message was provided to the logout process - e.g. a message informing the logout happened because the session timed-out - append the information to the url as query params
 */
const appendMsgToUrl = (msg: ToastMsg) => {
	const { text, level } = msg;

	const url: URL = new URL(window.location.href);

	url.searchParams.append(PARAM_MSG, encodeURI(text));
	url.searchParams.append(PARAM_LEVEL, level);

	replaceHistory(url);
};

/**
 * If the url contains a msg that has been provided on logout, display it as a toast message. Cleanup url afterwards - we don't want the user to see the message again if reloads the browser
 */
export const displayAndCleanLogoutMsg = () => {
	const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

	const msg: string | null = urlParams.get(PARAM_MSG);

	if (isNullish(msg)) {
		return;
	}

	// For simplicity reason we assume the level pass as query params is one of the type ToastLevel
	const level: ToastLevel = (urlParams.get(PARAM_LEVEL) as ToastLevel | null) ?? 'info';

	toasts.show({ text: decodeURI(msg), level });

	cleanUpMsgUrl();
};

const cleanUpMsgUrl = () => {
	const url: URL = new URL(window.location.href);

	url.searchParams.delete(PARAM_MSG);
	url.searchParams.delete(PARAM_LEVEL);

	replaceHistory(url);
};
