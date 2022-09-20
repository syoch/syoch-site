extern crate ghs_demangle;
use ghs_demangle::demangle;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn demangle_str(x: String) -> String {
    demangle(x).to_string()
}
