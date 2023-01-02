use super::{Process, SyscallData};

pub struct KernelProcess {
    pub parent_pid: u128,
    pub process: Box<dyn Process>,
    pub system_call_returns: SyscallData,
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
