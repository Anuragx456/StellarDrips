"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TransactionBuilder,
  scValToNative,
} from "@stellar/stellar-sdk";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeGetSubArgs,
  encodeSubCountArgs,
} from "@/lib/contract";
import { parseSubscription } from "@/lib/scval";
import type { Subscription, AsyncState } from "@/lib/types";

export interface UseSubscriptionReturn extends AsyncState<Subscription[]> {
  refresh: () => void;
}

export function useSubscription(id?: number): UseSubscriptionReturn {
  const { address, isConnected } = useWallet();
  const [data, setData] = useState<Subscription[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (!isConnected || !address) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchSubs = async () => {
      setLoading(true);
      setError(null);

      try {
        const server = getServer();
        const contract = getContract();
        const account = await server.getAccount(address);

        const countTx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: "Test SDF Network ; September 2015",
        })
          .addOperation(contract.call("subscription_count", ...encodeSubCountArgs(address)))
          .setTimeout(30)
          .build();

        const countSim = await server.simulateTransaction(countTx);
        const countResult = (countSim as any)?.result?.retval
          ? (countSim as any).result
          : (countSim as any)?.results?.[0];

        const rawCount = countResult?.retval ?? null;
        const totalCount = rawCount ? Number(scValToNative(rawCount)) : 0;

        if (cancelled) return;

        if (totalCount === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const subs: Subscription[] = [];
        const ids = id !== undefined ? [id] : Array.from({ length: totalCount }, (_, i) => i);

        for (const subId of ids) {
          const subTx = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: "Test SDF Network ; September 2015",
          })
            .addOperation(contract.call("get_subscription", ...encodeGetSubArgs(address, subId)))
            .setTimeout(30)
            .build();

          const subSim = await server.simulateTransaction(subTx);
          const subResult = (subSim as any)?.result?.retval
            ? (subSim as any).result
            : (subSim as any)?.results?.[0];

          if (subResult?.retval && !cancelled) {
            const raw = scValToNative(subResult.retval);
            const parsed = parseSubscription(raw);
            subs.push({
              subscriber: parsed.subscriber,
              recipient: parsed.recipient,
              token: parsed.token,
              amount: parsed.amount,
              intervalSeconds: parsed.intervalSeconds,
              nextPaymentTime: parsed.nextPaymentTime,
              escrowBalance: parsed.escrowBalance,
              paymentCount: parsed.paymentCount,
              status: parsed.status,
              createdAt: parsed.createdAt,
              expirationTime: parsed.expirationTime,
            });
          }
        }

        if (!cancelled) {
          setData(subs);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch subscriptions");
          setLoading(false);
        }
      }
    };

    fetchSubs();

    return () => { cancelled = true; };
  }, [address, isConnected, id, trigger]);

  return { data, loading, error, refresh };
}
