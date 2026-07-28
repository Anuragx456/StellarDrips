"use client";

import { useEvents } from "@/hooks/useEvents";
import { EVENT_LABELS, EXPLORER_BASE } from "@/lib/types";

const EVENT_ICONS: Record<string, string> = {
  sub_crt: "🟢",
  sub_cnc: "🔴",
  sub_exp: "⚪",
  sub_top: "🔵",
  pay_exe: "🪙",
  pay_fal: "⛔",
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Event Dashboard</h2>
        <button
          onClick={refresh}
          className="text-xs text-[var(--brand)] dark:text-[var(--brand)] hover:underline cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">⚠ {error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-[var(--danger-text)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--danger-hover)] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">No events yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Create a subscription to get started.
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-2">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
            >
              <span className="text-lg">{EVENT_ICONS[evt.type] ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                  {EVENT_LABELS[evt.type as keyof typeof EVENT_LABELS] ?? evt.type}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {evt.subscriber.slice(0, 8)}… #{evt.id} — {timeAgo(evt.timestamp)}
                </p>
              </div>
              {evt.txHash && (
                <a
                  href={`${EXPLORER_BASE}/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--brand)] dark:text-[var(--brand)] underline-offset-2 hover:underline shrink-0"
                >
                  Tx
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
