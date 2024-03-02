use crate::response::DrawingResult;
use candid::Principal;
use junobuild_satellite::{set_doc_store, SetDoc};
use junobuild_utils::encode_doc_data;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum DocDataDrawingType {
    Svg,
    Image,
}

#[derive(Serialize, Deserialize)]
pub struct DocDataDrawing {
    pub content: String,
    pub drawing_type: DocDataDrawingType,
}

#[derive(Serialize, Deserialize)]
struct DocDataSuccess {
    drawing: DocDataDrawing,
}

#[derive(Serialize, Deserialize)]
struct DocDataError {
    error: String,
}

#[derive(Serialize, Deserialize)]
pub struct DocPromptData {
    pub prompt: String,
}

pub fn save_to_store(caller: Principal, key: String, drawing: DrawingResult) -> Result<(), String> {
    let encoded_data = match drawing {
        DrawingResult::Drawing(drawing) => encode_doc_data(&DocDataSuccess { drawing })?,
        DrawingResult::Empty() => encode_doc_data(&DocDataError {
            error: "Empty".to_string(),
        })?,
        DrawingResult::Error(error) => encode_doc_data(&DocDataError { error })?,
    };

    let doc: SetDoc = SetDoc {
        data: encoded_data,
        description: None,
        updated_at: None,
    };

    set_doc_store(caller, "drawings".to_string(), key, doc)?;

    Ok(())
}
