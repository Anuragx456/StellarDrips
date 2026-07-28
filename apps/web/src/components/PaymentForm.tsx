"use client";

import { useState, type FormEvent } from "react";
import { usePayment, type TransactionRecord } from "@/hooks/usePayment";

// ---------------------------------------------------------------------------
// RecentTransactions
// ---------------------------------------------------------------------------

function RecentTransactions({
  txs,
}: {
  txs: TransactionRecord[];
}) {
  if (txs.length === 0) return null;

  return (
    <div className="w-full max-w-md mt-8">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
        Recent Transactions
      </h3>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {txs.map((tx) => (
          <div
            key={tx.txHash}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {tx.destination}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {tx.amount} XLM
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`size-1.5 rounded-full ${
                  tx.success ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
              >
                {tx.txHash.slice(0, 8)}…
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ReturnType<typeof usePayment>["status"] }) {
  switch (status.type) {
    case "idle":
      return null;
    case "building":
      return (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="size-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          Building transaction…
        </div>
      );
    case "signing":
      return (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="size-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          Sign in your wallet…
        </div>
      );
    case "submitting":
      return (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="size-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          Submitting to network…
        </div>
      );
    case "success":
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ✅ Transaction successful
          </span>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${status.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
          >
            View on Stellar.Expert →
          </a>
        </div>
      );
    case "error":
      return (
        <div className="text-sm text-red-600 dark:text-red-400 text-center">
          ⚠ {status.error}
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// PaymentForm
// ---------------------------------------------------------------------------

export function PaymentForm() {
  const { status, sendXlm, reset, recentTransactions } = usePayment();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    reset();
    await sendXlm(destination.trim(), amount.trim());
  };

  const handleReset = () => {
    setDestination("");
    setAmount("");
    reset();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Send XLM
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4"
      >
        {/* Recipient */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="destination"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Recipient Address
          </label>
          <input
            id="destination"
            type="text"
            placeholder="G…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Amount (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending || !destination.trim() || !amount.trim()}
            className="flex-1 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Sending…" : "Send XLM"}
          </button>

          {status.type !== "idle" && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Status */}
      <StatusBadge status={status} />

      {/* Recent transactions */}
      <RecentTransactions txs={recentTransactions} />
    </div>
  );
}
