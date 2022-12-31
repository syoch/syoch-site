mod generator;
mod kernel;

use rustpython_vm::{
    convert::IntoPyException,
    protocol::{PyIter, PyIterReturn},
    PyObjectRef, PyResult,
};

use crate::kernel::{get_interpreter, Kernel, PollResult, Process, SyscallData};

struct TestProcess {
    generator: PyObjectRef,
}

impl TestProcess {
    fn new() -> PyResult<TestProcess> {
        let interp = get_interpreter().lock().unwrap();
        let generator = interp.enter(|vm| {
            let generator = vm.run_block_expr(
                vm.new_scope_with_builtins(),
                r#"
    for i in range(10):
        yield 0
gen()"#,
            );
            if let Err(e) = generator {
                kernel::panic_py_except(e.into_pyexception(vm), vm);
            }
            let generator = generator.unwrap();

            Ok(generator)
        })?;

        Ok(TestProcess { generator })
    }
}

impl Process for TestProcess {
    fn poll(&mut self, _data: &SyscallData) -> PollResult<i64> {
        let interp = get_interpreter().lock().unwrap();
        let r = interp.enter(|vm| {
            let v = PyIter::new(self.generator.clone()).next(vm)?;
            PyResult::Ok(v)
        });

        if let Err(_) = r {
            // TODO: Impl Error Handling
            return PollResult::Done(1 as i64);
        }
        let r = r.unwrap();

        match r {
            PyIterReturn::Return(_value) => {
                println!("pend...");
                PollResult::Pending
            }
            PyIterReturn::StopIteration(_) => PollResult::Done(0 as i64),
        }
    }
}

fn main() {
    let mut k = Kernel::new();

    let p1 = TestProcess::new().unwrap();

    k.register_process(Box::new(p1));

    k.start();
}
