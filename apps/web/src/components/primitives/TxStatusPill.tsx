"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type TxStatus = "pending" | "success" | "failed";

interface TxStatusPillProps {
  status: TxStatus;
  message?: string;
  className?: string;
}

const config: Record<TxStatus, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  pending: {
    bg: "bg-[var(--accent-soft)]",
    text: "text-[var(--accent)]",
    dot: "bg-[var(--accent)]",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  success: {
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    bg: "bg-[var(--danger)]/10",
    text: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

/**
 * Styled status pill for transaction states.
 * Used inline in cards, dialogs, and event items.
 */
export function TxStatusPill({ status, message, className = "" }: TxStatusPillProps) {
  const c = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-medium ${c.bg} ${c.text} ${className}`}
    >
      {c.icon}
      {message ?? (status === "pending" ? "Pending" : status === "success" ? "Confirmed" : "Failed")}
    </span>
  );
}
