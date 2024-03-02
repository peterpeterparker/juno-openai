export const formatRelativeDate = (nanoseconds: bigint): string => {
	const rtf = new Intl.RelativeTimeFormat('en', {
		numeric: 'auto'
	});

	const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;
	const timestamp = new Date(Number(nanoseconds / 1_000_000n));
	const daysDifference = Math.round(
		(timestamp.getTime() - new Date().getTime()) / DAY_MILLISECONDS
	);

	return rtf.format(daysDifference, 'days');
};

const options: Intl.DateTimeFormatOptions = {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
};

export const formatNanosecondsToDate = (nanoseconds: bigint): string => {
	const date = new Date(Number(nanoseconds / 1_000_000n));
	return date.toLocaleDateString('en', options);
};

export const formatNanosecondsToDetailedDate = (nanoseconds: bigint): string => {
	const date = new Date(Number(nanoseconds / 1_000_000n));
	return date.toLocaleDateString('en', {
		...options,
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
};

export const formatStringToDate = (str: string): string =>
	new Date(str).toLocaleDateString('en', options);

export const secondsToDateTime = (seconds: bigint): string =>
	`${secondsToDate(Number(seconds))} ${secondsToTime(Number(seconds))}`;

export const secondsToDate = (seconds: number): string => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	};
	const milliseconds = seconds * 1000;
	// We only support english for now.
	return new Date(milliseconds).toLocaleDateString('en', options);
};

export const secondsToTime = (seconds: number): string => {
	const options: Intl.DateTimeFormatOptions = {
		timeStyle: 'short'
	};
	const milliseconds = seconds * 1000;
	// We only support english for now.
	return new Date(milliseconds).toLocaleTimeString('en', options);
};

export const nowInSeconds = (): number => Math.round(Date.now() / 1000);
