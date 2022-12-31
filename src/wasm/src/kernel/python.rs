use std::sync::Mutex;

use once_cell::sync::Lazy;
use rustpython::InterpreterConfig;

use rustpython_vm::{
    builtins::PyBaseException, convert::IntoPyException, Interpreter, PyRef, Settings,
    VirtualMachine,
};

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
    unreachable!();
}

fn init_vm(vm: &VirtualMachine) {}

static INTERPRETER: Lazy<Mutex<Interpreter>> = Lazy::new(|| {
    println!("Initializing Python VM...");
    let mut setting = Settings::default();
    setting.debug = true;

    let interp = InterpreterConfig::new()
        .settings(setting)
        .init_stdlib()
        .interpreter();

    interp.enter(init_vm);
    println!("Initializing Python VM...DONE!");

    Mutex::new(interp)
});

pub fn get_interpreter() -> &'static Mutex<Interpreter> {
    &INTERPRETER
}
