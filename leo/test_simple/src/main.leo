program test_esocial_v1.aleo {
    mapping counter: address => u64;
    
    async transition increment() -> Future {
        return finalize_increment(self.caller);
    }
    async function finalize_increment(caller: address) {
        let c: u64 = counter.get_or_use(caller, 0u64);
        counter.set(caller, c + 1u64);
    }
}
