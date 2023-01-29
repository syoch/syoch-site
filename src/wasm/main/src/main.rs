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
                r#"
import cworks as _c_works
import asyncio
import io

class CWorks:
    def print(s):
        _c_works.print(s)

    async def step():
        await asyncio.sleep(0)

print_org=print
def print(*a, **k):
    buf = io.StringIO()
    print_org(*a, **k, file=buf)
    _c_works.print(buf.getvalue())

async def proc():
    lock = print("/")
    print(f"lock = {lock}")

    await CWorks.step()

def wrapper():
    coro = proc()
    while True:
        try:
            yield coro.send(None)
        except StopIteration:
            break
    yield None

wrapper()"#
                    .to_string(),
            )?,
        })
    }
}

impl Process for TestProcess {
    fn poll(&mut self, data: &SyscallData) -> PollResult<i64> {
        self.generator.pass(data);
        let a = self.generator.step();
        if let Err(e) = a {
            python_enter(|vm| {
                panic_py_except(e.into_pyexception(vm), vm);
            });
            unreachable!();
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
