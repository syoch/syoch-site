use kernel::get_interpreter;
use rustpython_vm::{
    builtins::PyIntRef,
    convert::IntoPyException,
    protocol::{PyIter, PyIterReturn},
    PyObjectRef, PyResult,
};

pub struct GeneratorWrapepr {
    generator: PyObjectRef,
}

impl GeneratorWrapepr {
    pub fn new(source: String) -> PyResult<GeneratorWrapepr> {
        let interp = get_interpreter().lock().unwrap();
        let generator = interp.enter(|vm| {
            let generator = vm.run_block_expr(vm.new_scope_with_builtins(), source.as_str());
            if let Err(e) = generator {
                kernel::panic_py_except(e.into_pyexception(vm), vm);
            }
            let generator = generator.unwrap();

            Ok(generator)
        })?;

        Ok(Self { generator })
    }

    pub fn step(&self) -> PyResult<Option<u32>> {
        let interp = get_interpreter().lock().unwrap();

        interp.enter(|vm| {
            let r = PyIter::new(self.generator.clone()).next(vm)?;

            let ret = match r {
                PyIterReturn::Return(value) => {
                    let r = value.try_into_value::<PyIntRef>(vm);
                    if let Err(e) = r {
                        kernel::panic_py_except(e.into_pyexception(vm), vm);
                    }
                    Some(r.unwrap().as_u32_mask())
                }
                PyIterReturn::StopIteration(_) => None,
            };
            Ok(ret)
        })
    }
}
