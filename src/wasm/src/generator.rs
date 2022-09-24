use chrono::{DateTime, Local};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn generate_user_id() -> String {
    let dt: DateTime<Local> = Local::now();
    let timestamp: i64 = dt.timestamp();

    let mut id = "".to_string();
    while timestamp > 0 {
        let digit = timestamp % 64;
        let digit = if digit < 10 {
            (digit + 48) as u8 as char
        } else if digit < 10 + 26 {
            (digit + 55) as u8 as char
        } else if digit < 10 + 26 * 2 {
            (digit + 61) as u8 as char
        } else if digit == 62 {
            '_'
        } else {
            '-'
        };

        id.push(digit);
    }

    id
}
