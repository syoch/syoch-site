mod generator_wrapper;
mod python;

extern crate kernel;

use generator_wrapper::GeneratorWrapepr;
use kernel::{PollResult, Process, SyscallData};
use python::panic_py_except;
use rustpython_vm::{convert::IntoPyException, PyResult};

use crate::python::python_enter;

pub struct PythonProcess {
    generator: GeneratorWrapepr,
}

impl PythonProcess {
    pub fn new(source: String) -> PyResult<PythonProcess> {
        Ok(PythonProcess {
            generator: GeneratorWrapepr::new(source)?,
        })
    }
}

impl Process for PythonProcess {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64> {
        {
            let mut a = python::cworks::STATE.lock().unwrap();
            a.syscall_result = data.clone();
        }

        if let Err(e) = self.generator.step() {
            python_enter(|vm| {
                panic_py_except(e.into_pyexception(vm), vm);
            });
        }
        let a = python::cworks::STATE.lock().unwrap();
        return a.poll_result.clone();
    }
}

#[cfg(test)]
mod test {
    use kernel::Kernel;

    use super::*;

    #[test]
    fn main() {
        let mut k = Kernel::default();

        let p1 = PythonProcess::new(
            r#"async def proc():
    print("print")
    print("/")

    print("step")
    await step()

    print("pending")
    await pending()

wrapper()"#
                .to_string(),
        );
        if let Err(p1) = &p1 {
            python::python_enter(|vm| {
                python::panic_py_except(p1.clone(), vm);
            })
        }
        let p1 = p1.unwrap();

        k.register_process(Box::new(p1));

        k.start();
    }
}
