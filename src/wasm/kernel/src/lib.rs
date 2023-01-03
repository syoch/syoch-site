mod automap;
mod fs;
mod kernel;
mod process;
mod resources;

pub use kernel::Kernel;
pub use process::PollResult;
pub use process::Process;
pub use process::{Syscall, SyscallData};
