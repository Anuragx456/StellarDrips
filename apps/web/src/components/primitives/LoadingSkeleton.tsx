interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "line";
  width?: string;
  height?: string;
}

/**
 * Animated loading skeleton in dark theme.
 * - `text`: single line
 * - `card`: card-shaped block
 * - `circle`: circular (avatar, icon)
 * - `line`: thin horizontal line
 */
export function LoadingSkeleton({
  className = "",
  variant = "text",
  width,
  height,
}: LoadingSkeletonProps) {
  const base = "animate-pulse rounded-[var(--r-tile)] bg-[var(--surface-2)]";

  const variants = {
    text: "h-4",
    card: "h-32 w-full",
    circle: "h-10 w-10 rounded-full",
    line: "h-px w-full",
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * A set of skeleton lines for card/list loading states.
 */
export function SkeletonBlock({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          variant="text"
          className={i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"}
        />
      ))}
    </div>
  );
}
