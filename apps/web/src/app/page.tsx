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

export default function Home() {
  const { address, isConnected, isTestnet } = useWallet();
  const { balance, isLoading, error } = useBalance();

  // Dialog state
  const [topUpTarget, setTopUpTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  const formatted = balance
    ? Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      })
    : null;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center py-8 px-4 gap-10">
        {/* Header */}
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Stellar Drips
          </h1>
          <p className="max-w-lg text-base text-zinc-600 dark:text-zinc-400">
            Recurring payments and subscriptions on the Stellar network.
          </p>

          {/* Wallet status */}
          {isConnected && address && (
            <div className="flex flex-col items-center gap-2">
              <code className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg break-all max-w-full">
                {address}
              </code>

              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {isLoading ? (
                  <span className="animate-pulse">Loading balance…</span>
                ) : error ? (
                  <span className="text-red-500">⚠ {error}</span>
                ) : formatted ? (
                  <>Balance: <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatted}</strong> XLM</>
                ) : null}
              </div>

              {!isTestnet && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠ Switch wallet network to Testnet
                </p>
              )}

              {isTestnet && (
                <a
                  href={`https://friendbot.stellar.org?addr=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
                >
                  🪣 Get testnet XLM from Friendbot
                </a>
              )}
            </div>
          )}
        </header>

        {/* Disconnected state */}
        {!isConnected && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Connect your wallet using the button above to get started.
          </p>
        )}

        {/* Payment form */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <PaymentForm />
          </section>
        )}

        {/* Subscribe form */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
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
