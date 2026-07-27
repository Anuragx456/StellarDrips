"use client";

import { useReducer, useEffect, useCallback } from "react";
import { Horizon, AssetType } from "@stellar/stellar-sdk";
import { useWallet } from "@/context/WalletContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BalanceState {
  /** XLM balance as a string (e.g. "123.4567891"), or null when disconnected
   *  / not-yet-loaded. */
  balance: string | null;
  /** True while fetching from Horizon. */
  isLoading: boolean;
  /** Error message, or null. */
  error: string | null;
  /** Call to manually refresh the balance. */
  refresh: () => void;
}

type Action =
  | { type: "loading" }
  | { type: "success"; balance: string }
  | { type: "error"; error: string }
  | { type: "reset" };

interface State {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
}

function reducer(_prev: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { balance: null, isLoading: true, error: null };
    case "success":
      return { balance: action.balance, isLoading: false, error: null };
    case "error":
      return { balance: null, isLoading: false, error: action.error };
    case "reset":
      return { balance: null, isLoading: false, error: null };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_HORIZON = "https://horizon-testnet.stellar.org";

function getHorizonUrl(): string {
  if (
    typeof process !== "undefined" &&
    typeof process.env !== "undefined" &&
    process.env.NEXT_PUBLIC_HORIZON_URL
  ) {
    return process.env.NEXT_PUBLIC_HORIZON_URL;
  }
  return DEFAULT_HORIZON;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBalance(): BalanceState {
  const { address, isConnected } = useWallet();
  const [state, dispatch] = useReducer(reducer, {
    balance: null,
    isLoading: false,
    error: null,
  });
  const [refetchTrigger, setRefetchTrigger] = useReducer((n: number) => n + 1, 0);

  const refresh = useCallback(() => {
    setRefetchTrigger();
  }, []);

  // ---- Fetch balance --------------------------------------------------------
  useEffect(() => {
    if (!isConnected || !address) {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "loading" });

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const serverUrl = getHorizonUrl();
        const server = new Horizon.Server(serverUrl);
        const account = await server.loadAccount(address);

        if (cancelled) return;

        const native = account.balances.find(
          (b) => b.asset_type === AssetType.native,
        );

        dispatch({
          type: "success",
          balance: native ? (native as { balance: string }).balance : "0",
        });
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Failed to fetch balance";
        dispatch({ type: "error", error: msg });
      }
    };

    fetchBalance();

    return () => {
      cancelled = true;
    };
  }, [isConnected, address, refetchTrigger]);

  return { ...state, refresh };
}
