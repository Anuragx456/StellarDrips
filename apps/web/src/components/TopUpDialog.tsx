"use client";

import { useState, type FormEvent } from "react";
import { useTopUp } from "@/hooks/useTopUp";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  subscriber: string;
  id: number;
  currentEscrow: bigint;
  onSuccess: () => void;
}

function formatXlm(balance: bigint): string {
  return (Number(balance) / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function TopUpDialog({ open, onClose, subscriber, id, currentEscrow, onSuccess }: TopUpDialogProps) {
  const { status, execute, reset } = useTopUp();
  const [amount, setAmount] = useState("");

  if (!open) return null;

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    const amountNum = BigInt(Math.round(Number(amount) * 10_000_000));
    await execute({ subscriber, id, amount: amountNum });
  };

  const handleClose = () => {
    reset();
    setAmount("");
    onClose();
  };

  if (status.type === "success") {
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  }

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Top Up Escrow</h3>

        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Current escrow: <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatXlm(currentEscrow)} XLM</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="topup-amount" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Amount to Add (XLM)
            </label>
            <input
              id="topup-amount"
              type="text"
              inputMode="decimal"
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            />
          </div>

          <TransactionStatus
            status={txStatus}
            txHash={status.type === "success" ? status.txHash : undefined}
            error={status.type === "error" ? status.error : undefined}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending || !amount.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Confirming…" : "Confirm Top Up"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
