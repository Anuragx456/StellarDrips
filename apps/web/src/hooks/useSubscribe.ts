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
  getTokenId,
  encodeSubscribeArgs,
  getNetworkPassphrase,
} from "@/lib/contract";
import type { SubscribeInput } from "@/lib/types";

export type SubscribeStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

interface SubscribeState {
  status: SubscribeStatus;
}

type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function subscribeReducer(_prev: SubscribeState, action: Action): SubscribeState {
  switch (action.type) {
    case "building": return { status: { type: "building" } };
    case "signing": return { status: { type: "signing" } };
    case "submitting": return { status: { type: "submitting" } };
    case "success": return { status: { type: "success", txHash: action.txHash } };
    case "error": return { status: { type: "error", error: action.error } };
    case "reset": return { status: { type: "idle" } };
  }
}

export interface UseSubscribeReturn {
  status: SubscribeStatus;
  execute: (input: SubscribeInput) => Promise<void>;
  reset: () => void;
}

export function useSubscribe(): UseSubscribeReturn {
  const { address } = useWallet();
  const [state, dispatch] = useReducer(subscribeReducer, { status: { type: "idle" } });

  const execute = useCallback(
    async (input: SubscribeInput) => {
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

        const args = encodeSubscribeArgs(
          address,
          input.recipient,
          input.token ?? getTokenId(),
          input.amount,
          input.intervalSeconds,
          input.initialEscrow,
          input.expirationTime,
        );

        const tx = new TransactionBuilder(account, {
          fee: "1000",
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call("subscribe", ...args))
          .setTimeout(30)
          .build();

        const prepared = await server.prepareTransaction(tx);
        const signedXdr = prepared.toXDR();

        const { signedTxXdr } = await StellarWalletsKit.signTransaction(
          signedXdr,
          { networkPassphrase: passphrase, address },
        );

        dispatch({ type: "submitting" });

        const signedTx = TransactionBuilder.fromXDR(signedTxXdr, passphrase);
        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.errorResult) {
          dispatch({ type: "error", error: `Transaction rejected: ${sendResult.errorResult}` });
          return;
        }

        if (sendResult.status === "ERROR") {
          dispatch({ type: "error", error: "Transaction submission failed" });
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
        const msg = err instanceof Error ? err.message : "Subscribe failed";
        dispatch({ type: "error", error: msg });
      }
    },
    [address],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { status: state.status, execute, reset };
}
