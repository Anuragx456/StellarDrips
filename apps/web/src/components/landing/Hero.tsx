"use client";

import { motion } from "framer-motion";
import { Pill } from "@/components/primitives/Pill";
import { GlowButton } from "@/components/primitives/GlowButton";
import { ConnectorDiagram } from "@/components/primitives/ConnectorDiagram";
import { LightBeam } from "@/components/primitives/LightBeam";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Hero() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Ambient light beams */}
      <LightBeam variant="diagonal-tr" />
      <LightBeam variant="horizontal" />

      <div
        ref={ref}
        className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center px-6 md:px-10"
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Pill>Recurring payments on Stellar ✦</Pill>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mt-6 max-w-[800px] text-center font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--text)]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          Stream XLM On Autopilot,{" "}
          <span className="text-[var(--accent-bright)]">Drip By Drip</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-4 max-w-[520px] text-center text-base leading-relaxed text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          Set up recurring payments for SaaS subscriptions, membership fees,
          donations, and payroll — all secured on the Stellar network.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-8 flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <GlowButton variant="primary">
            Launch App ⚡
          </GlowButton>
          <GlowButton variant="ghost">
            Read Docs
          </GlowButton>
        </motion.div>

        {/* Connector diagram */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          <ConnectorDiagram />
        </motion.div>
      </div>
    </section>
  );
}
