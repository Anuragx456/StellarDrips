"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { WalletProvider } from "@/context/WalletContext";
import { useWallet } from "@/context/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { PaymentForm } from "@/components/PaymentForm";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SubscriptionList } from "@/components/SubscriptionList";
import { EventDashboard } from "@/components/EventDashboard";
import { TopUpDialog } from "@/components/TopUpDialog";
import { CancelDialog } from "@/components/CancelDialog";
import { NetworkBadge } from "@/components/primitives/NetworkBadge";
import { ConnectWallet } from "@/components/ConnectWallet";
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
    <div className="flex flex-col min-h-screen">
      {/* Cinematic Azure nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Stellar Drips" width={140} height={32} className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            {isConnected && isTestnet && <NetworkBadge />}
            {isConnected && address && (
              <div className="flex items-center gap-2 text-xs text-[var(--faint)]">
                {isLoading ? (
                  <span className="inline-block h-3 w-20 animate-pulse rounded-full bg-[var(--surface-3)]" />
                ) : error ? (
                  <span className="hidden text-[var(--danger)] sm:inline">{error}</span>
                ) : formatted ? (
                  <span className="hidden font-mono text-[var(--muted)] sm:inline">{formatted} XLM</span>
                ) : null}
              </div>
            )}
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center mx-auto py-24 px-6 gap-12">
        {/* Wallet status */}
        {isConnected && address && (
          <header className="flex flex-col items-center gap-3 text-center w-full max-w-lg">
            {!isTestnet && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--warn)]/30 bg-[var(--warn)]/10 px-4 py-2 text-xs text-[var(--warn)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--warn)]" />
                Switch wallet network to Testnet
              </div>
            )}
            {isTestnet && (
              <a
                href={`https://friendbot.stellar.org?addr=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                🪣 Get testnet XLM from Friendbot
              </a>
            )}
          </header>
        )}

        {/* Disconnected */}
        {!isConnected && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6 text-center w-full max-w-lg py-16"
          >
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-[1.05] text-[var(--text)]">
              Automated recurring payments on <span className="text-[var(--accent-bright)]">Stellar</span>
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
              Create subscription-based payments powered by Soroban smart contracts.
              Connect your wallet to get started.
            </p>
          </motion.section>
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

export default function AppPage() {
  return (
    <WalletProvider>
      <DappContent />
    </WalletProvider>
  );
}
