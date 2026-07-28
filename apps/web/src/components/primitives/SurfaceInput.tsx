"use client";

import { forwardRef } from "react";

interface SurfaceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
}

/**
 * Dark-themed input with accent focus ring.
 * - `mono`: renders in JetBrains Mono (for addresses, amounts)
 * - `error`: shows error text beneath
 * - `hint`: shows muted hint beneath
 */
export const SurfaceInput = forwardRef<HTMLInputElement, SurfaceInputProps>(
  ({ label, hint, error, mono, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--faint)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-[var(--r-input)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--faint)] transition-colors focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed ${
            mono ? "font-mono tracking-tight" : ""
          } ${error ? "border-[var(--danger)]" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--danger)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--faint)]">{hint}</p>
        )}
      </div>
    );
  }
);

SurfaceInput.displayName = "SurfaceInput";
