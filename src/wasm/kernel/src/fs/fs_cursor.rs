use super::FSObj;

pub struct FSCursor<'a> {
    path: Vec<String>,
    root_fs: &'a FSObj,
}
