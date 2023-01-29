use rustpython_vm::pymodule;

#[pymodule]
pub mod cworks_mod {
    use rustpython_vm::{PyObjectRef, PyResult, VirtualMachine};

    #[pyfunction]
    fn print(c: PyObjectRef, vm: &VirtualMachine) -> PyResult<PyObjectRef> {
        let a = c.str(vm)?;
        let s = a.to_string();
        print!("P: {}", s);
        Ok(vm.ctx.none())
    }
}
