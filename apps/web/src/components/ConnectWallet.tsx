"use client";

import { useWallet } from "@/context/WalletContext";
import { GlowButton } from "@/components/primitives/GlowButton";
import { NetworkBadge } from "@/components/primitives/NetworkBadge";
import { MonoValue } from "@/components/primitives/MonoValue";
import { LogOut, Wallet } from "lucide-react";

export function ConnectWallet() {
  const {
    address,
    isConnected,
    isTestnet,
    isAvailable,
    isConnecting,
    connect,
    disconnect,
  } = useWallet();

  // ---- Not available (no wallet extension detected) --------------------------
  if (!isAvailable) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs text-[var(--muted)]">
        <Wallet className="h-3.5 w-3.5 text-[var(--warn)]" />
        No wallet detected —
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Install Freighter
        </a>
      </div>
    );
  }

  // ---- Connected -------------------------------------------------------------
  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-3">
        {isTestnet && <NetworkBadge />}
        <MonoValue value={shortAddress} />
        <button
          onClick={disconnect}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--danger)]/50 hover:text-[var(--danger)]"
          aria-label="Disconnect wallet"
        >
          <LogOut className="h-3 w-3" />
          Disconnect
        </button>
      </div>
    );
  }

  // ---- Disconnected ----------------------------------------------------------
  return (
    <GlowButton
      variant="white"
      onClick={connect}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </GlowButton>
  );
}
