"use client";

import { useWallet } from "@/context/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { PaymentForm } from "@/components/PaymentForm";

function XlmBalance() {
  const { balance, isLoading, error } = useBalance();

  if (isLoading) {
    return (
      <span className="text-sm text-zinc-400 dark:text-zinc-500 animate-pulse">
        Loading balance…
      </span>
    );
  }

  if (error) {
    return (
      <span className="text-sm text-red-500 dark:text-red-400">
        ⚠ {error}
      </span>
    );
  }

  if (balance === null) return null;

  const formatted = Number(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });

  return (
    <span className="text-sm text-zinc-600 dark:text-zinc-400">
      Balance:{" "}
      <strong className="font-mono text-zinc-900 dark:text-zinc-100">
        {formatted}
      </strong>{" "}
      XLM
    </span>
  );
}

export default function Home() {
  const { address, isConnected, isTestnet } = useWallet();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-16 px-6 text-center gap-8">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            Stellar Drips
          </h1>
          <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Recurring payments and subscriptions on the Stellar network.
            Powered by Soroban smart contracts.
          </p>
        </header>

        {/* Wallet status */}
        {isConnected && address ? (
          <section className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950 px-5 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-500" />
              Wallet connected
            </div>
            <code className="text-sm font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg break-all max-w-full">
              {address}
            </code>

            {/* Balance */}
            <div className="mt-1">
              <XlmBalance />
            </div>

            {!isTestnet && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠ Switch wallet network to Testnet
              </p>
            )}

            {/* Friendbot link */}
            {isTestnet && (
              <a
                href={`https://friendbot.stellar.org?addr=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
              >
                🪣 Get testnet XLM from Friendbot
              </a>
            )}
          </section>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Connect your wallet using the button above to get started.
          </p>
        )}

        {/* Payment form — only when connected */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <PaymentForm />
          </section>
        )}
      </main>
    </div>
  );
}
