mod kernel_process;
pub use kernel_process::KernelProcess;

#[derive(Debug)]
pub struct Lock {
    pub id: u128,
}

impl Lock {
    pub fn new(id: u128) -> Lock {
        Lock { id }
    }
}

#[derive(Debug)]
pub enum Syscall {
    Lock(String),
}

#[derive(Debug)]
pub enum SyscallData {
    Lock(Option<Lock>),
    None,
}

pub enum PollResult<Ret> {
    Pending,
    Done(Ret),
    Syscall(Syscall),
}

pub trait Process: Sync + Send {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64>;
}
