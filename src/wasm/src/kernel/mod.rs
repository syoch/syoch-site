use std::{collections::HashMap, hash::Hash};

#[derive(Debug)]
enum Syscall {
    Lock(String),
}

enum PollResult<Ret> {
    Pending,
    Done(Ret),
    Syscall(Syscall),
}

trait Process {
    fn poll(&mut self) -> PollResult<i64>;
}

enum FSObj {
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

struct FSCursor<'a> {
    path: Vec<String>,
    root_fs: &'a FSObj,
}

struct Kernel {
    processes: HashMap<u128, Box<dyn Process>>,
    fs_root: FSObj,
}

impl Kernel {
    pub fn new() -> Kernel {
        Kernel {
            processes: HashMap::new(),
            fs_root: FSObj::Dist(HashMap::new()),
        }
    }

    fn find_free_pid(&mut self) -> u128 {
        let mut pid: u128 = 0;

        while self.processes.contains_key(&pid) {
            pid += 1;
        }

        return pid;
    }

    pub fn register_process<P: 'static + Process>(&mut self, process: P) {
        let pid = self.find_free_pid();

        self.processes.insert(pid, Box::new(process));
    }

    pub fn start(&mut self) {
        while !self.processes.is_empty() {
            let mut process_to_kill = vec![];
            for (pid, p) in &mut self.processes {
                match p.poll() {
                    PollResult::Pending => (),
                    PollResult::Done(n) => {
                        println!("Process<{pid}> Returns {n}");
                        process_to_kill.push(*pid);
                    }
                    PollResult::Syscall(s) => {
                        println!("{pid}: {s:?}");
                    }
                }
            }

            for pid in process_to_kill {
                self.processes.remove(&pid);
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    struct TestProcess {
        n: u8,
        stop: u8,
    }

    impl TestProcess {
        fn new(n: u8) -> TestProcess {
            TestProcess { n, stop: n + 10 }
        }
    }

    impl Process for TestProcess {
        fn poll(&mut self) -> PollResult<i64> {
            println!("n = {}", self.n);
            self.n += 1;

            if self.n == self.stop {
                return PollResult::Done(0 as i64);
            } else {
                return PollResult::Pending;
            }
        }
    }
    //

    struct TestProcess2 {
        n: u8,
        stop: u8,
    }

    impl TestProcess2 {
        fn new(n: u8) -> TestProcess2 {
            TestProcess2 { n, stop: n + 10 }
        }
    }

    impl Process for TestProcess2 {
        fn poll(&mut self) -> PollResult<i64> {
            println!("n = {}", self.n);
            self.n += 1;

            if self.n == self.stop {
                return PollResult::Done(0 as i64);
            } else {
                return PollResult::Pending;
            }
        }
    }

    #[test]
    fn kernel() {
        let p1 = TestProcess::new(0);
        let p2 = TestProcess2::new(10);
        let mut k = Kernel::new();

        k.register_process(p1);
        k.register_process(p2);

        k.start();
    }
}
