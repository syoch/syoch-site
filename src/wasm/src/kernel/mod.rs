use std::{collections::HashMap, hash::Hash};
mod automap;
mod fs;
mod process;

use fs::FSObj;
use process::{PollResult, Process, SyscallData};

use self::automap::AutoMap;

#[derive(Debug, Hash)]
enum KernelResource {
    Object(String),
}

#[derive(Debug, Hash)]
struct LockedResource {
    resource: KernelResource,
    kernel_side_lock_id: u128,
    process_side_lock_id: u128,
    pid: u128,
}

struct KernelProcess {
    parent_pid: u128,
    process: Box<dyn Process>,
    system_call_returns: SyscallData,
}

impl From<Box<dyn Process>> for KernelProcess {
    fn from(p: Box<dyn Process>) -> Self {
        KernelProcess {
            parent_pid: 0,
            process: p,
            system_call_returns: SyscallData::None,
        }
    }
}

struct Kernel {
    processes: AutoMap<KernelProcess>,
    fs_root: FSObj,
    locks: AutoMap<LockedResource>,
}

impl Kernel {
    pub fn new() -> Kernel {
        Kernel {
            processes: AutoMap::new(),
            locks: AutoMap::new(),
            fs_root: FSObj::Dist(HashMap::new()),
        }
    }

    pub fn register_process(&mut self, p: Box<dyn Process>) {
        self.processes.add_value(p.into());
    }

    pub fn acquire_lock(&mut self, resource: KernelResource) {
        self.locks.add_value(LockedResource {
            resource,
            kernel_side_lock_id: 0,
            process_side_lock_id: 0,
            pid: 0,
        });
    }

    pub fn start(&mut self) {
        while !self.processes.map.is_empty() {
            let mut process_to_kill = vec![];
            for (pid, p) in &mut self.processes.map {
                match p.process.poll(&p.system_call_returns) {
                    PollResult::Pending => (),
                    PollResult::Done(n) => {
                        println!("Process<{pid}> Returns {n}");
                        process_to_kill.push(*pid);
                    }
                    PollResult::Syscall(s) => {
                        match s {
                            process::Syscall::Lock(ref _path) => {
                                p.system_call_returns = SyscallData::Lock(0, true);
                            }
                        }
                        println!("{pid}: {s:?}");
                    }
                }
            }

            for pid in process_to_kill {
                self.processes.map.remove(&pid);
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[derive(Hash)]
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
        fn poll(&mut self, data: &SyscallData) -> PollResult<i64> {
            self.n += 1;

            match self.n {
                1 => PollResult::Syscall(process::Syscall::Lock("/".to_string())),
                2 => {
                    println!("LockResult: {:?}", data);
                    PollResult::Pending
                }
                2..=10 => {
                    println!("n = {}", self.n);
                    PollResult::Pending
                }
                11 => PollResult::Done(0 as i64),
                _ => PollResult::Done(1 as i64),
            }
        }
    }
    #[test]
    fn kernel() {
        let p1 = TestProcess::new(0);
        // let p2 = TestProcess::new(10);
        let mut k = Kernel::new();

        k.register_process(Box::new(p1));
        // k.register_process(Box::new(p2));

        k.start();
    }
}
