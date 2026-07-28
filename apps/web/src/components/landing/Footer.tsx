"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Product",
    links: ["How it works", "Pricing", "Changelog", "Roadmap"],
  },
  {
    title: "Developers",
    links: ["Documentation", "API Reference", "GitHub", "Contract"],
  },
  {
    title: "Resources",
    links: ["Blog", "Community", "Support", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Audit"],
  },
];

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyContract = () => {
    navigator.clipboard.writeText("CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-2)]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Stellar Drips" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Stream XLM on autopilot
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--faint)]">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-[var(--border)] pt-8 md:flex-row md:justify-between">
          {/* Contract address (mono) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--faint)]">Contract</span>
            <code className="max-w-[220px] truncate text-xs font-mono text-[var(--muted)]">
              CCEWB5F…ONPAC
            </code>
            <button
              onClick={copyContract}
              className="flex items-center gap-1 text-[10px] text-[var(--faint)] transition-colors hover:text-[var(--accent)]"
              aria-label="Copy contract address"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[var(--faint)]">
            <span>Built on Stellar Testnet</span>
            <span>·</span>
            <span>
              © {new Date().getFullYear()} Stellar Drips
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
