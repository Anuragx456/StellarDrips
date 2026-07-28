"use client";

import { motion } from "framer-motion";
import { GlowButton } from "@/components/primitives/GlowButton";
import { LightBeam } from "@/components/primitives/LightBeam";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FinalCTA() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-28">
      {/* Vertical up-glow */}
      <LightBeam variant="vertical-up" />

      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-[680px] px-6 text-center"
      >
        <motion.h2
          className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--text)]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Start Your First <span className="text-[var(--accent-bright)]">Drip</span> Today
        </motion.h2>

        <motion.p
          className="mt-4 text-sm leading-relaxed text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          Connect your wallet and set up your first recurring payment in minutes.
          No intermediaries. No hidden fees.
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <GlowButton variant="primary">Launch App ⚡</GlowButton>
          <GlowButton variant="ghost">Join Community</GlowButton>
        </motion.div>
      </div>
    </section>
  );
}
