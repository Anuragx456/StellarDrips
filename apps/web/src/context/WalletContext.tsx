"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  StellarWalletsKit,
  Networks,
  KitEventType,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletState {
  /** Connected Stellar public address, or `null` when disconnected. */
  address: string | null;
  /** Whether a wallet is currently connected. */
  isConnected: boolean;
  /** The network passphrase returned by the wallet (e.g. Testnet). */
  networkPassphrase: string | null;
  /** Derived bool — is the wallet on the Stellar Testnet? */
  isTestnet: boolean;
  /** Is the Freighter extension available in the browser? */
  isAvailable: boolean;
  /** True while connecting (modal open). */
  isConnecting: boolean;
}

export interface WalletActions {
  /** Open the Stellar Wallets Kit auth modal to connect. */
  connect: () => Promise<void>;
  /** Disconnect the wallet. */
  disconnect: () => Promise<void>;
}

type WalletContextValue = WalletState & WalletActions;

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_STATE: WalletState = {
  address: null,
  isConnected: false,
  networkPassphrase: null,
  isTestnet: false,
  isAvailable: false,
  isConnecting: false,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);
  const initialized = useRef(false);

  // ---- Init kit once -------------------------------------------------------
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const kit = StellarWalletsKit;

    kit.init({
      modules: [new FreighterModule()],
      network: Networks.TESTNET,
    });

    // Check availability
    kit.refreshSupportedWallets().then((wallets) => {
      const freighter = wallets.find((w) => w.id === "freighter");
      setState((prev) => ({
        ...prev,
        isAvailable: freighter?.isAvailable ?? false,
      }));
    });

    // Listen for state updates from the kit (address / network changes)
    const unsubState = kit.on(KitEventType.STATE_UPDATED, (event) => {
      const addr = event.payload.address ?? null;
      const passphrase = event.payload.networkPassphrase;
      setState((prev) => ({
        ...prev,
        address: addr,
        isConnected: addr !== null,
        networkPassphrase: passphrase,
        isTestnet: passphrase === Networks.TESTNET,
        isConnecting: false,
      }));
    });

    // Listen for disconnect events
    const unsubDisconnect = kit.on(KitEventType.DISCONNECT, () => {
      setState((prev) => ({
        ...prev,
        address: null,
        isConnected: false,
        networkPassphrase: null,
        isTestnet: false,
        isConnecting: false,
      }));
    });

    // Try to restore an existing session
    kit
      .getAddress()
      .then(({ address }) => {
        if (address) {
          setState((prev) => ({
            ...prev,
            address,
            isConnected: true,
            isConnecting: false,
          }));
          // Also fetch network info
          kit.getNetwork().then(({ networkPassphrase }) => {
            setState((prev) => ({
              ...prev,
              networkPassphrase,
              isTestnet: networkPassphrase === Networks.TESTNET,
            }));
          });
        }
      })
      .catch(() => {
        // No existing session — fine
      });

    return () => {
      unsubState();
      unsubDisconnect();
    };
  }, []);

  // ---- Actions -------------------------------------------------------------
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true }));
    try {
      await StellarWalletsKit.authModal();
      // The STATE_UPDATED event will fire on success and update state
    } catch {
      // User closed the modal or an error occurred
      setState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    // The DISCONNECT event will fire and reset state
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (ctx === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
