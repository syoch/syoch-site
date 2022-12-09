#[derive(Debug)]
pub enum Syscall {
    Lock(String),
}

pub enum PollResult<Ret> {
    Pending,
    Done(Ret),
    Syscall(Syscall),
}

pub trait Process {
    fn poll(&mut self) -> PollResult<i64>;
}
