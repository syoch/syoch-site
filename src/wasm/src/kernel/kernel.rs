use std::collections::HashMap;

use crate::kernel::process::{Syscall, SyscallData};

use super::{
    automap::AutoMap,
    fs::FSObj,
    process::{KernelProcess, PollResult, Process},
    resources::{KernelResource, LockedResource},
};

pub struct Kernel {
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
        self.locks.add_value(LockedResource::new(resource));
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
                            Syscall::Lock(ref _path) => {
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
