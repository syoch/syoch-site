use super::KernelResource;

#[derive(Debug, Hash)]
pub struct LockedResource {
    resource: KernelResource,
    kernel_side_lock_id: u128,
    pid: u128,
}

impl LockedResource {
    pub fn new(resource: KernelResource) -> LockedResource {
        LockedResource {
            resource,
            kernel_side_lock_id: 0,
            pid: 0,
        }
    }
    pub fn get_resource(&self) -> &KernelResource {
        &self.resource
    }
}
