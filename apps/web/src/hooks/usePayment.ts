"use client";

import { useReducer, useCallback } from "react";
import {
  TransactionBuilder,
  Transaction,
  Horizon,
  Asset,
  Operation,
  Networks,
} from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/context/WalletContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

export interface PaymentState {
  status: PaymentStatus;
}

export interface PaymentActions {
  /** Send XLM to `destination` address. */
  sendXlm: (destination: string, amount: string) => Promise<void>;
  /** Reset to idle. */
  reset: () => void;
}

type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function reducer(_prev: PaymentState, action: Action): PaymentState {
  switch (action.type) {
    case "building":
      return { status: { type: "building" } };
    case "signing":
      return { status: { type: "signing" } };
    case "submitting":
      return { status: { type: "submitting" } };
    case "success":
      return { status: { type: "success", txHash: action.txHash } };
    case "error":
      return { status: { type: "error", error: action.error } };
    case "reset":
      return { status: { type: "idle" } };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_HORIZON = "https://horizon-testnet.stellar.org";
const DEFAULT_PASSPHRASE = Networks.TESTNET;

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

function getNetworkPassphrase(): string {
  if (
    typeof process !== "undefined" &&
    typeof process.env !== "undefined" &&
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE
  ) {
    return process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
  }
  return DEFAULT_PASSPHRASE;
}

/** Validate a Stellar public key (G…). */
function isValidPublicKey(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value);
}

// ---------------------------------------------------------------------------
// Transaction record (in-memory, resets on page reload)
// ---------------------------------------------------------------------------

export interface TransactionRecord {
  txHash: string;
  destination: string;
  amount: string;
  timestamp: number;
  success: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePayment(): PaymentState & PaymentActions & {
  recentTransactions: TransactionRecord[];
} {
  const { address, isConnected } = useWallet();
  const [state, dispatch] = useReducer(reducer, { status: { type: "idle" } });
  const [recent, dispatchTx] = useReducer(
    (prev: TransactionRecord[], action: TransactionRecord | "clear") =>
      action === "clear" ? [] : [action, ...prev].slice(0, 20),
    [] as TransactionRecord[],
  );

  const sendXlm = useCallback(
    async (destination: string, amount: string) => {
      if (!isConnected || !address) {
        dispatch({ type: "error", error: "Wallet not connected" });
        return;
      }

      if (!isValidPublicKey(destination)) {
        dispatch({
          type: "error",
          error: "Invalid recipient address (must start with G)",
        });
        return;
      }

      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        dispatch({ type: "error", error: "Amount must be a positive number" });
        return;
      }

      dispatch({ type: "building" });

      try {
        // --- Build transaction -----------------------------------------------
        const horizonUrl = getHorizonUrl();
        const passphrase = getNetworkPassphrase();
        const horizonServer = new Horizon.Server(horizonUrl);

        // Load account for sequence number
        const account = await horizonServer.loadAccount(address);

        dispatch({ type: "signing" });

        const tx = new TransactionBuilder(account, {
          fee: "1000",
          networkPassphrase: passphrase,
        })
          .addOperation(
            Operation.payment({
              destination,
              asset: Asset.native(),
              amount,
            }),
          )
          .setTimeout(30)
          .build();

        // --- Sign transaction ------------------------------------------------
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(
          tx.toXDR(),
          { networkPassphrase: passphrase, address },
        );

        dispatch({ type: "submitting" });

        // --- Submit transaction ----------------------------------------------
        const signedTx = new Transaction(signedTxXdr, passphrase);

        const result = await horizonServer.submitTransaction(signedTx);

        if (result.successful) {
          dispatch({ type: "success", txHash: result.hash });
          dispatchTx({
            txHash: result.hash,
            destination,
            amount,
            timestamp: Date.now(),
            success: true,
          });
        } else {
          dispatch({
            type: "error",
            error: "Transaction failed on the network",
          });
          dispatchTx({
            txHash: result.hash,
            destination,
            amount,
            timestamp: Date.now(),
            success: false,
          });
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Payment failed";
        dispatch({ type: "error", error: msg });
      }
    },
    [address, isConnected],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...state, sendXlm, reset, recentTransactions: recent };
}
