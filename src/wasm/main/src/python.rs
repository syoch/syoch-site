use std::sync::Mutex;

use once_cell::sync::Lazy;

use rustpython::InterpreterConfig;
use rustpython_vm::{
    builtins::PyBaseException, pymodule, Interpreter, PyRef, Settings, VirtualMachine,
};

struct Python {
    interp: Interpreter,
    data_buffer: Vec<u8>,
}

#[pymodule]
mod cworks {
    use rustpython_vm::{builtins::PyCoroutine, PyObjectRef, VirtualMachine};

    #[pyfunction]
    fn send_value(c: PyObjectRef, vm: &VirtualMachine) {
        super::push_value(c.try_int(vm).unwrap().as_u32_mask());
    }
}

pub fn panic_py_except(e: PyRef<PyBaseException>, vm: &VirtualMachine) -> ! {
    println!(
        "Error: {:#?}",
        e.args()
            .iter()
            .map(|x| x.str(vm).unwrap())
            .collect::<Vec<_>>()
    );
    if let Some(traceback) = e.traceback() {
        let frames = traceback.iter();
        for x in frames {
            println!(
                "  File \"{}\", line {}, in {}",
                x.frame.code.source_path, x.lineno, x.frame.code.obj_name
            );
        }
    }
    std::process::exit(1);
}

fn init_vm(vm: &mut VirtualMachine) {
    vm.add_native_module("cworks", Box::new(cworks::make_module));
}

static SESSION: Lazy<Mutex<Python>> = Lazy::new(|| {
    println!("Initializing Python VM...");
    let mut setting = Settings::default();
    setting.debug = true;

    let interp = InterpreterConfig::new()
        .settings(setting)
        .init_stdlib()
        .init_hook(Box::new(init_vm))
        .interpreter();

    println!("Initializing Python VM...DONE!");

    Mutex::new(Python {
        interp,
        data_buffer: Vec::new(),
    })
});

pub fn python_enter<F, R>(f: F) -> R
where
    F: FnOnce(&VirtualMachine) -> R,
{
    SESSION.lock().unwrap().interp.enter(f)
}

pub fn push_value(c: u32) {
    SESSION.lock().unwrap().data_buffer.push(c as u8);
}
