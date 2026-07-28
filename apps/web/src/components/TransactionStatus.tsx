"use client";

import { EXPLORER_BASE } from "@/lib/types";

export type TxStatusType = "idle" | "pending" | "success" | "error";

export interface TransactionStatusProps {
  status: TxStatusType;
  txHash?: string;
  error?: string;
  onRetry?: () => void;
}

export function TransactionStatus({
  status,
  txHash,
  error,
  onRetry,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-md">
      {/* Pending */}
      {status === "pending" && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="size-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          Confirming transaction…
        </div>
      )}

      {/* Success */}
      {status === "success" && txHash && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium text-[var(--success-text)]">
            ✅ Transaction confirmed
          </span>
          <a
            href={`${EXPLORER_BASE}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-[var(--brand)] dark:text-[var(--brand)] underline-offset-2 hover:underline"
          >
            View on Stellar.Expert →
          </a>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-[var(--danger-text)]">
            ⚠ {error ?? "Transaction failed"}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-[var(--brand)] dark:text-[var(--brand)] underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
