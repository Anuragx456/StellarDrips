"use client";

import { useState, type FormEvent } from "react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { TransactionStatus } from "@/components/TransactionStatus";
import type { TxStatusType } from "@/components/TransactionStatus";

/** Validate a Stellar public key (G…). */
function isValidPublicKey(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value);
}

const INTERVAL_OPTIONS = [
  { label: "Daily", value: 86400 },
  { label: "Weekly", value: 604800 },
  { label: "Monthly (30 days)", value: 2592000 },
];

export function SubscribeForm() {
  const { status, execute, reset } = useSubscribe();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(604800);
  const [initialEscrow, setInitialEscrow] = useState("");
  const [expirationDays, setExpirationDays] = useState(365);

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const amountNum = BigInt(Math.round(Number(amount) * 10_000_000));
    const escrowNum = BigInt(Math.round(Number(initialEscrow) * 10_000_000));
    const expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 86400;

    await execute({
      recipient: recipient.trim(),
      amount: amountNum,
      intervalSeconds,
      initialEscrow: escrowNum,
      expirationTime,
    });
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setInitialEscrow("");
    reset();
  };

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Subscription
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Recipient */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipient" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            placeholder="G…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {recipient && !isValidPublicKey(recipient) && (
            <p className="text-xs text-red-500">Must be a valid Stellar address starting with G</p>
          )}
        </div>

        {/* Amount per interval */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Amount per Payment (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Interval */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="interval" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Payment Interval
          </label>
          <select
            id="interval"
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Initial Escrow */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="escrow" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Initial Escrow (XLM)
          </label>
          <input
            id="escrow"
            type="text"
            inputMode="decimal"
            placeholder="100"
            value={initialEscrow}
            onChange={(e) => setInitialEscrow(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Expiration */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expiration" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Expires After (days)
          </label>
          <input
            id="expiration"
            type="number"
            min={1}
            max={3650}
            value={expirationDays}
            onChange={(e) => setExpirationDays(Number(e.target.value))}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending || !recipient.trim() || !amount.trim() || !initialEscrow.trim()}
            className="flex-1 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Subscribing…" : "Create Subscription"}
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

      <TransactionStatus
        status={txStatus}
        txHash={status.type === "success" ? status.txHash : undefined}
        error={status.type === "error" ? status.error : undefined}
        onRetry={() => { handleSubmit(new Event("submit", { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>); }}
      />
    </div>
  );
}
