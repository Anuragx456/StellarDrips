import {
  Space_Grotesk,
  Manrope,
  JetBrains_Mono,
} from "next/font/google";

/**
 * Cinematic Azure font stack
 *
 * Space Grotesk  — display / headlines (distinctive grotesque)
 * Manrope        — body / UI text (geometric, readable at small sizes)
 * JetBrains Mono — all on-chain values (addresses, hashes, amounts, timestamps)
 */
export const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const fontBody = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "monospace"],
});
