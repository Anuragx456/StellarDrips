"use client";

import type { Subscription } from "@/lib/types";
import { formatXlm, formatDate, shortAddress } from "@/lib/types";

interface SubscriptionCardProps {
  sub: Subscription;
  onTopUp: () => void;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  0: { label: "Active", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  1: { label: "Cancelled", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500 dark:text-zinc-400", dot: "bg-zinc-400" },
  2: { label: "Expired", bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
};

function escrowWidth(sub: Subscription): string {
  if (sub.amount <= 0) return "0%";
  const pct = Number((sub.escrowBalance * BigInt(100)) / sub.amount);
  return `${Math.min(100, pct)}%`;
}

export function SubscriptionCard({ sub, onTopUp, onCancel }: SubscriptionCardProps) {
  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG[2];
  const isActive = sub.status === 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs text-zinc-400 font-mono">#{sub.paymentCount} payments</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Recipient</span>
        <span className="text-sm font-mono text-zinc-800 dark:text-zinc-200" title={sub.recipient}>
          {shortAddress(sub.recipient)}
        </span>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Amount</span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {formatXlm(sub.amount)} XLM
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {sub.intervalSeconds >= 2592000 ? "Monthly" : sub.intervalSeconds >= 604800 ? "Weekly" : "Daily"}
          </span>
          <span className="text-xs text-zinc-400">
            Every {sub.intervalSeconds >= 86400 ? `${Math.round(sub.intervalSeconds / 86400)}d` : `${sub.intervalSeconds}s`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Escrow</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{formatXlm(sub.escrowBalance)} XLM</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: escrowWidth(sub) }}
          />
        </div>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        {isActive && sub.nextPaymentTime > 0 ? (
          <>Next: {formatDate(sub.nextPaymentTime)}</>
        ) : (
          <>{sub.status === 2 ? "Expired" : "No upcoming payments"}</>
        )}
      </div>

      {isActive && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onTopUp}
            className="flex-1 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--brand-hover)] transition-colors cursor-pointer"
          >
            Top Up
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-xs font-medium text-[var(--danger-text)] dark:text-[var(--danger-text)] hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
