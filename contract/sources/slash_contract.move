module 0xbcd2f2175728ca6431ba0b833f282cb62437f8a29b25671712f032dc719d00d8::slash_contract {
    use std::signer;
    use std::vector;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::table;
    use aptos_framework::timestamp;
    #[test_only]
    use std::debug;

    //:!:>resource
    struct WorkContract has copy, drop, store {
        employer: address,
        worker: address,
        title: string,
        description: string,
        amount: u64,
        deadline: u64,         // task must be completed before this
        is_completed: bool,
        is_claimed: bool,
        penalty: u64           // fine amount if failed
    }

    //<:!:resource

    struct WorkContractState has key {
    contracts: table::Table<u64, WorkContract>,  // contractId -> contract
    balances: table::Table<u64, coin::Coin<AptosCoin>>, // contractId -> locked funds
    contract_ids: vector<u64>,
    next_id: u64,  // incrementing id for contracts
    }

    const ERROR_PENALTY_TOO_HIGH: u64 = 1;

    public entry fun create_contract(
        employer: &signer,
        worker: address,
        amount: u64,
        deadline: u64,
        penalty: u64,
        title: string,
        description: string
    ) acquires WorkContractState {
        let employer_addr = signer::address_of(employer);

        // ensure penalty is not greater than amount
        assert(penalty <= amount, ERROR_PENALTY_TOO_HIGH);

        if (!exists<WorkContractState>(employer_addr)) {
            move_to(employer, WorkContractState {
                contracts: table::new(),
                balances: table::new(),
                contract_ids: vector::empty<u64>(),
                next_id: 0,
            });
        };

        let state = borrow_global_mut<WorkContractState>(employer_addr);

        let contract_id = state.next_id;
        state.next_id = state.next_id + 1;

        let locked_funds = coin::withdraw<AptosCoin>(employer, amount);

        table::add(&mut state.contracts, contract_id, WorkContract {
            employer: employer_addr,
            worker,
            amount,
            deadline,
            title,
            description,
            penalty,
            is_completed: false,
            is_claimed: false,
        });

        table::add(&mut state.balances, contract_id, locked_funds);
        vector::push_back(&mut state.contract_ids, contract_id);
    }


///////////////////////////////////////////////////////////////////////////
    //todo make approval from worker or employee
    public entry fun mark_completed(
    account: &signer,
    employer_addr: address,
    contract_id: u64
    ) acquires WorkContractState {
    let caller = signer::address_of(account);

    // Access employer’s state
    assert!(exists<WorkContractState>(employer_addr), 1);
    let state = borrow_global_mut<WorkContractState>(employer_addr);

    // Contract must exist
    assert!(table::contains(&state.contracts, contract_id), 2);
    let contract = table::borrow_mut(&mut state.contracts, contract_id);

    // Only employer or worker can call
    assert!(caller == contract.employer || caller == contract.worker, 3);

    // Prevent double marking
    assert!(!contract.is_completed, 4);

    // Mark completed
    contract.is_completed = true;
    }

/////////////////////////////////////////////////////////////////////////////////////
public entry fun refund_or_fine(
    employer: &signer,
    contract_id: u64
) acquires WorkContractState {
    let employer_addr = signer::address_of(employer);
    assert!(exists<WorkContractState>(employer_addr), 10);
    let state = borrow_global_mut<WorkContractState>(employer_addr);
    assert!(table::contains(&state.contracts, contract_id), 11);

    let contract = table::borrow_mut(&mut state.contracts, contract_id);
    assert!(signer::address_of(employer) == contract.employer, 12);
    assert!(!contract.is_claimed, 13);

    let now = timestamp::now_seconds();

    let coins = table::remove(&mut state.balances, contract_id);
    let payment_after_penalty: u64;

if (contract.is_completed && now <= contract.deadline) {
    payment_after_penalty = contract.amount; // full payment if completed before deadline
} else if (contract.penalty < contract.amount) {
    payment_after_penalty = contract.amount - contract.penalty;
} else {
    payment_after_penalty = 0; // penalty equals or exceeds amount
};


coin::deposit<AptosCoin>(contract.worker, coin::extract(&mut coins, payment_after_penalty));
    if (coin::value(&coins) > 0) {
        coin::deposit<AptosCoin>(employer_addr, coins); // leftover back to employer
    } else {
    // Explicitly destroy the empty coin object
    coin::destroy_zero<AptosCoin>(coins);
};

    contract.is_claimed = true;
}

#[view]
    public fun get_contract_by_employer(
        employer_addr: address,
        contract_id: u64
    ): WorkContract acquires WorkContractState {
        // Assert the state exists to provide a clear error if not
        assert!(exists<WorkContractState>(employer_addr), 50);

        let state = borrow_global<WorkContractState>(employer_addr);
        assert!(table::contains(&state.contracts, contract_id), 51);

        // Borrow and return a copy of the contract struct
        *table::borrow(&state.contracts, contract_id)
    }

#[view]
public fun get_all_contracts_by_employer(
    employer_addr: address
): vector<WorkContract> acquires WorkContractState {
    assert!(exists<WorkContractState>(employer_addr), 50);

    let state = borrow_global<WorkContractState>(employer_addr);

    // CORRECT: Get the keys from the vector you are maintaining
    let contract_ids = &state.contract_ids;

    let contracts = vector::empty<WorkContract>();
    let i = 0;
    let len = vector::length(contract_ids);

while (i < len) {
    let contract_id = *vector::borrow(contract_ids, i);
    let contract = table::borrow(&state.contracts, contract_id);
    vector::push_back(&mut contracts, *contract);
    i = i + 1;
};


    contracts
}

}
