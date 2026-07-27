"use client";

import { useWallet } from "@/context/WalletContext";

export default function Home() {
  const { address, isConnected, isTestnet } = useWallet();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 text-center gap-8">
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
          Stellar Drips
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Recurring payments and subscriptions on the Stellar network.
          Powered by Soroban smart contracts.
        </p>

        {/* Wallet status */}
        {isConnected && address ? (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950 px-5 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-500" />
              Wallet connected
            </div>
            <code className="text-sm font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg">
              {address}
            </code>
            {!isTestnet && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠ Switch wallet network to Testnet
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Connect your wallet using the button above to get started.
          </p>
        )}
      </main>
    </div>
  );
}
