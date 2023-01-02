use std::collections::HashMap;

pub enum FSObj {
    Int(i128),
    String(String),
    Boolean(bool),
    Float(f32),
    Double(f64),
    Bytes(Vec<u8>),
    List(Vec<FSObj>),
    Dist(HashMap<String, FSObj>),
    Null,
}

impl From<&FSObj> for String {
    fn from(a: &FSObj) -> Self {
        match a {
            FSObj::Int(n) => format!("{n}"),
            FSObj::String(s) => format!("\"{s}\""),
            FSObj::Boolean(b) => format!("{b:#}"),
            FSObj::Float(f) => format!("{f}"),
            FSObj::Double(d) => format!("{d}"),
            FSObj::Bytes(b) => format!("{b:?}"),
            FSObj::List(l) => {
                "[".to_string()
                    + &l.iter()
                        .map(|x| String::from(x))
                        .collect::<Vec<String>>()
                        .join(", ")
                    + &"]".to_string()
            }
            FSObj::Dist(d) => {
                "{".to_string()
                    + &d.iter()
                        .map(|(k, v)| format!("{}: {}", k, String::from(v)))
                        .collect::<Vec<String>>()
                        .join(", ")
                    + &"}".to_string()
            }
            FSObj::Null => format!(""),
        }
    }
}

impl FSObj {}
