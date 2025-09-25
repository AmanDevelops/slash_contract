// src/hooks/useSlashContract.ts

import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { useState } from "react";

// --- CONSTANTS ---
// REPLACE WITH YOUR MODULE ADDRESS
const MODULE_ADDRESS = "0xa0686e5c229b06cbc108164cc7538a444264a3678692e51bac46a5ca4a2afd6e";
const MODULE_NAME = "slash_contract";

// --- TYPES ---

// --- APTOS CLIENT ---
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com");

// --- THE HOOK ---
export const useSlashContract = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  /**
   * Calls the `get_all_contracts_by_employer` view function to fetch data.
   */
  const getMyContracts = async () => {
    if (!account) return [];
    // const addressString = account.address.toStringLong();
    // console.log(addressString);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_contracts_by_employer`,
        type_arguments: [],
        arguments: [account.address.toStringLong()],
      };
      const result = await client.view(payload);
      return result[0] as any[]; // The result is nested in an array
    } catch (error) {
      console.error("Error fetching contracts:", error);
      return [];
    }
  };

  /**
   * Submits a transaction to call the `create_contract` entry function.
   */
  const createContract = async (worker: string, amount: number, deadline: number, penalty: number,title: string, description: string ) => {
    if (!account) throw new Error("Wallet not connected");
    setTransactionInProgress(true);

    // ✅ Correct InputTransactionData format
    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_contract`,
        typeArguments: [], // ✅ camelCase
        functionArguments: [worker, amount.toString(), deadline.toString(), penalty.toString(), title, description],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      console.log("Transaction successful:", response.hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  /**
   * Submits a transaction to call the `mark_completed` entry function.
   */
  const markCompleted = async (contractId: number) => {
    if (!account) throw new Error("Wallet not connected");
    setTransactionInProgress(true);

    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::mark_completed`,
        typeArguments: [],
        // Arguments for mark_completed: employer_addr, contract_id
        functionArguments: [account.address, contractId.toString()],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      console.log("Transaction successful:", response.hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  /**
   * Submits a transaction to call the `refund_or_fine` entry function.
   */
  const refundOrFine = async (contractId: number) => {
    if (!account) throw new Error("Wallet not connected");
    setTransactionInProgress(true);

    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::refund_or_fine`,
        typeArguments: [],
        // Argument for refund_or_fine: contract_id
        functionArguments: [contractId.toString()],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      console.log("Transaction successful:", response.hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  // Return all functions so they can be used by your components
  return {
    getMyContracts,
    createContract,
    markCompleted,
    refundOrFine,
    transactionInProgress,
  };
};
