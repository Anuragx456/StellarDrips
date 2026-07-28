"use client";

import { useState } from "react";
import { WalletProvider } from "@/context/WalletContext";
import { useWallet } from "@/context/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { PaymentForm } from "@/components/PaymentForm";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SubscriptionList } from "@/components/SubscriptionList";
import { EventDashboard } from "@/components/EventDashboard";
import { TopUpDialog } from "@/components/TopUpDialog";
import { CancelDialog } from "@/components/CancelDialog";
import type { Subscription } from "@/lib/types";

function DappContent() {
  const { address, isConnected, isTestnet } = useWallet();
  const { balance, isLoading, error } = useBalance();

  const [topUpTarget, setTopUpTarget] = useState<Subscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);

  const formatted = balance
    ? Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      })
    : null;

  return (
    <div className="flex flex-col flex-1 items-center pt-20">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center py-10 px-6 gap-12">
        {/* Wallet status */}
        {isConnected && address && (
          <header className="flex flex-col items-center gap-3 text-center w-full max-w-lg">
            <div className="flex flex-col items-center gap-2">
              <code className="text-xs font-mono text-[var(--faint)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--r-tile)] break-all max-w-full">
                {address}
              </code>
              <div className="text-sm text-[var(--muted)]">
                {isLoading ? (
                  <span className="animate-pulse">Loading balance…</span>
                ) : error ? (
                  <span className="text-[var(--danger)]">{error}</span>
                ) : formatted ? (
                  <>Balance: <strong className="font-mono text-[var(--text)]">{formatted}</strong> XLM</>
                ) : null}
              </div>
              {!isTestnet && (
                <p className="text-sm text-[var(--warn)]">Switch wallet network to Testnet</p>
              )}
              {isTestnet && (
                <a
                  href={`https://friendbot.stellar.org?addr=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Get testnet XLM from Friendbot
                </a>
              )}
            </div>
          </header>
        )}

        {/* Disconnected */}
        {!isConnected && (
          <section className="flex flex-col items-center gap-6 text-center w-full max-w-lg py-12">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
              Automated recurring payments on Stellar
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
              Create subscription-based payments powered by Soroban smart contracts.
              Connect your wallet to get started.
            </p>
          </section>
        )}

        {/* Forms */}
        {isConnected && isTestnet && (
          <section className="w-full max-w-lg flex flex-col items-center pt-6 border-t border-[var(--border)]">
            <PaymentForm />
          </section>
        )}
        {isConnected && isTestnet && (
          <section className="w-full max-w-lg flex flex-col items-center border-t border-[var(--border)] pt-8">
            <SubscribeForm />
          </section>
        )}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center">
            <SubscriptionList onTopUp={(sub) => setTopUpTarget(sub)} onCancel={(sub) => setCancelTarget(sub)} />
          </section>
        )}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center border-t border-[var(--border)] pt-8">
            <EventDashboard />
          </section>
        )}
      </main>

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

export default function AppPage() {
  return (
    <WalletProvider>
      <DappContent />
    </WalletProvider>
  );
}
