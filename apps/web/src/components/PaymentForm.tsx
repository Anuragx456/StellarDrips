"use client";

import { useState, type FormEvent } from "react";
import { usePayment, type TransactionRecord } from "@/hooks/usePayment";
import { SurfaceInput } from "@/components/primitives/SurfaceInput";
import { GlowButton } from "@/components/primitives/GlowButton";
import { DarkCard } from "@/components/primitives/DarkCard";
import { MonoValue } from "@/components/primitives/MonoValue";
import { TxStatusPill } from "@/components/primitives/TxStatusPill";
import { TransactionStatus } from "@/components/TransactionStatus";
import { ArrowUpRight } from "lucide-react";

// ---------------------------------------------------------------------------
// RecentTransactions
// ---------------------------------------------------------------------------

function RecentTransactions({ txs }: { txs: TransactionRecord[] }) {
  if (txs.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--faint)]">
        Recent Transactions
      </h3>
      <div className="flex flex-col gap-2">
        {txs.map((tx) => (
          <DarkCard key={tx.txHash} hover={false} className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <MonoValue value={tx.destination} truncate />
              <span className="text-xs font-medium text-[var(--text)]">
                {tx.amount} XLM
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TxStatusPill status={tx.success ? "success" : "failed"} />
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-[var(--accent)] hover:underline"
              >
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PaymentForm
// ---------------------------------------------------------------------------

export function PaymentForm() {
  const { status, sendXlm, reset, recentTransactions } = usePayment();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    reset();
    await sendXlm(destination.trim(), amount.trim());
  };

  const handleReset = () => {
    setDestination("");
    setAmount("");
    reset();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
        Send <span className="text-[var(--accent-bright)]">XLM</span>
      </h2>

      <DarkCard hover={false} className="w-full p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SurfaceInput
            label="Recipient Address"
            placeholder="G…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={isPending}
            mono
          />

          <SurfaceInput
            label="Amount (XLM)"
            placeholder="0.0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            hint="Enter the amount of XLM to send"
          />

          <div className="flex gap-3 pt-1">
            <GlowButton
              type="submit"
              variant="primary"
              disabled={isPending || !destination.trim() || !amount.trim()}
              className="flex-1"
            >
              {isPending ? "Sending…" : "Send XLM"}
            </GlowButton>

            {status.type !== "idle" && (
              <GlowButton
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isPending}
              >
                Clear
              </GlowButton>
            )}
          </div>
        </form>
      </DarkCard>

      <TransactionStatus
        status={
          status.type === "building" || status.type === "signing" || status.type === "submitting"
            ? "pending"
            : status.type === "success"
              ? "success"
              : status.type === "error"
                ? "error"
                : "idle"
        }
        txHash={status.type === "success" ? status.txHash : undefined}
        error={status.type === "error" ? status.error : undefined}
      />

      <RecentTransactions txs={recentTransactions} />
    </div>
  );
}
