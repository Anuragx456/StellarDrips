"use client";

interface NetworkBadgeProps {
  network?: string;
  live?: boolean;
  className?: string;
}

/**
 * Live network indicator: pulsing dot + label.
 * Used for "Testnet" badge in nav and status panels.
 */
export function NetworkBadge({
  network = "Testnet",
  live = true,
  className = "",
}: NetworkBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--faint)] ${className}`}
    >
      {live && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
        </span>
      )}
      {network}
    </span>
  );
}
