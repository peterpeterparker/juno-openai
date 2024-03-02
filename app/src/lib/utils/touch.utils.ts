export const unifyEvent = (e: unknown): { clientX: number; clientY: number } => {
	// @ts-expect-error for simplicity reason, it's a demo
	return e.changedTouches ? e.changedTouches[0] : e;
};
