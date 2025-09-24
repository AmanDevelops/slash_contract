// src/pages/dashboard.tsx
"use client";

import { Header } from "@/components/Header";
import { useSlashContract } from "@/hooks/useSlashContract";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, RefreshCcw, Wallet, Plus } from "lucide-react";

export default function DashboardPage() {
  const { getMyContracts, createContract, markCompleted, refundOrFine, transactionInProgress } = useSlashContract();
  const { connected } = useWallet();

  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const refreshContractList = async () => {
    if (!connected) return;
    setIsLoading(true);
    const myContracts = await getMyContracts();
    setContracts(myContracts);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshContractList();
  }, [connected]);

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const worker = formData.get("worker") as string;
    const amount = parseInt(formData.get("amount") as string, 10);
    const penalty = parseInt(formData.get("penalty") as string, 10);
    const days = parseInt(formData.get("days") as string, 10);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;

    await createContract(worker, amount, deadline, penalty, title, description);
    await refreshContractList();
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header />
      <section className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Work Contracts Dashboard</h1>
        <p className="text-gray-400 mb-6">
          Manage and track all your work contracts. Create new contracts, view ongoing work, mark tasks as completed,
          and settle payments—all in one place.
        </p>
      </section>
      <main className="container mx-auto p-8">
        {!connected ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <Wallet className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-xl font-semibold">Please connect your wallet to manage contracts</p>
          </div>
        ) : (
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Contracts</h2>
              <div className="flex gap-3">
                <button
                  onClick={refreshContractList}
                  disabled={isLoading || transactionInProgress}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {isLoading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> Create Contract
                </button>
              </div>
            </div>

            {/* Contracts Section */}
            {isLoading ? (
              <p className="text-gray-400">Loading your contracts...</p>
            ) : contracts.length === 0 ? (
              <p className="text-gray-400">You have not created any contracts yet.</p>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract, id) => (
                  <div
                    key={id}
                    className="p-4 bg-[#0f172a] rounded-xl border border-gray-700 shadow-md hover:border-indigo-600 transition"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-semibold">Contract #{id}</h3>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                          contract.is_completed ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
                        }`}
                      >
                        {contract.is_completed ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Completed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> In Progress
                          </>
                        )}
                      </span>
                    </div>

                    {/* Contract Details */}
                    <div className="space-y-0.5 text-gray-300 text-xs">
                      <p>
                        <span className="font-semibold">Title:</span> {contract.title}
                      </p>
                      <p>
                        <span className="font-semibold">Description:</span> {contract.description}
                      </p>
                      <p>
                        <span className="font-semibold">Worker:</span> {contract.worker}
                      </p>
                      <p>
                        <span className="font-semibold">Amount:</span> {contract.amount} Octas
                      </p>
                      <p>
                        <span className="font-semibold">Penalty:</span> {contract.penalty} Octas
                      </p>
                      <p>
                        <span className="font-semibold">Deadline:</span>{" "}
                        {new Date(contract.deadline * 1000).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={async () => {
                          await markCompleted(id);
                          await refreshContractList();
                        }}
                        disabled={contract.is_completed || transactionInProgress}
                        className="flex-1 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-500 disabled:opacity-60"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={async () => {
                          await refundOrFine(id);
                          await refreshContractList();
                        }}
                        disabled={contract.is_claimed || transactionInProgress || !contract.is_completed}
                        className="flex-1 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Settle & Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a New Contract</h2>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  name="title"
                  placeholder="Contract title"
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Contract description"
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Worker’s Wallet Address</label>
                <input
                  name="worker"
                  placeholder="0x..."
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Amount (Octas)</label>
                <input
                  name="amount"
                  placeholder="1000000"
                  type="number"
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Penalty (Octas)</label>
                <input
                  name="penalty"
                  placeholder="50000"
                  type="number"
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Days to Complete</label>
                <input
                  name="days"
                  placeholder="7"
                  type="number"
                  required
                  className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionInProgress}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {transactionInProgress ? "Processing..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
