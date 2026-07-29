"use client";

import { useState, type FormEvent } from "react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { ChevronDown } from "lucide-react";
import { SurfaceInput } from "@/components/primitives/SurfaceInput";
import { GlowButton } from "@/components/primitives/GlowButton";
import { DarkCard } from "@/components/primitives/DarkCard";
import { TransactionStatus } from "@/components/TransactionStatus";
import type { TxStatusType } from "@/components/TransactionStatus";

/** Validate a Stellar public key (G…). */
function isValidPublicKey(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value);
}

const INTERVAL_OPTIONS = [
  { label: "Daily", value: 86400 },
  { label: "Weekly (default)", value: 604800 },
  { label: "Monthly (30 days)", value: 2592000 },
];

export function SubscribeForm() {
  const { status, execute, reset } = useSubscribe();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(604800);
  const [initialEscrow, setInitialEscrow] = useState("");
  const [expirationDays, setExpirationDays] = useState(365);

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const amountVal = Number(amount);
  const escrowVal = Number(initialEscrow);

  const amountError =
    amount !== "" && (isNaN(amountVal) || amountVal <= 0)
      ? "Amount must be greater than 0"
      : undefined;

  const escrowTooLow =
    amount !== "" &&
    initialEscrow !== "" &&
    !isNaN(amountVal) &&
    !isNaN(escrowVal) &&
    escrowVal < amountVal;

  const escrowError =
    initialEscrow !== "" && (isNaN(escrowVal) || escrowVal <= 0)
      ? "Escrow must be greater than 0"
      : escrowTooLow
        ? "Initial escrow must be at least equal to payment amount"
        : undefined;

  const isValid =
    isValidPublicKey(recipient.trim()) &&
    amount.trim() !== "" &&
    !amountError &&
    initialEscrow.trim() !== "" &&
    !escrowError &&
    expirationDays >= 1;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending || !isValid) return;

    const amountNum = BigInt(Math.round(Number(amount) * 10_000_000));
    const escrowNum = BigInt(Math.round(Number(initialEscrow) * 10_000_000));
    const expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 86400;

    await execute({
      recipient: recipient.trim(),
      amount: amountNum,
      intervalSeconds,
      initialEscrow: escrowNum,
      expirationTime,
    });
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setInitialEscrow("");
    reset();
  };

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
        Create <span className="text-[var(--accent-bright)]">Subscription</span>
      </h2>

      <DarkCard hover={false} className="w-full p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SurfaceInput
            label="Recipient Address"
            placeholder="G…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isPending}
            mono
            error={recipient && !isValidPublicKey(recipient) ? "Must be a valid Stellar address starting with G" : undefined}
          />

          <SurfaceInput
            label="Amount per Payment (XLM)"
            placeholder="10"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            error={amountError}
          />

          {/* Interval select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="interval" className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--faint)]">
              Payment Interval
            </label>
            <div className="relative">
              <select
                id="interval"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                disabled={isPending}
                className="w-full appearance-none rounded-[var(--r-input)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 pr-10 text-sm text-[var(--text)] transition-colors focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
            </div>
          </div>

          <SurfaceInput
            label="Initial Escrow (XLM)"
            placeholder="100"
            inputMode="decimal"
            value={initialEscrow}
            onChange={(e) => setInitialEscrow(e.target.value)}
            disabled={isPending}
            error={escrowError}
            hint="Funds locked in contract — cancel anytime for prorated refund"
          />

          <SurfaceInput
            label="Expires After (days)"
            type="number"
            min={1}
            max={3650}
            value={expirationDays}
            onChange={(e) => setExpirationDays(Number(e.target.value))}
            disabled={isPending}
          />

          <div className="flex gap-3 pt-1">
            <GlowButton
              type="submit"
              variant="primary"
              disabled={isPending || !isValid}
              className="flex-1"
            >
              {isPending ? "Subscribing…" : "Create Subscription"}
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
        status={txStatus}
        txHash={status.type === "success" ? status.txHash : undefined}
        error={status.type === "error" ? status.error : undefined}
        onRetry={() => {
          handleSubmit(new Event("submit", { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>);
        }}
      />
    </div>
  );
}
