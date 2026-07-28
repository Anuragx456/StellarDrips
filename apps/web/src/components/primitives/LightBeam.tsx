"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

type LightBeamVariant = "diagonal-tr" | "horizontal" | "vertical-up";

interface LightBeamProps {
  variant: LightBeamVariant;
  className?: string;
}

const variantStyles: Record<LightBeamVariant, string> = {
  "diagonal-tr":
    "fixed top-0 right-0 w-[60vw] h-[80vh] -z-10",
  "horizontal":
    "absolute left-1/2 -translate-x-1/2 w-[70vw] max-w-[900px] h-[40vh] -z-10",
  "vertical-up":
    "absolute left-1/2 bottom-0 -translate-x-1/2 w-[50vw] max-w-[700px] h-[70vh] -z-10",
};

const gradientMap: Record<LightBeamVariant, string> = {
  "diagonal-tr":
    "radial-gradient(ellipse 80% 60% at 80% 10%, rgba(46,125,255,0.12) 0%, transparent 70%)",
  "horizontal":
    "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(46,125,255,0.08) 0%, transparent 70%)",
  "vertical-up":
    "radial-gradient(ellipse 60% 80% at 50% 90%, rgba(46,125,255,0.10) 0%, transparent 70%)",
};

/**
 * Directional volumetric light beam.
 * Slow drift + opacity pulse creates an ambient "living" background effect.
 * NOT aurora blobs or floating orbs.
 */
export function LightBeam({ variant, className = "" }: LightBeamProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      className={`light-beam pointer-events-none overflow-hidden ${variantStyles[variant]} ${className}`}
      style={{
        background: gradientMap[variant],
        filter: "blur(60px)",
      }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 18,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
      aria-hidden="true"
    />
  );
}
