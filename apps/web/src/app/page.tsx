"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { PaymentForm } from "@/components/PaymentForm";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SubscriptionList } from "@/components/SubscriptionList";
import { EventDashboard } from "@/components/EventDashboard";
import { TopUpDialog } from "@/components/TopUpDialog";
import { CancelDialog } from "@/components/CancelDialog";
import type { Subscription } from "@/lib/types";

export default function Home() {
  const { address, isConnected, isTestnet } = useWallet();
  const { balance, isLoading, error } = useBalance();

  // Dialog state
  const [topUpTarget, setTopUpTarget] = useState<Subscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);

  const formatted = balance
    ? Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      })
    : null;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center py-10 px-6 gap-12">
        {/* Wallet status — shown when connected */}
        {isConnected && address && (
          <header className="flex flex-col items-center gap-3 text-center w-full max-w-lg">
            <div className="flex flex-col items-center gap-2">
              <code className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg break-all max-w-full">
                {address}
              </code>

              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {isLoading ? (
                  <span className="animate-pulse">Loading balance…</span>
                ) : error ? (
                  <span className="text-[var(--danger-text)]">{error}</span>
                ) : formatted ? (
                  <>Balance: <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatted}</strong> XLM</>
                ) : null}
              </div>

              {!isTestnet && (
                <p className="text-sm text-[var(--warning-text)]">
                  ⚠ Switch wallet network to Testnet
                </p>
              )}

              {isTestnet && (
                <a
                  href={`https://friendbot.stellar.org?addr=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  🪣 Get testnet XLM from Friendbot
                </a>
              )}
            </div>
          </header>
        )}

        {/* Disconnected state */}
        {!isConnected && (
          <section className="flex flex-col items-center gap-6 text-center w-full max-w-lg py-12">
            <span className="text-5xl">✦</span>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
              Automated recurring payments on Stellar
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Create subscription-based payments powered by Soroban smart contracts.
              Connect your wallet to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="inline-flex items-center gap-1">🟢 Create subscriptions</span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1">🪙 Automated payouts</span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1">📊 Live event feed</span>
            </div>
          </section>
        )}

        {/* Payment form */}
        {isConnected && isTestnet && (
          <section className="w-full max-w-lg flex flex-col items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <PaymentForm />
          </section>
        )}

        {/* Subscribe form */}
        {isConnected && isTestnet && (
          <section className="w-full max-w-lg flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <SubscribeForm />
          </section>
        )}

        {/* Subscription dashboard */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center">
            <SubscriptionList
              onTopUp={(sub) => setTopUpTarget(sub)}
              onCancel={(sub) => setCancelTarget(sub)}
            />
          </section>
        )}

        {/* Event dashboard */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <EventDashboard />
          </section>
        )}
      </main>

      {/* Dialogs */}
      <TopUpDialog
        open={!!topUpTarget}
        onClose={() => setTopUpTarget(null)}
        subscriber={topUpTarget?.subscriber ?? ""}
        id={topUpTarget?.id ?? 0}
        currentEscrow={topUpTarget?.escrowBalance ?? BigInt(0)}
        onSuccess={() => setTopUpTarget(null)}
      />

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        subscriber={cancelTarget?.subscriber ?? ""}
        id={cancelTarget?.id ?? 0}
        refundRecipient={cancelTarget?.subscriber ?? ""}
        escrowBalance={cancelTarget?.escrowBalance ?? BigInt(0)}
        onSuccess={() => setCancelTarget(null)}
      />
    </div>
  );
}
