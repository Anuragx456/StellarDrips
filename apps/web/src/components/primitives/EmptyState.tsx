import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Designed empty state with icon, title, description, and optional action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-8 py-12 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--faint)]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
