"use client";

import { useReducer, useCallback } from "react";
import {
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeTopUpArgs,
  getNetworkPassphrase,
} from "@/lib/contract";
import type { TopUpInput } from "@/lib/types";

export type TopUpStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

interface TopUpState { status: TopUpStatus; }
type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function topUpReducer(_prev: TopUpState, action: Action): TopUpState {
  switch (action.type) {
    case "building": return { status: { type: "building" } };
    case "signing": return { status: { type: "signing" } };
    case "submitting": return { status: { type: "submitting" } };
    case "success": return { status: { type: "success", txHash: action.txHash } };
    case "error": return { status: { type: "error", error: action.error } };
    case "reset": return { status: { type: "idle" } };
  }
}

export interface UseTopUpReturn {
  status: TopUpStatus;
  execute: (input: TopUpInput) => Promise<void>;
  reset: () => void;
}

export function useTopUp(): UseTopUpReturn {
  const { address } = useWallet();
  const [state, dispatch] = useReducer(topUpReducer, { status: { type: "idle" } });

  const execute = useCallback(
    async (input: TopUpInput) => {
      if (!address) {
        dispatch({ type: "error", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "building" });

      try {
        const server = getServer();
        const contract = getContract();
        const passphrase = getNetworkPassphrase();
        const account = await server.getAccount(address);

        dispatch({ type: "signing" });

        const args = encodeTopUpArgs(input.subscriber, input.id, input.amount);
        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call("top_up", ...args))
          .setTimeout(30)
          .build();

        const prepared = await server.prepareTransaction(tx);
        const signedXdr = prepared.toXDR();
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(signedXdr, {
          networkPassphrase: passphrase,
          address,
        });

        dispatch({ type: "submitting" });

        const signedTx = TransactionBuilder.fromXDR(signedTxXdr, passphrase);
        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.errorResult) {
          dispatch({ type: "error", error: `Transaction rejected: ${sendResult.errorResult}` });
          return;
        }

        const hash = sendResult.hash;
        let attempts = 0;
        while (attempts < 30) {
          attempts++;
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            dispatch({ type: "success", txHash: hash });
            return;
          }
          if (result.status === "FAILED") {
            dispatch({ type: "error", error: "Transaction failed on the network" });
            return;
          }
          await new Promise((r) => setTimeout(r, 1_000));
        }
        dispatch({ type: "error", error: "Transaction timed out" });
      } catch (err) {
        dispatch({ type: "error", error: err instanceof Error ? err.message : "Top up failed" });
      }
    },
    [address],
  );

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return { status: state.status, execute, reset };
}
