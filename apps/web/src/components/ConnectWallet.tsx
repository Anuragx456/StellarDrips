"use client";

import { useWallet } from "@/context/WalletContext";

export function ConnectWallet() {
  const {
    address,
    isConnected,
    isTestnet,
    isAvailable,
    isConnecting,
    networkPassphrase,
    connect,
    disconnect,
  } = useWallet();

  // ---- Not available (no wallet extension detected) --------------------------
  if (!isAvailable) {
    return (
      <div className="rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-6 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          Install Freighter
        </a>
        <span className="ml-1.5 text-amber-600 dark:text-amber-400">
          · xBull · Albedo · Rabet · Lobstr · Hana · Klever
        </span>
      </div>
    );
  }

  // ---- Connected -------------------------------------------------------------
  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-3">
        {/* Network badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isTestnet
              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
              : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isTestnet ? "bg-yellow-500" : "bg-green-500"
            }`}
          />
          {isTestnet ? "Testnet" : networkPassphrase ?? "Unknown"}
        </span>

        {/* Address */}
        <span className="hidden sm:inline text-sm font-mono text-zinc-600 dark:text-zinc-400">
          {shortAddress}
        </span>

        {/* Disconnect button */}
        <button
          onClick={disconnect}
          className="rounded-full border border-black/10 dark:border-white/20 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // ---- Disconnected ----------------------------------------------------------
  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="rounded-full border border-black/10 dark:border-white/20 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
