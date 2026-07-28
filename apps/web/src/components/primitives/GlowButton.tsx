"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "ghost" | "white";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[var(--glow-btn)] hover:shadow-[var(--glow-btn-hover)]",
  ghost:
    "border border-[var(--border)] text-[var(--text)] bg-transparent hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]",
  white:
    "bg-white text-[var(--bg)] hover:bg-white/90",
};

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-[220ms] ${variants[variant]} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

GlowButton.displayName = "GlowButton";
