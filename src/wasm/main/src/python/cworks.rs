use rustpython_vm::pymodule;

#[pymodule]
pub mod cworks_mod {
    use rustpython_vm::{builtins::PyDict, PyObjectRef, PyResult, VirtualMachine};

    #[pyfunction]
    fn get_syscall_result(vm: &VirtualMachine) -> PyResult<PyObjectRef> {
        let r = vm.ctx.new_dict();
        r.set_item("a", vm.ctx.new_str("a").into(), vm)?;

        Ok(r.into())
    }
    #[pyfunction]
    fn print(c: PyObjectRef, vm: &VirtualMachine) -> PyResult<PyObjectRef> {
        let a = c.str(vm)?;
        let s = a.to_string();
        print!("P: {}", s);
        Ok(vm.ctx.none())
    }
}
