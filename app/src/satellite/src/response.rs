use crate::doc::{DocDataDrawing, DocDataDrawingType};
use ic_cdk::api::management_canister::http_request::HttpResponse;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Gpt4VisionPreviewUsage {
    prompt_tokens: u64,
    completion_tokens: u64,
    total_tokens: u64,
}

#[derive(Serialize, Deserialize)]
struct Gpt4VisionPreviewMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct Gpt4VisionPreviewChoice {
    message: Gpt4VisionPreviewMessage,
    finish_reason: String,
    index: u64,
}

#[derive(Serialize, Deserialize)]
struct Gpt4VisionPreviewResponse {
    id: String,
    object: String,
    created: u64,
    model: String,
    usage: Gpt4VisionPreviewUsage,
    choices: Vec<Gpt4VisionPreviewChoice>,
}

#[derive(Serialize, Deserialize)]
struct DallE3Data {
    revised_prompt: String,
    url: String,
}

#[derive(Serialize, Deserialize)]
struct DallE3Response {
    created: u64,
    data: Vec<DallE3Data>,
}

pub enum DrawingResult {
    Drawing(DocDataDrawing),
    Empty(),
    Error(String),
}

pub fn read_response_image_generation(response: HttpResponse) -> Result<DrawingResult, String> {
    let str_body =
        String::from_utf8(response.body).expect("Transformed response is not UTF-8 encoded.");

    let dalle_response: DallE3Response =
        serde_json::from_str(&str_body).map_err(|e| e.to_string())?;

    let data = dalle_response.data.first();

    match data {
        None => Ok(DrawingResult::Empty()),
        Some(data) => Ok(DrawingResult::Drawing(DocDataDrawing {
            content: data.url.clone(),
            drawing_type: DocDataDrawingType::Image,
        })),
    }
}

pub fn read_response_vision_preview(response: HttpResponse) -> Result<DrawingResult, String> {
    let str_body =
        String::from_utf8(response.body).expect("Transformed response is not UTF-8 encoded.");

    let preview_response: Gpt4VisionPreviewResponse =
        serde_json::from_str(&str_body).map_err(|e| e.to_string())?;

    let choice = preview_response.choices.first();

    match choice {
        None => Ok(DrawingResult::Empty()),
        Some(choice) => Ok(DrawingResult::Drawing(DocDataDrawing {
            content: choice
                .message
                .content
                .replace("```svg", "")
                .replace("```", "")
                .clone(),
            drawing_type: DocDataDrawingType::Svg,
        })),
    }
}
