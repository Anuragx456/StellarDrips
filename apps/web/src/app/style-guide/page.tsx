"use client";

import { Pill } from "@/components/primitives/Pill";
import { GlowButton } from "@/components/primitives/GlowButton";
import { DarkCard } from "@/components/primitives/DarkCard";
import { NetworkBadge } from "@/components/primitives/NetworkBadge";
import { SurfaceInput } from "@/components/primitives/SurfaceInput";
import { TxStatusPill } from "@/components/primitives/TxStatusPill";
import { MonoValue } from "@/components/primitives/MonoValue";
import { StatCounter } from "@/components/primitives/StatCounter";
import { ConnectorDiagram } from "@/components/primitives/ConnectorDiagram";
import { LoadingSkeleton, SkeletonBlock } from "@/components/primitives/LoadingSkeleton";
import { EmptyState } from "@/components/primitives/EmptyState";

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-32">
      <div className="mx-auto max-w-[1000px] px-6 py-16 md:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-[var(--text)]">
          Style <span className="text-[var(--accent-bright)]">Guide</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Cinematic Azure design tokens and primitives for Stellar Drips.
        </p>

        {/* ── Colors ── */}
        <Section title="Colors">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {[
              { name: "bg", var: "--bg", color: "#050608" },
              { name: "bg-2", var: "--bg-2", color: "#070809" },
              { name: "surface", var: "--surface", color: "#0D0F13" },
              { name: "surface-2", var: "--surface-2", color: "#121419" },
              { name: "surface-3", var: "--surface-3", color: "#171A20" },
              { name: "text", var: "--text", color: "#F4F6FA" },
              { name: "muted", var: "--muted", color: "#9AA1AC" },
              { name: "faint", var: "--faint", color: "#6B7280" },
              { name: "accent", var: "--accent", color: "#2E7DFF" },
              { name: "accent-bright", var: "--accent-bright", color: "#5C9DFF" },
              { name: "accent-deep", var: "--accent-deep", color: "#0B46B8" },
              { name: "accent-soft", var: "--accent-soft", color: "rgba(46,125,255,0.14)" },
              { name: "success", var: "--success", color: "#34D399" },
              { name: "warn", var: "--warn", color: "#FBBF24" },
              { name: "danger", var: "--danger", color: "#FB7185" },
            ].map((c) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div
                  className="h-14 rounded-[var(--r-tile)] border border-[var(--border)]"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-xs font-medium text-[var(--text)]">{c.name}</span>
                <code className="text-[10px] text-[var(--faint)]">{c.var}</code>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography">
          <DarkCard hover={false} className="p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--faint)] mb-1">Display</p>
              <p className="font-[family-name:var(--font-display)] text-[clamp(2.6rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--text)]">
                Space Grotesk — Stream XLM
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--faint)] mb-1">Body</p>
              <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--text)]">
                Manrope — Create subscription-based payments powered by Soroban smart contracts.
              </p>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--muted)]">
                Muted body text for secondary content and descriptions.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--faint)] mb-1">Mono (on-chain data)</p>
              <p className="font-mono text-sm tracking-tight text-[var(--muted)]">
                GA7QYNFVQ7QU72C4O7SILH6YKDWQ6X7W7R6ZX
              </p>
              <p className="mt-1 font-mono text-xs tracking-tight text-[var(--faint)]">
                CCEWB5F…ONPAC · 1,234.567 XLM · 2026-07-28T14:30Z
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--faint)] mb-2">Labels</p>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--faint)]">SECTION LABEL 0.75rem</p>
              <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--faint)]">LABEL 0.6875rem</p>
            </div>
          </DarkCard>
        </Section>

        {/* ── Primitives ── */}
        <Section title="Primitives">
          <div className="flex flex-wrap items-center gap-4">
            <Pill>Badge chip ✦</Pill>
            <Pill className="!bg-[var(--success)]/10 !text-[var(--success)]">Success</Pill>
            <NetworkBadge />
            <TxStatusPill status="pending" />
            <TxStatusPill status="success" message="Confirmed" />
            <TxStatusPill status="failed" message="Failed" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <GlowButton variant="primary">Primary ⚡</GlowButton>
            <GlowButton variant="ghost">Ghost</GlowButton>
            <GlowButton variant="white">White</GlowButton>
            <GlowButton variant="primary" disabled>Disabled</GlowButton>
          </div>

          <div className="mt-8 grid max-w-sm gap-4">
            <SurfaceInput label="Text Input" placeholder="Placeholder text" />
            <SurfaceInput label="Mono Input" placeholder="G…" mono />
            <SurfaceInput label="With Error" placeholder="Error state" error="Invalid address" />
            <SurfaceInput label="Disabled" placeholder="Disabled state" disabled />
          </div>
        </Section>

        {/* ── Cards ── */}
        <Section title="Cards">
          <div className="grid gap-6 md:grid-cols-2">
            <DarkCard className="p-6">
              <p className="text-sm font-medium text-[var(--text)]">Default DarkCard</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Surface bg, hairline border, top-edge highlight, hover lift + glow.
              </p>
            </DarkCard>
            <DarkCard hover={false} className="p-6">
              <p className="text-sm font-medium text-[var(--text)]">DarkCard (no hover)</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Static variant without hover-lift or glow.
              </p>
            </DarkCard>
          </div>
        </Section>

        {/* ── Data Display ── */}
        <Section title="Data Display">
          <div className="flex flex-col gap-4">
            <MonoValue label="Wallet Address" value="GA7QYNFVQ7QU72C4O7SILH6YKDWQ6X7W7R6ZX……" copyable />
            <MonoValue label="Contract ID" value="CCEWB5F27ETPU7…ONPAC" copyable />
            <MonoValue label="Transaction Hash" value="a1b2c3d4e5f6…7890" />
            <MonoValue label="Balance" value="1,234.567 XLM" />
          </div>
          <div className="mt-8">
            <StatCounter value={98} suffix="%" label="On-time drips (demo)" />
          </div>
        </Section>

        {/* ── Loading / Empty States ── */}
        <Section title="Loading & Empty States">
          <div className="grid gap-6 md:grid-cols-2">
            <DarkCard hover={false} className="p-5">
              <SkeletonBlock lines={4} />
            </DarkCard>
            <EmptyState
              title="No data yet"
              description="Create something to get started."
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <LoadingSkeleton variant="circle" />
            <LoadingSkeleton variant="text" className="w-32" />
            <LoadingSkeleton variant="card" className="h-24 w-48" />
          </div>
        </Section>

        {/* ── Diagram ── */}
        <Section title="Connector Diagram">
          <ConnectorDiagram />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[var(--text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
