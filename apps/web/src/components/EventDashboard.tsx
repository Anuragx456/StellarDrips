"use client";

import { RefreshCw, ExternalLink } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EVENT_LABELS, EXPLORER_BASE } from "@/lib/types";
import { DarkCard } from "@/components/primitives/DarkCard";
import { MonoValue } from "@/components/primitives/MonoValue";
import { TxStatusPill } from "@/components/primitives/TxStatusPill";
import { LoadingSkeleton } from "@/components/primitives/LoadingSkeleton";
import { EmptyState } from "@/components/primitives/EmptyState";
import { GlowButton } from "@/components/primitives/GlowButton";

const EVENT_ICONS: Record<string, string> = {
  sub_crt: "🟢",
  sub_cnc: "🔴",
  sub_exp: "⚪",
  sub_top: "🔵",
  pay_exe: "🪙",
  pay_fal: "⛔",
};

const EVENT_STATUS: Record<string, "success" | "pending" | "failed"> = {
  sub_crt: "success",
  sub_cnc: "pending",
  sub_exp: "pending",
  sub_top: "success",
  pay_exe: "success",
  pay_fal: "failed",
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function EventDashboard() {
  const { events, loading, error, refresh } = useEvents();

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
          Event <span className="text-[var(--accent-bright)]">Dashboard</span>
        </h2>
        <div className="flex items-center gap-3">
          {/* Live pulse */}
          {!loading && !error && events.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--success)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
              </span>
              Live
            </span>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 text-xs text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <DarkCard key={i} hover={false} className="flex items-center gap-3 px-4 py-3">
              <LoadingSkeleton variant="circle" className="shrink-0" />
              <div className="flex-1 space-y-2">
                <LoadingSkeleton variant="text" className="w-3/4" />
                <LoadingSkeleton variant="text" className="w-1/2 h-3" />
              </div>
            </DarkCard>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <DarkCard hover={false} className="p-6 text-center">
          <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
          <GlowButton variant="ghost" onClick={refresh}>
            Try Again
          </GlowButton>
        </DarkCard>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <EmptyState
          title="No events yet"
          description="Create a subscription to see events here."
        />
      )}

      {/* Events list */}
      {!loading && !error && events.length > 0 && (
        <div className="flex flex-col gap-2">
          {events.map((evt, idx) => (
            <DarkCard key={idx} hover={false} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">{EVENT_ICONS[evt.type] ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[var(--text)] truncate">
                    {EVENT_LABELS[evt.type as keyof typeof EVENT_LABELS] ?? evt.type}
                  </p>
                  <TxStatusPill
                    status={EVENT_STATUS[evt.type] ?? "pending"}
                    className="shrink-0"
                  />
                </div>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--faint)]">
                  <MonoValue value={`${evt.subscriber.slice(0, 6)}… #${evt.id}`} />
                  <span>·</span>
                  <span>{timeAgo(evt.timestamp)}</span>
                </p>
              </div>
              {evt.txHash && (
                <a
                  href={`${EXPLORER_BASE}/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 text-[10px] text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
                >
                  <ExternalLink className="h-3 w-3" />
                  Tx
                </a>
              )}
            </DarkCard>
          ))}
        </div>
      )}
    </div>
  );
}
