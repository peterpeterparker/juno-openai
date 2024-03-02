export interface DrawingData {
	content: string;
	drawing_type: 'Image' | 'Svg';
}

export interface DocDrawingDataSuccess {
	drawing: DrawingData;
}

export interface DocDrawingDataError {
	error: string;
}

export type DocDrawingData = DocDrawingDataSuccess | DocDrawingDataError;

export interface PromptData {
	prompt: string;
}
