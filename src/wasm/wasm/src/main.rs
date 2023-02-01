extern crate kernel;
extern crate python;

use python::PythonProcess;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut k = kernel::Kernel::default();
    let p = PythonProcess::new(
        r#"async def proc():
    print("print")
    print("/")

    print("step")
    await step()

    print("pending")
    await pending()

wrapper()"#
            .to_string(),
    )
    .unwrap();
    k.register_process(Box::new(p));
    k.start();
    Ok(())
}
