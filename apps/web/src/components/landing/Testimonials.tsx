"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { DarkCard } from "@/components/primitives/DarkCard";
import { StatCounter } from "@/components/primitives/StatCounter";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const QUOTES = [
  {
    name: "Alex Chen",
    role: "Founder @ BuildOnStellar",
    avatar: "AC",
    text: "Stellar Drips solves a real pain point in the ecosystem. Setting up recurring payments on Stellar was surprisingly straightforward.",
  },
  {
    name: "Maya Patel",
    role: "DevRel @ Stellar Community",
    avatar: "MP",
    text: "The Soroban integration is clean — the escrow model gives me confidence that funds are safe. Exactly what the ecosystem needed.",
  },
  {
    name: "Jordan Kim",
    role: "Full-stack Developer",
    avatar: "JK",
    text: "I integrated the drip builder into my dApp in an afternoon. The event polling makes it easy to track every payment.",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  const prev = () => setActiveIndex((i) => (i === 0 ? QUOTES.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === QUOTES.length - 1 ? 0 : i + 1));

  return (
    <section className="relative py-28">
      <div
        ref={ref}
        className="mx-auto max-w-[1280px] px-6 md:px-10"
      >
        <div className="grid items-end gap-12 md:grid-cols-2">
          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]">
              Loved by the <span className="text-[var(--accent-bright)]">Stellar</span> community
            </h2>
          </motion.div>

          {/* Right: stat */}
          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <StatCounter value={98} suffix="%" label="On-time drips (demo)" />
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative mt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <DarkCard className="max-w-[600px] p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                    {QUOTES[activeIndex].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      {QUOTES[activeIndex].name}
                    </p>
                    <p className="text-xs text-[var(--faint)]">
                      {QUOTES[activeIndex].role}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                  &ldquo;{QUOTES[activeIndex].text}&rdquo;
                </p>
              </DarkCard>
            </motion.div>
          </AnimatePresence>

          {/* Carousel arrows */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent-soft)] hover:text-[var(--accent)]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent-soft)] hover:text-[var(--accent)]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-[var(--faint)]">
              {activeIndex + 1} / {QUOTES.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
