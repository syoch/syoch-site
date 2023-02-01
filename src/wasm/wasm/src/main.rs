extern crate kernel;
extern crate python;

use python::PythonProcess;

fn main() {
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
    );
}
