use crate::python::{panic_py_except, python_enter};
use kernel::SyscallData;
use rustpython_vm::{
    builtins::PyInt,
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

    pub fn step(&self) -> PyResult<bool> {
        python_enter(|vm| {
            let r = PyIter::new(self.generator.clone()).next(vm)?;
            let ret = match r {
                PyIterReturn::Return(_value) => true,
                PyIterReturn::StopIteration(_) => false,
            };
            Ok(ret)
        })
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
