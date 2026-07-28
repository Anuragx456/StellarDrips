"use client";

import { useState, type FormEvent } from "react";
import { useTopUp } from "@/hooks/useTopUp";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";
import { formatXlm } from "@/lib/types";
import { SurfaceInput } from "@/components/primitives/SurfaceInput";
import { GlowButton } from "@/components/primitives/GlowButton";
import { X } from "lucide-react";

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  subscriber: string;
  id: number;
  currentEscrow: bigint;
  onSuccess: () => void;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[var(--faint)] transition-colors hover:text-[var(--text)]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-semibold text-[var(--text)]">
          Top Up Escrow
        </h3>

        <p className="mt-2 text-xs text-[var(--muted)]">
          Current escrow: <span className="font-mono text-[var(--text)]">{formatXlm(currentEscrow)} XLM</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <SurfaceInput
            label="Amount to Add (XLM)"
            placeholder="50"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            mono
          />

          <TransactionStatus
            status={txStatus}
            txHash={status.type === "success" ? status.txHash : undefined}
            error={status.type === "error" ? status.error : undefined}
          />

          <div className="flex gap-3">
            <GlowButton
              type="submit"
              variant="primary"
              disabled={isPending || !amount.trim()}
              className="flex-1"
            >
              {isPending ? "Confirming…" : "Confirm Top Up"}
            </GlowButton>
            <GlowButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}
