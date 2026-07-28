"use client";

import { Marquee } from "@/components/primitives/Marquee";

const PLACEHOLDER_LOGOS = [
  "Protocol Layer",
  "Network Core",
  "Contract Runtime",
  "Relayer",
  "Indexer",
  "SDK",
  "Bridge",
  "Wallet Kit",
];

export function LogoCloud() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-[0.12em] text-[var(--faint)]">
          Built with the Stellar ecosystem
        </p>
      </div>

      <Marquee speed={35}>
        {PLACEHOLDER_LOGOS.map((name) => (
          <span
            key={name}
            className="select-none text-lg font-semibold tracking-tight text-[var(--surface-3)] transition-colors duration-300 hover:text-[var(--faint)]"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
