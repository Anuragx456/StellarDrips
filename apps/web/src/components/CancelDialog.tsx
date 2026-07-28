"use client";

import { useCancel } from "@/hooks/useCancel";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";
import { formatXlm } from "@/lib/types";
import { GlowButton } from "@/components/primitives/GlowButton";
import { X, AlertTriangle } from "lucide-react";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  subscriber: string;
  id: number;
  refundRecipient: string;
  escrowBalance: bigint;
  onSuccess: () => void;
}

export function CancelDialog({ open, onClose, subscriber, id, refundRecipient, escrowBalance, onSuccess }: CancelDialogProps) {
  const { status, execute, reset } = useCancel();

  if (!open) return null;

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleConfirm = async () => {
    if (isPending) return;
    await execute({ subscriber, id, refundRecipient });
  };

  const handleClose = () => {
    reset();
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
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[var(--faint)] transition-colors hover:text-[var(--text)]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--danger)]/10">
            <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-semibold text-[var(--danger)]">
            Cancel Subscription
          </h3>
        </div>

        <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          <p>This will immediately cancel this subscription and refund the remaining escrow balance.</p>
          <p>
            Refund amount: <span className="font-mono font-medium text-[var(--text)]">{formatXlm(escrowBalance)} XLM</span>
          </p>
          <p className="font-mono text-xs text-[var(--faint)]">
            Refund: {refundRecipient.slice(0, 8)}…
          </p>
        </div>

        <TransactionStatus
          status={txStatus}
          txHash={status.type === "success" ? status.txHash : undefined}
          error={status.type === "error" ? status.error : undefined}
        />

        <div className="mt-5 flex gap-3">
          <GlowButton
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 !border-[var(--danger)]/30 !text-[var(--danger)] !bg-[var(--danger)]/10"
            variant="ghost"
          >
            {isPending ? "Cancelling…" : "Confirm Cancel"}
          </GlowButton>
          <GlowButton
            onClick={handleClose}
            disabled={isPending}
            variant="ghost"
          >
            Keep Subscription
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
