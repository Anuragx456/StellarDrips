"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/primitives/GlowButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type TechTile = {
  name: string;
  logo: ReactNode;
};

const TECH_LOGO_CLASS = "h-8 w-8";

const TILES: TechTile[] = [
  {
    name: "Soroban",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#101826" />
        <path
          d="M9 22.5C12.5 25 20.2 25 23 20.9C25.9 16.6 21.6 13.9 16.6 12.6C13.8 11.9 11.2 11.2 12 9.3C12.7 7.7 16.9 7.3 21.5 10"
          stroke="#5C9DFF"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M8 9L10.4 6.6L12.8 9L10.4 11.4L8 9Z" fill="#FFFFFF" />
        <path d="M20 23L22.4 20.6L24.8 23L22.4 25.4L20 23Z" fill="#2E7DFF" />
      </svg>
    ),
  },
  {
    name: "Rust",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 2.5L18 5.2L21.2 4.2L22.1 7.4L25.4 8L24.6 11.3L27.5 13L25.3 15.5L27.5 18L24.6 19.7L25.4 23L22.1 23.6L21.2 26.8L18 25.8L16 28.5L14 25.8L10.8 26.8L9.9 23.6L6.6 23L7.4 19.7L4.5 18L6.7 15.5L4.5 13L7.4 11.3L6.6 8L9.9 7.4L10.8 4.2L14 5.2L16 2.5Z"
          fill="#CE422B"
        />
        <circle cx="16" cy="15.5" r="8.5" fill="#0D0F13" />
        <path
          d="M11.2 20.5V10.8H17C19.3 10.8 20.7 12.1 20.7 14C20.7 15.3 20 16.3 18.9 16.8L21.2 20.5H18.4L16.4 17.2H13.9V20.5H11.2ZM13.9 15.1H16.6C17.5 15.1 18 14.7 18 14C18 13.3 17.5 12.9 16.6 12.9H13.9V15.1Z"
          fill="#F4F6FA"
        />
      </svg>
    ),
  },
  {
    name: "Next.js",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#FFFFFF" />
        <path d="M10 22V10H13.2L22 22H18.8L12.7 13.8V22H10Z" fill="#050608" />
        <path d="M22 10V20.4" stroke="#050608" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="4" fill="#3178C6" />
        <path d="M6.8 13.2H18V15.5H13.8V26H11V15.5H6.8V13.2Z" fill="#FFFFFF" />
        <path
          d="M19.1 25.3V22.6C20 23.3 21.1 23.6 22.2 23.6C23.5 23.6 24.1 23.2 24.1 22.4C24.1 21.7 23.6 21.3 22 20.6C19.9 19.7 18.9 18.6 18.9 16.8C18.9 14.5 20.7 13 23.5 13C24.8 13 25.8 13.2 26.5 13.6V16.1C25.7 15.6 24.7 15.3 23.7 15.3C22.5 15.3 21.8 15.8 21.8 16.5C21.8 17.2 22.3 17.6 23.8 18.2C26.1 19.2 27 20.2 27 22.1C27 24.5 25.2 26 22.3 26C21 26 19.8 25.7 19.1 25.3Z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: "Tailwind",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#0B2530" />
        <path
          d="M16 10C13.3 10 11.6 11.3 11 14C12 12.7 13.2 12.2 14.5 12.5C15.3 12.7 15.8 13.2 16.4 13.9C17.4 14.9 18.5 16 21 16C23.7 16 25.4 14.7 26 12C25 13.3 23.8 13.8 22.5 13.5C21.7 13.3 21.2 12.8 20.6 12.1C19.6 11.1 18.5 10 16 10ZM11 16C8.3 16 6.6 17.3 6 20C7 18.7 8.2 18.2 9.5 18.5C10.3 18.7 10.8 19.2 11.4 19.9C12.4 20.9 13.5 22 16 22C18.7 22 20.4 20.7 21 18C20 19.3 18.8 19.8 17.5 19.5C16.7 19.3 16.2 18.8 15.6 18.1C14.6 17.1 13.5 16 11 16Z"
          fill="#38BDF8"
        />
      </svg>
    ),
  },
  {
    name: "Freighter",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#121419" />
        <path
          d="M16 5.5C20.4 8.4 23 12.1 23 16.6C23 22.2 19.2 25.8 16 27C12.8 25.8 9 22.2 9 16.6C9 12.1 11.6 8.4 16 5.5Z"
          fill="#FFFFFF"
        />
        <path d="M16 10.2L17.8 14.4L22 16.1L17.8 17.8L16 22L14.2 17.8L10 16.1L14.2 14.4L16 10.2Z" fill="#7C3AED" />
      </svg>
    ),
  },
  {
    name: "Stellar SDK",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" stroke="#FFFFFF" strokeWidth="2.3" />
        <path d="M5.8 20.2L24.8 9.2" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M7.2 24.4L26.2 13.4" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M21 6.9C23.4 8 25.3 10 26.3 12.5" stroke="#2E7DFF" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "GitHub Actions",
    logo: (
      <svg className={TECH_LOGO_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="12.2" cy="11.3" r="4" fill="#FFFFFF" />
        <path
          d="M6.8 24.8C7.4 20.9 9.3 18.7 12.2 18.7C15.1 18.7 17 20.9 17.6 24.8"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path d="M19.5 9.5L26.5 16L19.5 22.5V9.5Z" fill="#2088FF" />
      </svg>
    ),
  },
];

export function TechStack() {
  const { ref, isInView } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24">
      {/* Faint line-art corner decoration */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-[0.04]" aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M160 0v160H0" stroke="var(--accent)" strokeWidth="0.5" />
          <circle cx="140" cy="20" r="2" fill="var(--accent)" />
          <circle cx="20" cy="140" r="2" fill="var(--accent)" />
        </svg>
      </div>

      <div
        ref={ref}
        className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-10"
      >
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[var(--text)]">
            Built on a production <span className="text-[var(--accent-bright)]">Stellar</span> stack
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            From smart contract to frontend — every layer is built with battle-tested
            Stellar ecosystem tools and modern web infrastructure.
          </p>
          <div className="mt-6">
            <GlowButton variant="ghost">Read the architecture →</GlowButton>
          </div>
        </motion.div>

        {/* Right tile grid */}
        <motion.div
          className="grid grid-cols-4 gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {TILES.map((name) => (
            <div
              key={name.name}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-[var(--r-tile)] border border-[var(--border)] bg-[var(--surface)] p-3 text-center transition-colors duration-200 hover:border-[var(--accent-soft)] hover:bg-[var(--surface-2)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--surface-2)] shadow-[0_1px_0_var(--edge-highlight)_inset] transition-transform duration-200 group-hover:scale-105">
                {name.logo}
              </span>
              <span className="text-[10px] font-medium leading-tight text-[var(--muted)] transition-colors duration-200 group-hover:text-[var(--text)]">
                {name.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
