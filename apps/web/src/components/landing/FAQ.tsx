"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { DarkCard } from "@/components/primitives/DarkCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TABS = ["General", "Wallets", "Security", "Scheduling", "Fees"];

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  General: [
    {
      q: "What is Stellar Drips?",
      a: "Stellar Drips is the first native recurring-payment primitive on the Stellar network. It lets anyone with a Stellar wallet create automated subscription payments using Soroban smart contracts.",
    },
    {
      q: "Do I need a developer to use it?",
      a: "No. The web interface lets you create, manage, and cancel drips without writing any code. Developers can also interact directly with the Soroban contract.",
    },
    {
      q: "Is this on mainnet?",
      a: "Currently deployed on Stellar Testnet only. Mainnet launch is under evaluation.",
    },
  ],
  Wallets: [
    {
      q: "Which wallets are supported?",
      a: "Freighter, xBull, Albedo, Rabet, Lobstr, Hana, Klever, and any WalletConnect-compatible wallet.",
    },
    {
      q: "Do you hold my private keys?",
      a: "Never. All transactions require signing in your own wallet. The app only reads public data from the blockchain.",
    },
  ],
  Security: [
    {
      q: "How is the escrow protected?",
      a: "Funds are locked in a Soroban contract with subscriber-only cancellation and prorated refunds. The off-chain scheduler cannot access funds — it only triggers execution.",
    },
    {
      q: "What prevents double payments?",
      a: "Each subscription tracks `payment_count` and `next_payment_time`. The contract verifies these before every execution, making double-payment structurally impossible.",
    },
  ],
  Scheduling: [
    {
      q: "How does the scheduler work?",
      a: "A Node.js runner (local or GitHub Actions cron) calls the contract's `execute_payment` for any due drips. It uses dry-run mode to safely preview before execution.",
    },
    {
      q: "What if the scheduler goes down?",
      a: "Funds remain in escrow — they are never at risk. When the scheduler comes back online, it catches up on any missed payments.",
    },
  ],
  Fees: [
    {
      q: "What are the fees?",
      a: "The Soroban contract charges only network transaction fees (~0.00001 XLM per operation). The Free plan includes the hosted scheduler at no cost.",
    },
  ],
};

export function FAQ() {
  const [activeTab, setActiveTab] = useState("General");
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  const items = FAQ_DATA[activeTab] ?? [];

  return (
    <section className="relative py-28">
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
            <Pill>FAQ</Pill>
          </motion.div>

          <motion.h2
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Questions, <span className="text-[var(--accent-bright)]">Answered</span>
          </motion.h2>
        </div>

        {/* Tabs */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-1 rounded-[var(--r-pill)] border border-[var(--border)] bg-[var(--surface-2)] p-1"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpenIndex(0); }}
              className={`relative rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Accordion + side panel grid */}
        <motion.div
          className="mt-8 grid gap-8 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {/* Left: accordion */}
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-[var(--r-input)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                  aria-expanded={openIndex === i}
                >
                  {item.q}
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--muted)] transition-transform duration-[var(--ease-out-expo)] ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-[var(--muted)]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right: active answer panel */}
          <div className="hidden md:block">
            <DarkCard className="sticky top-24 p-6 md:p-8" hover={false}>
              {openIndex >= 0 && openIndex < items.length && (
                <motion.div
                  key={`${activeTab}-${openIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    {items[openIndex].q}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {items[openIndex].a}
                  </p>
                </motion.div>
              )}
            </DarkCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
