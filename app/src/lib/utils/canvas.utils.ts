export const canvasToBlob = ({
	canvas,
	type
}: {
	canvas: HTMLCanvasElement;
	type: string;
}): Promise<Blob | null> => {
	return new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), type));
};
