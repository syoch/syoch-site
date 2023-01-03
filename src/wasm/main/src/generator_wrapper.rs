use crate::python::{panic_py_except, python_enter};
use kernel::SyscallData;
use rustpython_vm::{
    builtins::{PyInt, PyIntRef},
    convert::{IntoObject, IntoPyException},
    protocol::{PyIter, PyIterReturn},
    PyObjectRef, PyPayload, PyResult,
};

pub struct GeneratorWrapepr {
    generator: PyObjectRef,
}

impl GeneratorWrapepr {
    pub fn new(source: String) -> PyResult<GeneratorWrapepr> {
        let generator = python_enter(|vm| {
            let generator = vm.run_block_expr(vm.new_scope_with_builtins(), source.as_str());
            if let Err(e) = generator {
                panic_py_except(e.into_pyexception(vm), vm);
            }
            let generator = generator.unwrap();

            Ok(generator)
        })?;

        Ok(Self { generator })
    }

    pub fn step(&self) -> PyResult<Option<u32>> {
        python_enter(|vm| {
            let r = PyIter::new(self.generator.clone()).next(vm)?;

            let ret = match r {
                PyIterReturn::Return(value) => {
                    let r = value.try_into_value::<PyIntRef>(vm);
                    if let Err(e) = r {
                        panic_py_except(e.into_pyexception(vm), vm);
                    }
                    Some(r.unwrap().as_u32_mask())
                }
                PyIterReturn::StopIteration(_) => None,
            };
            Ok(ret)
        })
    }

    pub fn read_string(&self) -> PyResult<String> {
        let length = self.step()?.unwrap();
        let mut ret = String::new();
        for _ in 0..length {
            let c = self.step()?.unwrap();
            ret.push(c as u8 as char);
        }
        Ok(ret)
    }

    pub fn pass(&self, data: &SyscallData) {
        python_enter(|vm| {
            let data = match data {
                SyscallData::None => vm.ctx.none().into_object(),
                SyscallData::Lock(None) => vm.ctx.none().into_object(),
                SyscallData::Lock(Some(lock)) => PyInt::from(lock.id).into_pyobject(vm),
            };

            vm.new_scope_with_builtins()
                .globals
                .set_item("_rt_syscall_result", data, vm)
                .unwrap()
        });
    }
}
