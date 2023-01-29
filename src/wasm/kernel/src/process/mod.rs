mod kernel_process;
pub use kernel_process::KernelProcess;

#[derive(Debug, Clone)]
pub struct Lock {
    pub id: u128,
}

impl Lock {
    pub fn new(id: u128) -> Lock {
        Lock { id }
    }
}

#[derive(Debug, Clone)]
pub enum Syscall {
    Lock(String),
}

#[derive(Debug, Clone)]
pub enum SyscallData {
    Lock(Option<Lock>),
    None,
}

impl Default for SyscallData {
    fn default() -> Self {
        SyscallData::None
    }
}

#[derive(Clone)]
pub enum PollResult<Ret> {
    Pending,
    Done(Ret),
    Syscall(Syscall),
}

impl<T> Default for PollResult<T> {
    fn default() -> Self {
        PollResult::Pending
    }
}

pub trait Process: Sync + Send {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64>;
}
