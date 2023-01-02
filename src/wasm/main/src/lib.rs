extern crate ghs_demangle;

use ghs_demangle::demangle;
use wasm_bindgen::prelude::wasm_bindgen;

mod generator;

pub use generator::generate_user_id;

#[wasm_bindgen]
pub fn demangle_str(x: String) -> String {
    demangle(x).to_string()
}
