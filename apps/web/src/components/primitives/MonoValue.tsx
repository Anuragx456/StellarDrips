"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MonoValueProps {
  value: string;
  truncate?: boolean;
  copyable?: boolean;
  className?: string;
  label?: string;
}

/**
 * Renders on-chain values in JetBrains Mono.
 * - truncate: truncates long values with ellipsis
 * - copyable: adds a copy-to-clipboard button
 * - label: optional uppercase label above the value
 */
export function MonoValue({
  value,
  truncate = false,
  copyable = false,
  className = "",
  label,
}: MonoValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--faint)]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <code
          className={`text-sm font-mono tracking-tight text-[var(--muted)] ${
            truncate ? "max-w-[180px] truncate overflow-hidden" : "break-all"
          }`}
        >
          {value}
        </code>
        {copyable && (
          <button
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[var(--faint)] transition-colors hover:text-[var(--accent)]"
            aria-label={copied ? "Copied" : "Copy to clipboard"}
          >
            {copied ? (
              <Check className="h-3 w-3 text-[var(--success)]" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied && <span className="text-[var(--success)]">Copied</span>}
          </button>
        )}
      </div>
    </div>
  );
}
