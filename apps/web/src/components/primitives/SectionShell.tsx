"use client";

import { LightBeam } from "./LightBeam";

interface SectionShellProps {
  children: React.ReactNode;
  className?: string;
  beam?: "diagonal-tr" | "horizontal" | "vertical-up" | false;
  id?: string;
}

/**
 * Wraps a page section with consistent vertical rhythm,
 * optional light beam, and id for nav anchoring.
 */
export function SectionShell({
  children,
  className = "",
  beam = false,
  id,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`relative w-full ${className}`}
      data-reveal
    >
      {beam && <LightBeam variant={beam} />}
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        {children}
      </div>
    </section>
  );
}
