"use client";

import type { Subscription } from "@/lib/types";
import { formatXlm, formatDate, shortAddress } from "@/lib/types";
import { DarkCard } from "@/components/primitives/DarkCard";
import { Pill } from "@/components/primitives/Pill";
import { MonoValue } from "@/components/primitives/MonoValue";
import { GlowButton } from "@/components/primitives/GlowButton";

interface SubscriptionCardProps {
  sub: Subscription;
  onTopUp: () => void;
  onCancel: () => void;
}

function escrowPercent(sub: Subscription): number {
  if (sub.amount <= 0) return 0;
  const pct = Number((sub.escrowBalance * BigInt(100)) / sub.amount);
  return Math.min(100, pct);
}

function intervalLabel(seconds: number): string {
  if (seconds >= 2592000) return "Monthly";
  if (seconds >= 604800) return "Weekly";
  return "Daily";
}

export function SubscriptionCard({ sub, onTopUp, onCancel }: SubscriptionCardProps) {
  const isActive = sub.status === 0;
  const isCancelled = sub.status === 1;

  return (
    <DarkCard className="flex flex-col gap-4 p-5">
      {/* Header: status + payment count */}
      <div className="flex items-center justify-between">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            Active
          </span>
        ) : (
          <Pill className="!bg-[var(--danger)]/10 !text-[var(--danger)]">
            {isCancelled ? "Cancelled" : "Expired"}
          </Pill>
        )}
        <span className="font-mono text-[10px] text-[var(--faint)]">
          #{sub.paymentCount} payments
        </span>
      </div>

      {/* Recipient */}
      <MonoValue label="Recipient" value={shortAddress(sub.recipient)} />

      {/* Amount + Interval */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--faint)]">Amount</span>
          <span className="text-sm font-semibold text-[var(--text)]">
            {formatXlm(sub.amount)} XLM
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs font-medium text-[var(--muted)]">
            {intervalLabel(sub.intervalSeconds)}
          </span>
          <span className="font-mono text-[10px] text-[var(--faint)]">
            Every {sub.intervalSeconds >= 86400 ? `${Math.round(sub.intervalSeconds / 86400)}d` : `${sub.intervalSeconds}s`}
          </span>
        </div>
      </div>

      {/* Escrow bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--faint)]">Escrow</span>
          <span className="font-mono text-[var(--muted)]">{formatXlm(sub.escrowBalance)} XLM</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${escrowPercent(sub)}%` }}
          />
        </div>
      </div>

      {/* Next payment */}
      <div className="text-xs text-[var(--faint)]">
        {isActive && sub.nextPaymentTime > 0 ? (
          <>Next: <span className="font-medium text-[var(--muted)]">{formatDate(sub.nextPaymentTime)}</span></>
        ) : sub.status === 2 ? (
          "Expired"
        ) : (
          "No upcoming payments"
        )}
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex gap-2 pt-1">
          <GlowButton variant="primary" onClick={onTopUp} className="flex-1 !py-2 !text-xs">
            Top Up
          </GlowButton>
          <GlowButton variant="ghost" onClick={onCancel} className="flex-1 !py-2 !text-xs !border-[var(--danger)]/30 !text-[var(--danger)]">
            Cancel
          </GlowButton>
        </div>
      )}
    </DarkCard>
  );
}
