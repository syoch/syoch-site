mod generator_wrapper;

mod python;
extern crate kernel;

use generator_wrapper::GeneratorWrapepr;

use kernel::{Kernel, PollResult, Process, SyscallData};
use python::panic_py_except;
use rustpython_vm::{convert::IntoPyException, PyResult};

use crate::python::python_enter;

struct TestProcess {
    generator: GeneratorWrapepr,
}

impl TestProcess {
    fn new() -> PyResult<TestProcess> {
        Ok(TestProcess {
            generator: GeneratorWrapepr::new(
                r#"async def proc():
    lock = print("/")
    print(f"lock = {lock}")

    await cw.pending()
wrapper()"#
                    .to_string(),
            )?,
        })
    }
}

impl Process for TestProcess {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64> {
        // TODO send data to generator
        if let Err(e) = self.generator.step() {
            python_enter(|vm| {
                panic_py_except(e.into_pyexception(vm), vm);
            });
        }
        PollResult::Done(0i64)
    }
}

fn main() {
    let mut k = Kernel::default();

    let p1 = TestProcess::new().unwrap();

    k.register_process(Box::new(p1));

    k.start();
}
