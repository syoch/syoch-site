use std::collections::HashMap;

pub struct AutoMap<T> {
    pub map: HashMap<u128, T>,
}

impl<T> AutoMap<T> {
    pub fn new() -> AutoMap<T> {
        AutoMap {
            map: HashMap::new(),
        }
    }
    fn find_free_id(&self) -> u128 {
        let mut i: u128 = 0;

        while self.map.contains_key(&i) {
            i += 1;
        }

        i
    }
    pub fn add_value(&mut self, value: T) -> u128 {
        let i = self.find_free_id();

        self.map.insert(i, value);

        i
    }
}
