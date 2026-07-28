"use client";

import { RefreshCw } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionCard } from "./SubscriptionCard";
import { LoadingSkeleton, SkeletonBlock } from "@/components/primitives/LoadingSkeleton";
import { EmptyState } from "@/components/primitives/EmptyState";
import { DarkCard } from "@/components/primitives/DarkCard";
import { GlowButton } from "@/components/primitives/GlowButton";
import type { Subscription } from "@/lib/types";

interface SubscriptionListProps {
  onTopUp: (sub: Subscription) => void;
  onCancel: (sub: Subscription) => void;
}

export function SubscriptionList({ onTopUp, onCancel }: SubscriptionListProps) {
  const { isConnected } = useWallet();
  const { data: subs, loading, error, refresh } = useSubscription();

  if (!isConnected) return null;

  // Loading
  if (loading) {
    return (
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
            Your <span className="text-[var(--accent-bright)]">Subscriptions</span>
          </h2>
          <LoadingSkeleton variant="line" className="w-20" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <DarkCard key={i} hover={false} className="p-5">
              <SkeletonBlock lines={4} />
            </DarkCard>
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
          Your <span className="text-[var(--accent-bright)]">Subscriptions</span>
        </h2>
        <DarkCard hover={false} className="p-6 text-center">
          <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
          <GlowButton variant="ghost" onClick={refresh}>
            Try Again
          </GlowButton>
        </DarkCard>
      </div>
    );
  }

  // Empty
  if (!subs || subs.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
          Your <span className="text-[var(--accent-bright)]">Subscriptions</span>
        </h2>
        <EmptyState
          title="No subscriptions yet"
          description="Create your first subscription using the form above."
        />
      </div>
    );
  }

  // List
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
          Your <span className="text-[var(--accent-bright)]">Subscriptions</span>
        </h2>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1 text-xs text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subs.map((sub, idx) => (
          <SubscriptionCard
            key={sub.id ?? idx}
            sub={sub}
            onTopUp={() => onTopUp(sub)}
            onCancel={() => onCancel(sub)}
          />
        ))}
      </div>
    </div>
  );
}
