"use client";

import { motion } from "framer-motion";
import { Calendar, Shield, Activity } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { DarkCard } from "@/components/primitives/DarkCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CARDS = [
  {
    icon: Calendar,
    title: "Recurring Intent, On Chain",
    body: "Define amount, interval, and expiration. The contract handles the rest — no more manual transfers every cycle.",
    mockup: (
      <div className="mt-4 rounded-[var(--r-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[var(--faint)]">Monthly · 10 XLM</span>
          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[8px] text-[var(--accent)]">Active</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[8px] text-[var(--muted)]">
          <span className="h-1 w-1 rounded-full bg-[var(--success)]" />
          Next: in 14 days
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "On-Chain Escrow, You Stay in Control",
    body: "Funds are locked in a Soroban contract — not in our hands. Cancel anytime and receive a prorated refund.",
    mockup: (
      <div className="mt-4 rounded-[var(--r-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono text-[var(--text)]">5,000 XLM</span>
          <span className="text-[var(--faint)]">Escrowed</span>
        </div>
        <div className="mt-1 flex gap-2 text-[8px]">
          <span className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--muted)]">Cancel</span>
          <span className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--muted)]">Refund</span>
        </div>
      </div>
    ),
  },
  {
    icon: Activity,
    title: "Real-Time Events & History",
    body: "Every action emits an on-chain event. Track creations, payments, cancellations, and top-ups in a live feed.",
    mockup: (
      <div className="mt-4 space-y-1.5 rounded-[var(--r-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
        {["Drip created", "Payment sent", "Escrow topped up"].map((ev, i) => (
          <div key={ev} className="flex items-center gap-1.5 text-[9px]">
            <span className={`h-1 w-1 rounded-full ${i === 1 ? "bg-[var(--success)]" : "bg-[var(--accent)]"}`} />
            <span className="text-[var(--muted)]">{ev}</span>
            <span className="ml-auto font-mono text-[var(--faint)]">0x…{i}ab</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function WhyDrips() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" className="relative py-28">
      <div
        ref={ref}
        className="mx-auto max-w-[1280px] px-6 md:px-10"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Pill>Why Stellar Drips</Pill>
          </motion.div>

          <motion.h2
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Set It Once. <span className="text-[var(--accent-bright)]">Drip Forever.</span>
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 * i }}
            >
              <DarkCard className="flex h-full flex-col p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--r-tile)] bg-[var(--accent-soft)]">
                  <card.icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="mt-4 text-[1.25rem] font-semibold text-[var(--text)]">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {card.body}
                </p>
                {card.mockup}
              </DarkCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
