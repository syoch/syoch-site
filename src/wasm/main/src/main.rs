mod generator;
mod generator_wrapper;

extern crate kernel;

use generator_wrapper::GeneratorWrapepr;

use kernel::{get_interpreter, Kernel, PollResult, Process, SyscallData};
use rustpython_vm::{convert::IntoPyException, PyResult};

struct TestProcess {
    generator: GeneratorWrapepr,
}

impl TestProcess {
    fn new() -> PyResult<TestProcess> {
        Ok(TestProcess {
            generator: GeneratorWrapepr::new(
                r#"def gen():
        yield 1
        yield 0x01
        yield 0x01
        yield 0x47
gen()"#
                    .to_string(),
            )?,
        })
    }
}

impl Process for TestProcess {
    fn poll(&mut self, _data: &SyscallData) -> PollResult<i64> {
        let a = self.generator.step();
        if let Err(e) = a {
            let interp = get_interpreter().lock().unwrap();
            interp.enter(|vm| {
                kernel::panic_py_except(e.into_pyexception(vm), vm);
            });
            unreachable!();
        }
        let a = a.unwrap();

        if let Some(a) = a {
            println!("a: {}", a);
            PollResult::Pending
        } else {
            PollResult::Done(0)
        }
    }
}

fn main() {
    let mut k = Kernel::new();

    let p1 = TestProcess::new().unwrap();

    k.register_process(Box::new(p1));

    k.start();
}
