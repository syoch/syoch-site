mod generator_wrapper;

mod python;
extern crate kernel;

use generator_wrapper::GeneratorWrapepr;

use kernel::{Kernel, PollResult, Process, SyscallData};
use python::{panic_py_except, python_enter};
use rustpython_vm::{convert::IntoPyException, PyResult};

struct TestProcess {
    generator: GeneratorWrapepr,
}

impl TestProcess {
    fn new() -> PyResult<TestProcess> {
        Ok(TestProcess {
            generator: GeneratorWrapepr::new(
                r#"
import cworks

class CWorks:
    incoming_data = None

    @staticmethod
    def on_recv_value(d):
        incoming_data = d

    @staticmethod
    def send_value(d):
        cworks.send_value(d)

    @staticmethod
    async def pending():
        CWorks.send_value(0x00000000)
        return await

    @staticmethod
    async def lock_obj(p):
        CWorks.send_value(0x02000000)
        CWorks.string(p)

    @staticmethod
    def string(s):
        CWorks.send_value(len(s))
        for c in s:
            CWorks.send_value(ord(c))

    @staticmethod
    def print(s):
        CWorks.send_value(0x01000000)
        Cworks.string(s)

async def proc():
    lock = await CWorks.lock_obj("/")
    print(lock)

def gen():
    coro = proc()
    while True:
        try:
            yield coro.send(None)
        except StopIteration:
            break

gen()"#
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
        let a = a.unwrap().map(|x| x.to_be_bytes());
        match a {
            Some([0x00, 0x00, 0x00, 0x00]) => PollResult::Pending,
            Some([0x01, 0, 0, 0]) => {
                println!("{}", self.generator.read_string().unwrap());
                PollResult::Pending
            }
            Some([0x02, 0, 0, 0]) => {
                let path = self.generator.read_string().unwrap();
                PollResult::Syscall(kernel::Syscall::Lock(path))
            }
            None => PollResult::Done(0),
            _ => panic!("Unexcepted value: a={a:?}"),
        }
    }
}

fn main() {
    let mut k = Kernel::default();

    let p1 = TestProcess::new().unwrap();

    k.register_process(Box::new(p1));

    k.start();
}
