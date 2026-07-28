"use client";

interface PillProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Accent-soft background, accent text, rounded-full.
 * Used for badges, tags, category labels.
 */
export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-[0.75rem] font-medium tracking-wide text-[var(--accent)] ${className}`}
    >
      {children}
    </span>
  );
}
