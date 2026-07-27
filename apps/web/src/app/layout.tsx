import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/context/WalletContext";
import { ConnectWallet } from "@/components/ConnectWallet";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Drips",
  description:
    "Recurring payments and subscriptions on the Stellar network — powered by Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <ErrorBoundary>
            <header className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10">
              <span className="text-lg font-bold tracking-tight">✦ Stellar Drips</span>
              <ConnectWallet />
            </header>
            {children}
          </ErrorBoundary>
        </WalletProvider>
      </body>
    </html>
  );
}
