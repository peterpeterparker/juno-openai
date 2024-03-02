mod doc;
mod request;
mod response;

use crate::doc::{save_to_store, DocPromptData};
use crate::request::{get_request_image_generation, get_request_vision_preview};
use crate::response::{
    read_response_image_generation, read_response_vision_preview, DrawingResult,
};
use ic_cdk::api::management_canister::http_request::http_request as http_request_outcall;
use ic_cdk::{id, print};
use junobuild_macros::{
    on_delete_asset, on_delete_doc, on_delete_many_assets, on_delete_many_docs, on_set_doc,
    on_set_many_docs, on_upload_asset,
};
use junobuild_satellite::{
    include_satellite, OnDeleteAssetContext, OnDeleteDocContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use junobuild_utils::decode_doc_data;

#[on_set_doc(collections = ["prompts"])]
async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
    let data: DocPromptData = decode_doc_data(&context.data.data.after.data)?;

    let request = get_request_image_generation(&data.prompt)?;

    print("🔫 ---------> Starting the request.");

    match http_request_outcall(request, 5_000_000_000).await {
        Ok((response,)) => {
            print("✅ ---------> Request processed.");

            let result = read_response_image_generation(response)?;

            save_to_store(context.caller, context.data.key, result)?;

            print("👍 ---------> All good.");
        }
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {:?}, Error: {}", r, m);

            print(format!("‼️ ---------> {}.", message));

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

#[on_set_many_docs]
async fn on_set_many_docs(_context: OnSetManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_doc]
async fn on_delete_doc(_context: OnDeleteDocContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_docs]
async fn on_delete_many_docs(_context: OnDeleteManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_upload_asset(collections = ["images"])]
async fn on_upload_asset(context: OnUploadAssetContext) -> Result<(), String> {
    // Example localhost: http://jx5yt-yyaaa-aaaal-abzbq-cai.localhost:5987/images/carbon.png
    // Example mainnet: https://xo2hm-lqaaa-aaaal-ab3oa-cai.icp0.io/images/house123.png
    let download_url = format!(
        "https://{}.icp0.io{}",
        id().to_text(),
        context.data.key.full_path
    );

    let key = context.data.key.full_path.clone();

    let request = get_request_vision_preview(&download_url)?;

    print("🔫 ---------> Starting the request.");

    match http_request_outcall(request, 10_000_000_000).await {
        Ok((response,)) => {
            print("✅ ---------> Request processed.");

            let result = read_response_vision_preview(response)?;

            save_to_store(context.caller, key, result)?;

            print("👍 ---------> All good.");
        }
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {:?}, Error: {}", r, m);

            print(format!("‼️ ---------> {}.", message));

            save_to_store(context.caller, key, DrawingResult::Error(message.clone()))?;
        }
    }

    Ok(())
}

#[on_delete_asset]
async fn on_delete_asset(_context: OnDeleteAssetContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_assets]
async fn on_delete_many_assets(_context: OnDeleteManyAssetsContext) -> Result<(), String> {
    Ok(())
}

include_satellite!();
