mod doc;
mod request;
mod response;

use crate::doc::{save_to_store, DocPromptData};
use crate::request::{
    get_request_image_generation, get_request_vision_preview, transform_response,
};
use crate::response::{
    read_response_image_generation, read_response_vision_preview, DrawingResult,
};
use ic_cdk::api::management_canister::http_request::http_request as http_request_outcall;
use ic_cdk::{id};
use junobuild_macros::{on_set_doc, on_upload_asset};
use junobuild_satellite::{include_satellite, OnSetDocContext, OnUploadAssetContext, error, log};
use junobuild_utils::decode_doc_data;

#[on_set_doc(collections = ["prompts"])]
async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
    let data: DocPromptData = decode_doc_data(&context.data.data.after.data)?;

    let request = get_request_image_generation(&context.data.key, &data.prompt)?;

    log(format!("🔫 ---------> Starting the request. {}", data.prompt))?;

    match http_request_outcall(request, 25_000_000_000).await {
        Ok((response,)) => {
            log("✅ ---------> Request processed.".to_string())?;

            let result = read_response_image_generation(response)?;

            save_to_store(context.caller, context.data.key, result)?;

            log("👍 ---------> All good.".to_string())?;
        }
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {:?}, Error: {}", r, m);

            error(format!("‼️ ---------> {}.", message))?;

            save_to_store(
                context.caller,
                context.data.key,
                DrawingResult::Error(message.clone()),
            )?;

            // We do not bubble an error in this particular use case because we write the error in the datastore for demo purpose
        }
    }

    Ok(())
}

#[on_upload_asset(collections = ["sketches"])]
async fn on_upload_asset(context: OnUploadAssetContext) -> Result<(), String> {
    // Example localhost: http://jx5yt-yyaaa-aaaal-abzbq-cai.localhost:5987/images/carbon.png
    // Example mainnet: https://xo2hm-lqaaa-aaaal-ab3oa-cai.icp0.io/images/house123.png
    let download_url = format!(
        "https://{}.icp0.io{}?token={}",
        id().to_text(),
        context.data.key.full_path,
        context.data.key.token.unwrap_or("".to_string())
    );

    let doc_key = context.data.key.full_path.clone();

    let request = get_request_vision_preview(&context.data.key.name, &download_url)?;

    log("🔫 ---------> Starting the request.".to_string())?;

    match http_request_outcall(request, 25_000_000_000).await {
        Ok((response,)) => {
            log("✅ ---------> Request processed.".to_string())?;

            let result = read_response_vision_preview(response)?;

            save_to_store(context.caller, doc_key, result)?;

            log("👍 ---------> All good.".to_string())?;
        }
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {:?}, Error: {}", r, m);

            error(format!("‼️ ---------> {}.", message))?;

            save_to_store(
                context.caller,
                doc_key,
                DrawingResult::Error(message.clone()),
            )?;
        }
    }

    Ok(())
}

#[ic_cdk_macros::query]
fn transform(
    raw: ic_cdk::api::management_canister::http_request::TransformArgs,
) -> ic_cdk::api::management_canister::http_request::HttpResponse {
    transform_response(raw)
}

include_satellite!();
