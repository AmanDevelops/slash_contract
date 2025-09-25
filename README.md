# 📜 SlashContract - Decentralized Work Agreements

<div align="center">
<img width="300" height="300" alt="slash-contract" src="https://github.com/user-attachments/assets/35e56c2f-a4c1-4e6e-9399-e3972aae9b45" />
</div>
<br>

SlashContract is a decentralized application (dApp) built on the Aptos blockchain ⛓️ using Next.js. It provides a trustless platform for employers and workers to create, manage, and settle work agreements 🤝. By leveraging smart contracts, it ensures that funds are held in escrow 💰 and disbursed automatically according to predefined rules, fostering transparency and security 🔍.

The application currently features a fully functional landing page and an employer dashboard for contract management.

## ✨ Key Features

-   **📝 On-Chain Contract Creation**: Employers can define all aspects of a work agreement—scope, payment, deadline, and penalties—and record them immutably on the Aptos blockchain.
-   **🏦 Trustless Escrow**: When an employer creates a contract, the payment amount is automatically locked in the smart contract, guaranteeing the availability of funds for the worker upon successful completion.
-   **💼 Wallet Integration**: Utilizes the Aptos Wallet Adapter for seamless connection with popular Aptos wallets, enabling easy transaction signing and interaction with the dApp.
-   **🖥️ Employer Dashboard**: A clean and intuitive interface for employers to create new work contracts, monitor the status of ongoing agreements, mark tasks as complete, and settle payments.
-   **📱 Responsive UI**: Built with Tailwind CSS and shadcn/ui for a modern, responsive user experience across all devices.

## 🛠️ Technology Stack

This project integrates a modern web2 front-end with a web3 back-end:

-   **Frontend**: Next.js, React, TypeScript
-   **Blockchain**: Aptos 🔗
-   **Smart Contract Language**: Move 📜
-   **Styling**: Tailwind CSS, shadcn/ui 🎨
-   **Aptos SDKs**: `@aptos-labs/ts-sdk`, `@aptos-labs/wallet-adapter-react` for client-side interaction with the Aptos network.

## ⚙️ How It Works

The workflow is designed to be straightforward and secure for both parties involved.

1.  **🔗 Connect Wallet**: An employer connects their Aptos wallet to the application.
2.  **✍️ Create Contract**: From the dashboard, the employer fills out a form to create a new contract. This includes specifying the worker's address, a title and description for the job, the payment amount in OCTAS, the number of days for completion, and a penalty amount for missing the deadline.
3.  **💸 Fund Escrow**: Upon submission, the employer signs a transaction that deploys the contract to the blockchain and transfers the specified payment amount from their wallet into the contract's escrow.
4.  **📋 Manage Contracts**: The newly created contract appears on the employer's dashboard with an "In Progress" status. The employer can view all details of their active and completed contracts.
5.  **✅ Mark Completion**: Once the worker has finished the task, the employer can sign a transaction to mark the contract as "Completed".
6.  **💰 Settle and Pay**: The employer triggers the final "Settle & Pay" action. The smart contract automatically executes the `refundorfine` function, which verifies the completion status and deadline.
    -   If the work was completed on time, the full amount is transferred to the worker's wallet.
    -   If the deadline was missed, the penalty is subtracted from the total amount, and the remainder is sent to the worker. Any leftover funds (e.g., the penalty amount) are returned to the employer.

## 📄 Smart Contract Functions

The core logic of the dApp is powered by the `slash_contract` Move module. It defines the data structures and functions for managing work agreements on-chain.

### 📦 Data Structures

-   `WorkContract`: A struct that stores all the essential details of a work agreement, including the employer and worker addresses, payment amount, deadline, penalty, and completion status.
-   `WorkContractState`: A resource struct stored under the employer's account. It contains tables to manage all contracts (`contracts`), the funds locked in escrow for each contract (`balances`), and a list of contract IDs.

### ➡️ Entry Functions

These functions are callable by users to create or modify the state of the blockchain.

-   `create_contract(employer: &signer, worker: address, amount: u64, ...)`
    -   **Purpose**: Creates and funds a new work contract.
    -   **Action**: An `employer` signs a transaction to define a new contract. The function validates that the `penalty` does not exceed the `amount`. It then withdraws the `amount` from the employer's account and locks it within the smart contract. A new `WorkContract` is created and stored in the employer's `WorkContractState`.

-   `mark_completed(account: &signer, employer_addr: address, contract_id: u64)`
    -   **Purpose**: Marks a specific contract as completed.
    -   **Action**: This can be called by either the `employer` or the `worker` associated with the contract. It sets the `is_completed` flag of the specified `contract_id` to `true`.

-   `refund_or_fine(employer: &signer, contract_id: u64)`
    -   **Purpose**: Settles a contract by distributing the escrowed funds.
    -   **Action**: Only the `employer` can call this function. It checks the contract's `is_completed` status and whether the `deadline` has passed.
        -   If completed on time, the full `amount` is sent to the worker.
        -   If completed late or not completed, the `penalty` is subtracted from the `amount`, the worker receives the difference, and the penalty amount is returned to the employer.
        -   If the penalty is greater than or equal to the amount, the worker receives nothing, and the full amount is returned to the employer.
    -   After payment, the `is_claimed` flag is set to `true` to prevent double payment.

### 🔎 View Functions

These are read-only functions that do not require a transaction and can be called to query data from the blockchain.

-   `get_contract_by_employer(employer_addr: address, contract_id: u64): WorkContract`
    -   **Purpose**: Retrieves the details of a single work contract by its ID.
    -   **Returns**: The `WorkContract` struct for the given `contract_id`.

-   `get_all_contracts_by_employer(employer_addr: address): vector<WorkContract>`
    -   **Purpose**: Retrieves all contracts created by a specific employer.
    -   **Returns**: A vector containing all `WorkContract` structs associated with the `employer_addr`.

## 🚀 Getting Started

To run this project locally, you will need Node.js and the Aptos CLI installed.

### 1. 🛠️ Environment Setup

First, clone the repository to your local machine:

```bash
git clone https://github.com/AmanDevelops/slash_contract.git
cd slash_contract
```

Install the necessary dependencies:

```bash
npm install
```

Create a `.env` file in the root directory and add the following environment variables. This is necessary for compiling and publishing the smart contract.

```
NEXT_PUBLIC_MODULE_PUBLISHER_ACCOUNT_ADDRESS=<YOUR-APTOS-ACCOUNT-ADDRESS>
NEXT_PUBLIC_MODULE_ADDRESS=<YOUR-APTOS-ACCOUNT-ADDRESS>
NEXT_PUBLIC_APP_NETWORK=devnet
```

### 2. 🚀 Smart Contract Deployment

The smart contract is written in Move and is located in the `/contract` directory.

**Compile the contract:**
This command compiles the Move code and generates the necessary metadata.

```bash
npm run move:compile
```

**Publish the contract:**
This script publishes the compiled module to the specified network (e.g., devnet). Ensure the account in your `.env` file has enough funds to cover the transaction fees.

```bash
npm run move:publish
```

### 3. ▶️ Run the Frontend

Once the contract is on-chain, you can start the Next.js development server.

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application in action.

## 📜 Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run move:compile`: Compiles the Move smart contract.
-   `npm run move:publish`: Publishes the smart contract to the Aptos network.
-   `npm run move:test`: Runs tests for the smart contract.

## ©️ License

This project is licensed under the Apache License 2.0.
