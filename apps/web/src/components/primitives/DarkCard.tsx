"use client";

import { motion } from "framer-motion";

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "section" | "article";
}

/**
 * Charcoal glass card with hairline border, 1px top-edge highlight,
 * rounded-[var(--r-card)], and optional hover glow + lift.
 */
export function DarkCard({
  children,
  className = "",
  hover = true,
  as: Tag = "div",
}: DarkCardProps) {
  const base = `relative rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)]`;
  const edge = `before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-[var(--r-card)] before:bg-[var(--edge-highlight)]`;
  const hov = hover
    ? `transition-all duration-[220ms] ease-[var(--ease-out-expo)] hover:border-[var(--accent-soft)] hover:shadow-[var(--shadow-card-hover)]`
    : "";

  const Component = hover ? motion.div : Tag;
  const motionProps = hover
    ? { whileHover: { y: -4 } as React.ComponentProps<typeof motion.div>["whileHover"] }
    : {};

  return (
    <Component
      className={`${base} ${edge} ${hov} ${className}`}
      {...(motionProps as Record<string, unknown>)}
    >
      {children}
    </Component>
  );
}
