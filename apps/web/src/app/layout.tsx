import type { Metadata } from "next";
import { fontDisplay, fontBody, fontMono } from "@/fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Drips — Recurring Payments on Stellar",
  description:
    "Stream XLM on autopilot. Set up recurring subscription payments powered by Soroban smart contracts — no intermediaries, no hidden fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-body">
        {children}
      </body>
    </html>
  );
}
