use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse as HttpResponseCdk,
    TransformArgs as TransformArgsCdk, TransformContext as TransformContextCdk,
};
use ic_cdk::print;
use serde_json::{json, Value};

pub fn get_request_image_generation(
    key: &str,
    prompt: &str,
) -> Result<CanisterHttpRequestArgument, String> {
    let body = gpt_body_image_generation(prompt);
    get_request(key, body, "images/generations".to_string())
}

pub fn get_request_vision_preview(
    key: &str,
    download_url: &String,
) -> Result<CanisterHttpRequestArgument, String> {
    let body = gpt_body_vision_preview(download_url);
    get_request(key, body, "chat/completions".to_string())
}

fn get_request(
    key: &str,
    body: Value,
    url_path: String,
) -> Result<CanisterHttpRequestArgument, String> {
    let body_json = serde_json::to_string(&body).map_err(|e| e.to_string())?;

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "idempotency-key".to_string(),
            value: key.to_owned(),
        },
    ];

    let request = CanisterHttpRequestArgument {
        url: format!(
            "https://us-central1-openai-proxy-ipv6.cloudfunctions.net/openai/{}",
            url_path
        )
        .to_string(),
        method: HttpMethod::POST,
        body: Some(body_json.into_bytes()),
        max_response_bytes: None,
        transform: Some(TransformContextCdk::from_name(
            "transform".to_string(),
            serde_json::to_vec(&Vec::<u8>::new()).unwrap(),
        )),
        headers: request_headers,
    };

    Ok(request)
}

pub fn gpt_body_image_generation(prompt: &str) -> Value {
    json!({
      "model": "dall-e-3",
      "prompt": prompt.to_owned(),
      "n": 1,
      "size": "1024x1024"
    })
}

fn gpt_body_vision_preview(download_url: &String) -> Value {
    json!({
        "model": "gpt-4-vision-preview".to_string(),
        "max_tokens": 4096,
        "temperature": 0.0,
        "messages": messages(download_url)
    })
}

fn messages(download_url: &String) -> Value {
    let system_prompt = "You are an expert web designer who specializes in programming SVG. \
You are famous for designing those SVG while following movements of arts that included expressionism and surrealism. \
You explored color theory as well. \
You used to taught at the Bauhaus school of art and design in Germany. \
A user will provide you with a low-fidelity sketch of an drawing. \
You will return a single SVG file to create a high fidelity improved drawing that can be used as a background or hero pane on a website. \
You like to add colors and gradients in your work so will you do with this SVG. \
You also like to add some forms and additional objects of your own creation within the drawing. \
You are also a big fan a punk music which influences your style by making things not too square. \
The user will provide you with notes in blue or red text, arrows, or drawings. \
Carry out any changes they request from you. \
Use creative license to make the application more fleshed out. \
Respond ONLY with the contents of the SVG file. \
Try to process everything in maximum 25 seconds.";

    json!([
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": download_url,
                        "detail": "high",
                    },
                },
                {
                    "type": "text",
                    "text": "Turn this into a single svg file.",
                }
            ],
        },
    ])
}

// Strips all data that is not needed from the original response.
pub fn transform_response(raw: TransformArgsCdk) -> HttpResponseCdk {
    let headers = vec![
        HttpHeader {
            name: "Content-Security-Policy".to_string(),
            value: "default-src 'self'".to_string(),
        },
        HttpHeader {
            name: "Referrer-Policy".to_string(),
            value: "strict-origin".to_string(),
        },
        HttpHeader {
            name: "Permissions-Policy".to_string(),
            value: "geolocation=(self)".to_string(),
        },
        HttpHeader {
            name: "Strict-Transport-Security".to_string(),
            value: "max-age=63072000".to_string(),
        },
        HttpHeader {
            name: "X-Frame-Options".to_string(),
            value: "DENY".to_string(),
        },
        HttpHeader {
            name: "X-Content-Type-Options".to_string(),
            value: "nosniff".to_string(),
        },
    ];

    let mut res = HttpResponseCdk {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers,
        ..Default::default()
    };

    if i32::try_from(res.status.clone().0).unwrap() == 200 {
        res.body = raw.response.body;
    } else {
        ic_cdk::api::print(format!("Received an error from proxy: err = {:?}", raw));
    }

    res
}
