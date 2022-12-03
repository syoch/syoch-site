use std::collections::HashMap;

enum PollResult<Ret> {
    Pending,
    Done(Ret),
}

trait Process<Ret> {
    fn poll(&mut self) -> PollResult<Ret>;
}

struct Kernel<P: Process<i64>> {
    processes: HashMap<u128, P>,
}

impl<P: Process<i64>> Kernel<P> {
    pub fn new() -> Kernel<P> {
        Kernel {
            processes: HashMap::new(),
        }
    }

    fn find_free_pid(&mut self) -> u128 {
        let mut pid: u128 = 0;

        while self.processes.contains_key(&pid) {
            pid += 1;
        }

        return pid;
    }

    pub fn register_process(&mut self, process: P) {
        let pid = self.find_free_pid();

        self.processes.insert(pid, process);
    }

    pub fn start(&mut self) {
        while !self.processes.is_empty() {
            let mut process_to_kill = vec![];
            for (pid, p) in &mut self.processes {
                match p.poll() {
                    PollResult::Pending => (),
                    PollResult::Done(n) => {
                        println!("Process<{pid}> Returns {n}");
                        process_to_kill.push(*pid);
                    }
                }
            }

            for pid in process_to_kill {
                self.processes.remove(&pid);
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    struct TestProcess {
        n: u8,
        stop: u8,
    }

    impl TestProcess {
        fn new(n: u8) -> TestProcess {
            TestProcess { n, stop: n + 10 }
        }
    }

    impl Process<i64> for TestProcess {
        fn poll(&mut self) -> PollResult<i64> {
            println!("n = {}", self.n);
            self.n += 1;

            if self.n == self.stop {
                return PollResult::Done(0 as i64);
            } else {
                return PollResult::Pending;
            }
        }
    }

    #[test]
    fn kernel() {
        let p1 = TestProcess::new(0);
        let p2 = TestProcess::new(10);
        let mut k = Kernel::new();

        k.register_process(p1);
        k.register_process(p2);

        k.start();
    }
}
