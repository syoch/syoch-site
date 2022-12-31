mod kernel_process;
pub use kernel_process::KernelProcess;
#[derive(Debug)]
pub enum Syscall {
    Lock(String),
}

#[derive(Debug)]
pub enum SyscallData {
    Lock(u128, bool),
    None,
}

pub enum PollResult<Ret> {
    Pending,
    Done(Ret),
    Syscall(Syscall),
}

pub trait Process {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64>;
}
