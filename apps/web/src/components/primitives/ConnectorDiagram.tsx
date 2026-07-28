"use client";

import { motion } from "framer-motion";

interface ConnectorDiagramProps {
  className?: string;
}

/**
 * Hero process flow diagram:
 *   left chips → central contract (scan line) → right checklist + streamed chip
 * Thin SVG connector lines with glowing nodes.
 */
export function ConnectorDiagram({ className = "" }: ConnectorDiagramProps) {
  return (
    <div className={`relative w-full max-w-[720px] ${className}`}>
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 720 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left → Center connector */}
        <motion.line
          x1="200" y1="80" x2="300" y2="80"
          stroke="rgba(46,125,255,0.3)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        />
        {/* Center → Right connector */}
        <motion.line
          x1="420" y1="80" x2="520" y2="80"
          stroke="rgba(46,125,255,0.3)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.6 }}
        />
        {/* Glowing nodes */}
        <motion.circle
          cx="200" cy="80" r="4"
          fill="var(--accent)"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="420" cy="80" r="4"
          fill="var(--accent)"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle
          cx="520" cy="80" r="4"
          fill="var(--accent-bright)"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Node glow halos */}
        <circle cx="200" cy="80" r="8" fill="rgba(46,125,255,0.15)" />
        <circle cx="420" cy="80" r="8" fill="rgba(46,125,255,0.15)" />
        <circle cx="520" cy="80" r="8" fill="rgba(46,125,255,0.2)" />
      </svg>

      {/* Flow content */}
      <div className="relative flex items-center justify-between">
        {/* Left chips */}
        <div className="flex flex-col gap-2">
          {["Wallet", "Schedule", "Amount"].map((label) => (
            <div
              key={label}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-medium text-[var(--text)]"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Center: contract window */}
        <div className="relative mx-4 flex h-[120px] w-[160px] flex-col items-center justify-center overflow-hidden rounded-[var(--r-card)] border border-[var(--border-strong)] bg-[var(--surface)]">
          {/* Animated scan line */}
          <motion.div
            className="scan-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ top: "0%" }}
          />
          <span className="text-[10px] font-medium text-[var(--accent-bright)]">
            SubscriptionProtocol.wasm
          </span>
          <span className="mt-1 text-[8px] text-[var(--faint)]">Soroban Contract</span>
        </div>

        {/* Right checklist */}
        <div className="flex flex-col gap-2">
          {["Funds locked", "Scheduled", "Executed", "Indexed"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs text-[var(--muted)]"
            >
              <span className="text-[var(--success)] text-[10px]">✓</span>
              {label}
            </div>
          ))}
          <div className="mt-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-medium text-[var(--accent)]">
            Payment streamed ✦
          </div>
        </div>
      </div>
    </div>
  );
}
