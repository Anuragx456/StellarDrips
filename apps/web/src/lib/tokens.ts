/**
 * Stellar Drips — Cinematic Azure design tokens
 * TypeScript constants for programmatic use.
 * CSS custom properties are the source of truth (see globals.css).
 */

/* ── Colors ── */
export const colors = {
  bg: "#050608",
  bg2: "#070809",
  surface: "#0D0F13",
  surface2: "#121419",
  surface3: "#171A20",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  edgeHighlight: "rgba(255,255,255,0.06)",
  text: "#F4F6FA",
  muted: "#9AA1AC",
  faint: "#6B7280",
  accent: "#2E7DFF",
  accentBright: "#5C9DFF",
  accentDeep: "#0B46B8",
  accentSoft: "rgba(46,125,255,0.14)",
  success: "#34D399",
  warn: "#FBBF24",
  danger: "#FB7185",
  glow: "rgba(46,125,255,0.55)",
} as const;

/* ── Fonts ── */
export const fonts = {
  display: `'Space Grotesk', 'General Sans', ui-sans-serif, system-ui, sans-serif`,
  body: `'Manrope', 'Satoshi', ui-sans-serif, system-ui, sans-serif`,
  mono: `'JetBrains Mono', 'Geist Mono', ui-monospace, monospace`,
} as const;

/* ── Radii ── */
export const radii = {
  pill: "9999px",
  card: "22px",
  input: "14px",
  tile: "12px",
} as const;

/* ── Shadows ── */
export const shadows = {
  card: `0 1px 0 ${colors.edgeHighlight} inset, 0 24px 60px -28px rgba(0,0,0,0.9)`,
  cardHover: `0 0 0 1px rgba(92,157,255,0.25), 0 30px 80px -30px rgba(46,125,255,0.35)`,
  glowBtn: `0 0 0 1px rgba(92,157,255,0.45), 0 10px 34px -8px rgba(46,125,255,0.65)`,
  glowBtnHover: `0 0 0 1px rgba(92,157,255,0.7), 0 14px 44px -8px rgba(46,125,255,0.85)`,
} as const;

/* ── Easing ── */
export const easing = {
  outExpo: [0.22, 1, 0.36, 1] as const,
} as const;

/* ── Durations (ms) ── */
export const durations = {
  micro: 180,
  base: 370,
  reveal: 700,
  ambient: 18000,
} as const;
