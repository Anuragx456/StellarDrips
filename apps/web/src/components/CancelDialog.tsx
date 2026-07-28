"use client";

import { useCancel } from "@/hooks/useCancel";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";
import { formatXlm } from "@/lib/types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[var(--danger-text)] dark:text-[var(--danger-text)] mb-2">Cancel Subscription</h3>

        <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 space-y-2">
          <p>This will immediately cancel this subscription and refund the remaining escrow balance.</p>
          <p>Refund amount: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatXlm(escrowBalance)} XLM</span></p>
          <p className="text-xs text-zinc-500">Refund recipient: {refundRecipient.slice(0, 8)}…</p>
        </div>

        <TransactionStatus
          status={txStatus}
          txHash={status.type === "success" ? status.txHash : undefined}
          error={status.type === "error" ? status.error : undefined}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-[var(--danger-text)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--danger-hover)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Cancelling…" : "Confirm Cancel"}
          </button>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Keep Subscription
          </button>
        </div>
      </div>
    </div>
  );
}
