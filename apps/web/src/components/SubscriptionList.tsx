"use client";

import { useWallet } from "@/context/WalletContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionCard } from "./SubscriptionCard";
import type { Subscription } from "@/lib/types";

interface SubscriptionListProps {
  onTopUp: (sub: Subscription) => void;
  onCancel: (sub: Subscription) => void;
}

export function SubscriptionList({ onTopUp, onCancel }: SubscriptionListProps) {
  const { isConnected } = useWallet();
  const { data: subs, loading, error, refresh } = useSubscription();

  if (!isConnected) return null;

  if (loading) {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20 mb-4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-32 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24 mb-4" />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Your Subscriptions</h2>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">⚠ {error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subs || subs.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Your Subscriptions</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">No subscriptions yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Create your first subscription using the form above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your Subscriptions</h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subs.map((sub, idx) => (
          <SubscriptionCard
            key={idx}
            sub={sub}
            onTopUp={() => onTopUp(sub)}
            onCancel={() => onCancel(sub)}
          />
        ))}
      </div>
    </div>
  );
}
