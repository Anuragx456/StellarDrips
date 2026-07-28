"use client";

import { EXPLORER_BASE } from "@/lib/types";
import { TxStatusPill } from "@/components/primitives/TxStatusPill";
import { MonoValue } from "@/components/primitives/MonoValue";
import { Loader2 } from "lucide-react";

export type TxStatusType = "idle" | "pending" | "success" | "error";

export interface TransactionStatusProps {
  status: TxStatusType;
  txHash?: string;
  error?: string;
  onRetry?: () => void;
}

/**
 * Transaction status display with styled pills, mono tx hash explorer link,
 * and retry button on error.
 */
export function TransactionStatus({
  status,
  txHash,
  error,
  onRetry,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Pending */}
      {status === "pending" && (
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Confirming transaction…</span>
        </div>
      )}

      {/* Success */}
      {status === "success" && txHash && (
        <div className="flex flex-col items-center gap-2">
          <TxStatusPill status="success" />
          <a
            href={`${EXPLORER_BASE}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 transition-colors hover:opacity-80"
          >
            <MonoValue value={`${txHash.slice(0, 12)}…${txHash.slice(-6)}`} copyable />
            <span className="text-xs text-[var(--accent)]">View →</span>
          </a>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2">
          <TxStatusPill status="failed" message={error?.includes("User") ? "Rejected in wallet" : "Transaction failed"} />
          {error && (
            <p className="max-w-[320px] text-center text-xs text-[var(--muted)]">
              {error}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
