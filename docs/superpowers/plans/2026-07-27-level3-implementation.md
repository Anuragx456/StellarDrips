# Level 3 — Complete Mini dApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Stellar Drips from contract-only MVP to a complete Level 3 hackathon submission with full subscription UI, event dashboard, mobile responsive, tests, and deployed infrastructure.

**Architecture:** 5 vertical slices (A→E) each producing independently demoable features. Frontend extends with a contract library layer (`lib/contract.ts` + `lib/scval.ts`), Soroban interaction hooks, and subscription management components. Each slice includes its own error/loading/empty states and mobile styling.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, @stellar/stellar-sdk v16, @creit.tech/stellar-wallets-kit v2, Vitest, Testing Library

## Global Constraints

- All new components must be `"use client"` (App Router requires it for hooks)
- Use `@/` path alias for src/ imports (configured in tsconfig)
- All hooks return `{ data, loading, error }` for consistent component consumption
- Explorer URLs use `https://stellar.expert/explorer/testnet/tx/${hash}`
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- Stellar addresses match `/^G[A-Z2-7]{55}$/`
- Tailwind CSS v4 syntax: `@import "tailwindcss"` not `@tailwind`

---

## File Map

### Create
- `apps/web/src/lib/types.ts` — Shared TypeScript interfaces
- `apps/web/src/lib/scval.ts` — ScVal encode/decode utilities
- `apps/web/src/lib/contract.ts` — Soroban contract client singleton
- `apps/web/src/hooks/useSubscribe.ts` — Subscribe mutation hook
- `apps/web/src/hooks/useSubscription.ts` — Read subscription(s) hook
- `apps/web/src/hooks/useTopUp.ts` — Top up mutation hook
- `apps/web/src/hooks/useCancel.ts` — Cancel mutation hook
- `apps/web/src/hooks/useEvents.ts` — Event fetching hook
- `apps/web/src/components/SubscribeForm.tsx` — Create subscription form
- `apps/web/src/components/SubscriptionList.tsx` — Subscription list with states
- `apps/web/src/components/SubscriptionCard.tsx` — Single sub card
- `apps/web/src/components/TopUpDialog.tsx` — Top up modal dialog
- `apps/web/src/components/CancelDialog.tsx` — Cancel confirmation modal
- `apps/web/src/components/EventDashboard.tsx` — Event timeline
- `apps/web/src/components/TransactionStatus.tsx` — Reusable tx feedback
- `apps/web/src/components/ErrorBoundary.tsx` — React error boundary
- `apps/web/vitest.config.ts` — Vitest configuration
- `apps/web/src/__tests__/SubscribeForm.test.tsx` — SubscribeForm tests
- `apps/web/src/__tests__/SubscriptionCard.test.tsx` — SubscriptionCard tests
- `apps/web/src/__tests__/TransactionStatus.test.tsx` — TransactionStatus tests
- `apps/web/src/__tests__/useSubscribe.test.ts` — Hook tests
- `docs/evidence/contract-address.md` — Deployed contract evidence

### Modify
- `apps/web/src/app/page.tsx` — Add subscription UI + event dashboard
- `apps/web/src/app/layout.tsx` — Wrap with ErrorBoundary
- `apps/web/src/context/WalletContext.tsx` — Add RPC server helper + soroban env
- `.env.example` — Add NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_TOKEN_ID
- `README.md` — Add deployed addresses, live demo URL, Level 3 updates
- `COMPLIANCE.md` — Mark Level 3 items ✅

---

## Task 1: Deploy contract to testnet (Slice A)

**Files:**
- Modify: `contracts/subscription/src/lib.rs` (no changes needed — already final)
- Create: `docs/evidence/contract-address.md`

**Dependencies:** Stellar CLI, Rust, testnet identity

**Interfaces:**
- Produces: CONTRACT_ID (deployed contract address on testnet), TOKEN_ID (test token address)

- [ ] **Step 1: Verify contract builds**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips/contracts/subscription
cargo build --target wasm32v1-none --release
```

Expected: `target/wasm32v1-none/release/stellar_drips_subscription.wasm` exists.

- [ ] **Step 2: Create or verify testnet identity**

```bash
stellar keys fund testnet-keeper --network testnet 2>/dev/null || \
  stellar keys generate testnet-keeper --network testnet && \
  curl -s "https://friendbot.stellar.org?addr=$(stellar keys address testnet-keeper)" | head -c 100
```

Expected: Identity funded (friendbot response shows 10K XLM).

- [ ] **Step 3: Deploy contract to testnet**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips/contracts/subscription
stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_drips_subscription.wasm \
  --source testnet-keeper \
  --network testnet
```

Capture the output contract ID (starts with `C`). Save as `CONTRACT_ID`.

- [ ] **Step 4: Deploy a test token (SAC) for inter-contract demo**

```bash
stellar contract asset deploy \
  --asset native \
  --source testnet-keeper \
  --network testnet
```

Wait — SAC requires issuer/distributor. Instead, create a custom test token:

```bash
stellar contract asset deploy \
  --asset "TEST:$(stellar keys address testnet-keeper)" \
  --source testnet-keeper \
  --network testnet
```

Capture output token address. Save as `TOKEN_ID`.

- [ ] **Step 5: Create evidence document**

Write `docs/evidence/contract-address.md`:

```markdown
# Deployed Contracts

## Subscription Contract
- **Network:** Stellar Testnet
- **Address:** `<CONTRACT_ID>`
- **Explorer:** `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`
- **Deployed:** 2026-07-27
- **Deployer:** testnet-keeper

## Test Token (SAC)
- **Network:** Stellar Testnet
- **Address:** `<TOKEN_ID>`
- **Purpose:** Inter-contract communication (Level 3.2) — non-XLM subscription demo

## Identity
- **Keeper Key:** testnet-keeper
- **Funded via:** Friendbot
```

- [ ] **Step 6: Add Vercel deployment secrets**

```bash
# Requires Vercel token from dashboard
# gh secret set VERCEL_TOKEN
# gh secret set VERCEL_PROJECT_ID
# gh secret set VERCEL_ORG_ID
```

Run: `gh secret set VERCEL_TOKEN` (paste token when prompted)
Run: `gh secret set VERCEL_PROJECT_ID` (project ID from Vercel dashboard)
Run: `gh secret set VERCEL_ORG_ID` (org ID from Vercel dashboard)

- [ ] **Step 7: Trigger Vercel deploy workflow**

Run: `gh workflow run deploy.yml` (or push to main to trigger auto-deploy)

- [ ] **Step 8: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add docs/evidence/contract-address.md .env.example
git add -A  # include any workflow updates
git commit -m "deploy: contract to testnet, test token, Vercel infra

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Contract lib layer — types, scval, contract client (Slice B)

**Files:**
- Create: `apps/web/src/lib/types.ts`
- Create: `apps/web/src/lib/scval.ts`
- Create: `apps/web/src/lib/contract.ts`

**Interfaces:**
- Produces: Types consumed by all hooks and components

- [ ] **Step 1: Create lib/types.ts**

```typescript
/** Status of a subscription — matches contract SubscriptionStatus enum. */
export enum SubscriptionStatus {
  Active = 0,
  Cancelled = 1,
  Expired = 2,
}

/** Core subscription data — matches contract Subscription struct fields. */
export interface Subscription {
  subscriber: string;
  recipient: string;
  token: string;
  amount: bigint;
  intervalSeconds: number;
  nextPaymentTime: number;
  escrowBalance: bigint;
  paymentCount: number;
  status: SubscriptionStatus;
  createdAt: number;
  expirationTime: number;
}

/** Arguments to create a subscription. */
export interface SubscribeInput {
  recipient: string;
  token?: string; // defaults to XLM native contract if omitted
  amount: bigint; // in smallest unit (stroop for XLM)
  intervalSeconds: number;
  initialEscrow: bigint;
  expirationTime: number; // unix timestamp
}

/** Arguments to top up escrow. */
export interface TopUpInput {
  subscriber: string;
  id: number;
  amount: bigint;
}

/** Arguments to cancel a subscription. */
export interface CancelInput {
  subscriber: string;
  id: number;
  refundRecipient: string;
}

/** Generic async state for hooks. */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Transaction result from a contract mutation. */
export interface TxResult {
  hash: string;
  status: "pending" | "success" | "failed";
}

/** Contract event types — matches contract event symbols. */
export type EventType =
  | "sub_crt"
  | "sub_cnc"
  | "sub_exp"
  | "sub_top"
  | "pay_exe"
  | "pay_fal";

export interface ContractEvent {
  type: EventType;
  subscriber: string;
  id: number;
  value: any;
  timestamp: number;
  txHash: string;
}

/** Human-readable labels for event types. */
export const EVENT_LABELS: Record<EventType, string> = {
  sub_crt: "Subscription Created",
  sub_cnc: "Subscription Cancelled",
  sub_exp: "Subscription Expired",
  sub_top: "Escrow Topped Up",
  pay_exe: "Payment Executed",
  pay_fal: "Payment Failed",
};

/** Explorer base URL. */
export const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";
```

- [ ] **Step 2: Create lib/scval.ts**

```typescript
import { Address, nativeToScVal, scValToNative, xdr } from "@stellar/stellar-sdk";

/** Convert a Stellar address string (G...) to an ScVal for contract calls. */
export function addressToScVal(addr: string): xdr.ScVal {
  return Address.fromString(addr).toScVal();
}

/** Convert a u32 number to an ScVal. */
export function u32ToScVal(n: number): xdr.ScVal {
  return nativeToScVal(n, { type: "u32" });
}

/** Convert an i128 (bigint or number) to an ScVal. */
export function i128ToScVal(n: bigint | number): xdr.ScVal {
  return nativeToScVal(n, { type: "i128" });
}

/** Convert a u64 number to an ScVal. */
export function u64ToScVal(n: number): xdr.ScVal {
  return nativeToScVal(n, { type: "u64" });
}

/**
 * Parse the 11-element Vec returned by get_subscription into a Subscription object.
 * The contract returns [subscriber, recipient, token, amount, interval_seconds,
 * next_payment_time, escrow_balance, payment_count, status, created_at, expiration_time].
 */
export function parseSubscription(raw: any): {
  subscriber: string;
  recipient: string;
  token: string;
  amount: bigint;
  intervalSeconds: number;
  nextPaymentTime: number;
  escrowBalance: bigint;
  paymentCount: number;
  status: number;
  createdAt: number;
  expirationTime: number;
} {
  if (!Array.isArray(raw) || raw.length < 11) {
    throw new Error("Invalid subscription data from contract");
  }
  return {
    subscriber: String(raw[0] ?? ""),
    recipient: String(raw[1] ?? ""),
    token: String(raw[2] ?? ""),
    amount: BigInt(String(raw[3] ?? "0")),
    intervalSeconds: Number(raw[4] ?? 0),
    nextPaymentTime: Number(raw[5] ?? 0),
    escrowBalance: BigInt(String(raw[6] ?? "0")),
    paymentCount: Number(raw[7] ?? 0),
    status: Number(raw[8] ?? -1),
    createdAt: Number(raw[9] ?? 0),
    expirationTime: Number(raw[10] ?? 0),
  };
}

/**
 * Parse a Soroban event topic to extract event type, subscriber, and id.
 * Event topic format in contract: (Symbol, Address, u32)
 */
export function parseEventTopic(topic: xdr.ScVal[]): {
  type: string;
  subscriber: string;
  id: number;
} | null {
  try {
    if (topic.length < 3) return null;
    const raw = scValToNative(topic);
    if (!Array.isArray(raw) || raw.length < 3) return null;
    return {
      type: String(raw[0] ?? ""),
      subscriber: String(raw[1] ?? ""),
      id: Number(raw[2] ?? 0),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Create lib/contract.ts**

```typescript
import { Contract, rpc, xdr } from "@stellar/stellar-sdk";
import {
  addressToScVal,
  u32ToScVal,
  i128ToScVal,
  u64ToScVal,
} from "./scval";

/** Get the Soroban RPC URL from env or default to testnet. */
function getRpcUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_RPC_URL) {
    return process.env.NEXT_PUBLIC_RPC_URL;
  }
  return "https://soroban-testnet.stellar.org";
}

/** Get the contract ID from env. */
function getContractId(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTRACT_ID) {
    return process.env.NEXT_PUBLIC_CONTRACT_ID;
  }
  return "";
}

/** Get the network passphrase from env or default to testnet. */
export function getNetworkPassphrase(): string {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE
  ) {
    return process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
  }
  return "Test SDF Network ; September 2015";
}

/** Create a singleton rpc.Server instance. */
let _server: rpc.Server | null = null;
export function getServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(getRpcUrl());
  }
  return _server;
}

/** Create a singleton Contract instance. */
let _contract: Contract | null = null;
export function getContract(): Contract {
  if (!_contract) {
    const id = getContractId();
    if (!id) throw new Error("NEXT_PUBLIC_CONTRACT_ID is not configured");
    _contract = new Contract(id);
  }
  return _contract;
}

/**
 * Build an array of ScVal arguments for a contract method call.
 * Utility that wraps the most common patterns.
 */
export function buildContractArgs(
  method: string,
  ...params: xdr.ScVal[]
): xdr.ScVal[] {
  return params;
}

/**
 * Encode a subscribe call's arguments.
 */
export function encodeSubscribeArgs(
  subscriber: string,
  recipient: string,
  token: string,
  amount: bigint,
  intervalSeconds: number,
  initialEscrow: bigint,
  expirationTime: number,
): xdr.ScVal[] {
  return [
    addressToScVal(subscriber),
    addressToScVal(recipient),
    addressToScVal(token),
    i128ToScVal(amount),
    u64ToScVal(intervalSeconds),
    i128ToScVal(initialEscrow),
    u64ToScVal(expirationTime),
  ];
}

/**
 * Encode a get_subscription call's arguments.
 */
export function encodeGetSubArgs(
  subscriber: string,
  id: number,
): xdr.ScVal[] {
  return [addressToScVal(subscriber), u32ToScVal(id)];
}

/**
 * Encode a top_up call's arguments.
 */
export function encodeTopUpArgs(
  subscriber: string,
  id: number,
  amount: bigint,
): xdr.ScVal[] {
  return [addressToScVal(subscriber), u32ToScVal(id), i128ToScVal(amount)];
}

/**
 * Encode a cancel call's arguments.
 */
export function encodeCancelArgs(
  subscriber: string,
  id: number,
  refundRecipient: string,
): xdr.ScVal[] {
  return [
    addressToScVal(subscriber),
    u32ToScVal(id),
    addressToScVal(refundRecipient),
  ];
}

/**
 * Encode a subscription_count call's arguments.
 */
export function encodeSubCountArgs(subscriber: string): xdr.ScVal[] {
  return [addressToScVal(subscriber)];
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/lib/
git commit -m "feat: contract lib layer with ScVal helpers and types

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: TransactionStatus component + useSubscribe hook + SubscribeForm (Slice B)

**Files:**
- Create: `apps/web/src/components/TransactionStatus.tsx`
- Create: `apps/web/src/hooks/useSubscribe.ts`
- Create: `apps/web/src/components/SubscribeForm.tsx`
- Modify: `.env.example` — add NEXT_PUBLIC_CONTRACT_ID placeholder

**Interfaces:**
- Consumes: `lib/types.ts`, `lib/contract.ts`, `lib/scval.ts`
- Produces: `TransactionStatus` component, `useSubscribe` hook, `SubscribeForm` component

- [ ] **Step 1: Create TransactionStatus component**

```tsx
"use client";

import { EXPLORER_BASE } from "@/lib/types";

export type TxStatusType = "idle" | "pending" | "success" | "error";

export interface TransactionStatusProps {
  status: TxStatusType;
  txHash?: string;
  error?: string;
  onRetry?: () => void;
}

export function TransactionStatus({
  status,
  txHash,
  error,
  onRetry,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-md">
      {/* Pending */}
      {status === "pending" && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="size-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          Confirming transaction…
        </div>
      )}

      {/* Success */}
      {status === "success" && txHash && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ✅ Transaction confirmed
          </span>
          <a
            href={`${EXPLORER_BASE}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
          >
            View on Stellar.Expert →
          </a>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-red-600 dark:text-red-400">
            ⚠ {error ?? "Transaction failed"}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create useSubscribe hook**

```tsx
"use client";

import { useReducer, useCallback } from "react";
import {
  TransactionBuilder,
  Transaction,
} from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeSubscribeArgs,
  getNetworkPassphrase,
} from "@/lib/contract";
import type { SubscribeInput, TxResult } from "@/lib/types";

export type SubscribeStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

interface SubscribeState {
  status: SubscribeStatus;
}

type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function subscribeReducer(_prev: SubscribeState, action: Action): SubscribeState {
  switch (action.type) {
    case "building": return { status: { type: "building" } };
    case "signing": return { status: { type: "signing" } };
    case "submitting": return { status: { type: "submitting" } };
    case "success": return { status: { type: "success", txHash: action.txHash } };
    case "error": return { status: { type: "error", error: action.error } };
    case "reset": return { status: { type: "idle" } };
  }
}

export interface UseSubscribeReturn {
  status: SubscribeStatus;
  execute: (input: SubscribeInput) => Promise<void>;
  reset: () => void;
}

export function useSubscribe(): UseSubscribeReturn {
  const { address } = useWallet();
  const [state, dispatch] = useReducer(subscribeReducer, { status: { type: "idle" } });

  const execute = useCallback(
    async (input: SubscribeInput) => {
      if (!address) {
        dispatch({ type: "error", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "building" });

      try {
        const server = getServer();
        const contract = getContract();
        const passphrase = getNetworkPassphrase();
        const account = await server.getAccount(address);

        dispatch({ type: "signing" });

        const args = encodeSubscribeArgs(
          address,
          input.recipient,
          input.token ?? address, // Default: uses subscriber as placeholder for XLM native
          input.amount,
          input.intervalSeconds,
          input.initialEscrow,
          input.expirationTime,
        );

        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call("subscribe", ...args))
          .setTimeout(30)
          .build();

        const prepared = await server.prepareTransaction(tx);
        const signedXdr = prepared.toXDR();

        const { signedTxXdr } = await StellarWalletsKit.signTransaction(
          signedXdr,
          { networkPassphrase: passphrase, address },
        );

        dispatch({ type: "submitting" });

        const signedTx = new Transaction(signedTxXdr, passphrase);
        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.errorResult) {
          dispatch({ type: "error", error: `Transaction rejected: ${sendResult.errorResult}` });
          return;
        }

        if (sendResult.status === "ERROR") {
          dispatch({ type: "error", error: "Transaction submission failed" });
          return;
        }

        // Poll for completion
        const hash = sendResult.hash;
        let attempts = 0;
        while (attempts < 30) {
          attempts++;
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            dispatch({ type: "success", txHash: hash });
            return;
          }
          if (result.status === "FAILED") {
            dispatch({ type: "error", error: "Transaction failed on the network" });
            return;
          }
          await new Promise((r) => setTimeout(r, 1_000));
        }

        dispatch({ type: "error", error: "Transaction timed out" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Subscribe failed";
        dispatch({ type: "error", error: msg });
      }
    },
    [address],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { status: state.status, execute, reset };
}
```

- [ ] **Step 3: Create SubscribeForm component**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { TransactionStatus } from "@/components/TransactionStatus";
import type { TxStatusType } from "@/components/TransactionStatus";

/** Validate a Stellar public key (G…). */
function isValidPublicKey(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value);
}

const INTERVAL_OPTIONS = [
  { label: "Daily", value: 86400 },
  { label: "Weekly", value: 604800 },
  { label: "Monthly (30 days)", value: 2592000 },
];

export function SubscribeForm() {
  const { status, execute, reset } = useSubscribe();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(604800);
  const [initialEscrow, setInitialEscrow] = useState("");
  const [expirationDays, setExpirationDays] = useState(365);

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const amountNum = BigInt(Math.round(Number(amount) * 10_000_000)); // Convert XLM → stroop
    const escrowNum = BigInt(Math.round(Number(initialEscrow) * 10_000_000));
    const expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 86400;

    await execute({
      recipient: recipient.trim(),
      amount: amountNum,
      intervalSeconds,
      initialEscrow: escrowNum,
      expirationTime,
      token: undefined, // uses default
    });
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setInitialEscrow("");
    reset();
  };

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Subscription
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Recipient */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipient" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            placeholder="G…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {recipient && !isValidPublicKey(recipient) && (
            <p className="text-xs text-red-500">Must be a valid Stellar address starting with G</p>
          )}
        </div>

        {/* Amount per interval */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Amount per Payment (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Interval */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="interval" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Payment Interval
          </label>
          <select
            id="interval"
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Initial Escrow */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="escrow" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Initial Escrow (XLM)
          </label>
          <input
            id="escrow"
            type="text"
            inputMode="decimal"
            placeholder="100"
            value={initialEscrow}
            onChange={(e) => setInitialEscrow(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Expiration */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expiration" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Expires After (days)
          </label>
          <input
            id="expiration"
            type="number"
            min={1}
            max={3650}
            value={expirationDays}
            onChange={(e) => setExpirationDays(Number(e.target.value))}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending || !recipient.trim() || !amount.trim() || !initialEscrow.trim()}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Subscribing…" : "Create Subscription"}
          </button>

          {status.type !== "idle" && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Status feedback */}
      <TransactionStatus
        status={txStatus}
        txHash={status.type === "success" ? status.txHash : undefined}
        error={status.type === "error" ? status.error : undefined}
        onRetry={handleSubmit}
      />
    </div>
  );
}
```

- [ ] **Step 5: Update .env.example"

Add to end of `.env.example`:
```
# --- Frontend Contract Integration (Level 3) ---
NEXT_PUBLIC_CONTRACT_ID=
NEXT_PUBLIC_TOKEN_ID=
```

- [ ] **Step 6: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/components/TransactionStatus.tsx
git add apps/web/src/hooks/useSubscribe.ts
git add apps/web/src/components/SubscribeForm.tsx
git add .env.example
git commit -m "feat: SubscribeForm with contract integration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Subscription dashboard — list, top-up, cancel (Slice C)

**Files:**
- Create: `apps/web/src/hooks/useSubscription.ts`
- Create: `apps/web/src/hooks/useTopUp.ts`
- Create: `apps/web/src/hooks/useCancel.ts`
- Create: `apps/web/src/components/SubscriptionCard.tsx`
- Create: `apps/web/src/components/SubscriptionList.tsx`
- Create: `apps/web/src/components/TopUpDialog.tsx`
- Create: `apps/web/src/components/CancelDialog.tsx`

**Interfaces:**
- Consumes: `lib/types.ts`, `lib/contract.ts`, `lib/scval.ts`, `TransactionStatus`

- [ ] **Step 1: Create useSubscription hook**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeGetSubArgs,
  encodeSubCountArgs,
} from "@/lib/contract";
import { parseSubscription } from "@/lib/scval";
import type { Subscription, AsyncState } from "@/lib/types";

export interface UseSubscriptionReturn extends AsyncState<Subscription[]> {
  refresh: () => void;
}

export function useSubscription(id?: number): UseSubscriptionReturn {
  const { address, isConnected } = useWallet();
  const [data, setData] = useState<Subscription[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (!isConnected || !address) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchSubs = async () => {
      setLoading(true);
      setError(null);

      try {
        const server = getServer();
        const contract = getContract();
        const account = await server.getAccount(address);

        // Check total count
        const countTx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: "Test SDF Network ; September 2015",
        })
          .addOperation(contract.call("subscription_count", ...encodeSubCountArgs(address)))
          .setTimeout(30)
          .build();

        const countSim = await server.simulateTransaction(countTx);
        const countResult = (countSim as any)?.result?.retval
          ? (countSim as any).result
          : (countSim as any)?.results?.[0];

        const rawCount = countResult?.retval ?? null;
        const totalCount = rawCount
          ? Number((await import("@stellar/stellar-sdk")).scValToNative(rawCount))
          : 0;

        if (cancelled) return;

        if (totalCount === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        // Fetch each subscription via simulation
        const subs: Subscription[] = [];
        const ids = id !== undefined ? [id] : Array.from({ length: totalCount }, (_, i) => i);

        for (const subId of ids) {
          const subTx = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: "Test SDF Network ; September 2015",
          })
            .addOperation(contract.call("get_subscription", ...encodeGetSubArgs(address, subId)))
            .setTimeout(30)
            .build();

          const subSim = await server.simulateTransaction(subTx);
          const subResult = (subSim as any)?.result?.retval
            ? (subSim as any).result
            : (subSim as any)?.results?.[0];

          if (subResult?.retval && !cancelled) {
            const raw = (await import("@stellar/stellar-sdk")).scValToNative(subResult.retval);
            const parsed = parseSubscription(raw);
            subs.push({
              subscriber: parsed.subscriber,
              recipient: parsed.recipient,
              token: parsed.token,
              amount: parsed.amount,
              intervalSeconds: parsed.intervalSeconds,
              nextPaymentTime: parsed.nextPaymentTime,
              escrowBalance: parsed.escrowBalance,
              paymentCount: parsed.paymentCount,
              status: parsed.status,
              createdAt: parsed.createdAt,
              expirationTime: parsed.expirationTime,
            });
          }
        }

        if (!cancelled) {
          setData(subs);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch subscriptions");
          setLoading(false);
        }
      }
    };

    fetchSubs();

    return () => { cancelled = true; };
  }, [address, isConnected, id, trigger]);

  return { data, loading, error, refresh };
}
```

- [ ] **Step 2: Create useTopUp hook**

```tsx
"use client";

import { useReducer, useCallback } from "react";
import {
  TransactionBuilder,
  Transaction,
} from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeTopUpArgs,
  getNetworkPassphrase,
} from "@/lib/contract";
import type { TopUpInput, TxResult } from "@/lib/types";

export type TopUpStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

interface TopUpState { status: TopUpStatus }
type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function topUpReducer(_prev: TopUpState, action: Action): TopUpState {
  switch (action.type) {
    case "building": return { status: { type: "building" } };
    case "signing": return { status: { type: "signing" } };
    case "submitting": return { status: { type: "submitting" } };
    case "success": return { status: { type: "success", txHash: action.txHash } };
    case "error": return { status: { type: "error", error: action.error } };
    case "reset": return { status: { type: "idle" } };
  }
}

export interface UseTopUpReturn {
  status: TopUpStatus;
  execute: (input: TopUpInput) => Promise<void>;
  reset: () => void;
}

export function useTopUp(): UseTopUpReturn {
  const { address } = useWallet();
  const [state, dispatch] = useReducer(topUpReducer, { status: { type: "idle" } });

  const execute = useCallback(
    async (input: TopUpInput) => {
      if (!address) {
        dispatch({ type: "error", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "building" });

      try {
        const server = getServer();
        const contract = getContract();
        const passphrase = getNetworkPassphrase();
        const account = await server.getAccount(address);

        dispatch({ type: "signing" });

        const args = encodeTopUpArgs(input.subscriber, input.id, input.amount);
        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call("top_up", ...args))
          .setTimeout(30)
          .build();

        const prepared = await server.prepareTransaction(tx);
        const signedXdr = prepared.toXDR();
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(signedXdr, {
          networkPassphrase: passphrase,
          address,
        });

        dispatch({ type: "submitting" });

        const signedTx = new Transaction(signedTxXdr, passphrase);
        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.errorResult) {
          dispatch({ type: "error", error: `Transaction rejected: ${sendResult.errorResult}` });
          return;
        }

        const hash = sendResult.hash;
        let attempts = 0;
        while (attempts < 30) {
          attempts++;
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            dispatch({ type: "success", txHash: hash });
            return;
          }
          if (result.status === "FAILED") {
            dispatch({ type: "error", error: "Transaction failed on the network" });
            return;
          }
          await new Promise((r) => setTimeout(r, 1_000));
        }
        dispatch({ type: "error", error: "Transaction timed out" });
      } catch (err) {
        dispatch({ type: "error", error: err instanceof Error ? err.message : "Top up failed" });
      }
    },
    [address],
  );

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return { status: state.status, execute, reset };
}
```

- [ ] **Step 3: Create useCancel hook**

```tsx
"use client";

import { useReducer, useCallback } from "react";
import {
  TransactionBuilder,
  Transaction,
} from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/context/WalletContext";
import {
  getServer,
  getContract,
  encodeCancelArgs,
  getNetworkPassphrase,
} from "@/lib/contract";
import type { CancelInput } from "@/lib/types";

export type CancelStatus =
  | { type: "idle" }
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string };

interface CancelState { status: CancelStatus }
type Action =
  | { type: "building" }
  | { type: "signing" }
  | { type: "submitting" }
  | { type: "success"; txHash: string }
  | { type: "error"; error: string }
  | { type: "reset" };

function cancelReducer(_prev: CancelState, action: Action): CancelState {
  switch (action.type) {
    case "building": return { status: { type: "building" } };
    case "signing": return { status: { type: "signing" } };
    case "submitting": return { status: { type: "submitting" } };
    case "success": return { status: { type: "success", txHash: action.txHash } };
    case "error": return { status: { type: "error", error: action.error } };
    case "reset": return { status: { type: "idle" } };
  }
}

export interface UseCancelReturn {
  status: CancelStatus;
  execute: (input: CancelInput) => Promise<void>;
  reset: () => void;
}

export function useCancel(): UseCancelReturn {
  const { address } = useWallet();
  const [state, dispatch] = useReducer(cancelReducer, { status: { type: "idle" } });

  const execute = useCallback(
    async (input: CancelInput) => {
      if (!address) {
        dispatch({ type: "error", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "building" });

      try {
        const server = getServer();
        const contract = getContract();
        const passphrase = getNetworkPassphrase();
        const account = await server.getAccount(address);

        dispatch({ type: "signing" });

        const args = encodeCancelArgs(input.subscriber, input.id, input.refundRecipient);
        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call("cancel", ...args))
          .setTimeout(30)
          .build();

        const prepared = await server.prepareTransaction(tx);
        const signedXdr = prepared.toXDR();
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(signedXdr, {
          networkPassphrase: passphrase,
          address,
        });

        dispatch({ type: "submitting" });

        const signedTx = new Transaction(signedTxXdr, passphrase);
        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.errorResult) {
          dispatch({ type: "error", error: `Transaction rejected: ${sendResult.errorResult}` });
          return;
        }

        const hash = sendResult.hash;
        let attempts = 0;
        while (attempts < 30) {
          attempts++;
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            dispatch({ type: "success", txHash: hash });
            return;
          }
          if (result.status === "FAILED") {
            dispatch({ type: "error", error: "Transaction failed on the network" });
            return;
          }
          await new Promise((r) => setTimeout(r, 1_000));
        }
        dispatch({ type: "error", error: "Transaction timed out" });
      } catch (err) {
        dispatch({ type: "error", error: err instanceof Error ? err.message : "Cancel failed" });
      }
    },
    [address],
  );

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return { status: state.status, execute, reset };
}
```

- [ ] **Step 4: Create SubscriptionCard component**

```tsx
"use client";

import type { Subscription, SubscriptionStatus } from "@/lib/types";

interface SubscriptionCardProps {
  sub: Subscription;
  onTopUp: () => void;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  0: { label: "Active", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  1: { label: "Cancelled", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500 dark:text-zinc-400", dot: "bg-zinc-400" },
  2: { label: "Expired", bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
};

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatXlm(balance: bigint): string {
  const num = Number(balance) / 10_000_000;
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubscriptionCard({ sub, onTopUp, onCancel }: SubscriptionCardProps) {
  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG[2];
  const isActive = sub.status === 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs text-zinc-400 font-mono">#{sub.paymentCount} payments</span>
      </div>

      {/* Recipient */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Recipient</span>
        <span className="text-sm font-mono text-zinc-800 dark:text-zinc-200" title={sub.recipient}>
          {formatAddress(sub.recipient)}
        </span>
      </div>

      {/* Amount & Interval */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Amount</span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {formatXlm(sub.amount)} XLM
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {sub.intervalSeconds >= 2592000 ? "Monthly" : sub.intervalSeconds >= 604800 ? "Weekly" : "Daily"}
          </span>
          <span className="text-xs text-zinc-400">
            Every {sub.intervalSeconds >= 86400 ? `${Math.round(sub.intervalSeconds / 86400)}d` : `${sub.intervalSeconds}s`}
          </span>
        </div>
      </div>

      {/* Escrow progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Escrow</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{formatXlm(sub.escrowBalance)} XLM</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${sub.amount > 0 ? Math.min(100, Number((sub.escrowBalance * BigInt(100)) / sub.amount)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Next payment */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        {isActive && sub.nextPaymentTime > 0 ? (
          <>Next: {formatDate(sub.nextPaymentTime)}</>
        ) : (
          <>{sub.status === 2 ? "Expired" : "No upcoming payments"}</>
        )}
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onTopUp}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Top Up
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create SubscriptionList component**

```tsx
"use client";

import { useWallet } from "@/context/WalletContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionCard } from "./SubscriptionCard";

interface SubscriptionListProps {
  onTopUp: (sub: any) => void;
  onCancel: (sub: any) => void;
}

export function SubscriptionList({ onTopUp, onCancel }: SubscriptionListProps) {
  const { isConnected } = useWallet();
  const { data: subs, loading, error, refresh } = useSubscription();

  if (!isConnected) return null;

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20 mb-4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-32 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24 mb-4" />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Your Subscriptions</h2>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">⚠ {error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!subs || subs.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Your Subscriptions</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">No subscriptions yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Create your first subscription using the form above.
          </p>
        </div>
      </div>
    );
  }

  // Data state
  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your Subscriptions</h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subs.map((sub, idx) => (
          <SubscriptionCard
            key={idx}
            sub={sub}
            onTopUp={() => onTopUp(sub)}
            onCancel={() => onCancel(sub)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create TopUpDialog component**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useTopUp } from "@/hooks/useTopUp";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  subscriber: string;
  id: number;
  currentEscrow: bigint;
  onSuccess: () => void;
}

function formatXlm(balance: bigint): string {
  return (Number(balance) / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function TopUpDialog({ open, onClose, subscriber, id, currentEscrow, onSuccess }: TopUpDialogProps) {
  const { status, execute, reset } = useTopUp();
  const [amount, setAmount] = useState("");

  if (!open) return null;

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const amountNum = BigInt(Math.round(Number(amount) * 10_000_000));
    await execute({ subscriber, id, amount: amountNum });
  };

  const handleClose = () => {
    reset();
    setAmount("");
    onClose();
  };

  // On success, close after brief delay
  if (status.type === "success") {
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  }

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Top Up Escrow</h3>

        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Current escrow: <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatXlm(currentEscrow)} XLM</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="topup-amount" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Amount to Add (XLM)
            </label>
            <input
              id="topup-amount"
              type="text"
              inputMode="decimal"
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            />
          </div>

          <TransactionStatus
            status={txStatus}
            txHash={status.type === "success" ? status.txHash : undefined}
            error={status.type === "error" ? status.error : undefined}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending || !amount.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Confirming…" : "Confirm Top Up"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create CancelDialog component**

```tsx
"use client";

import { useCancel } from "@/hooks/useCancel";
import { TransactionStatus } from "./TransactionStatus";
import type { TxStatusType } from "./TransactionStatus";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  subscriber: string;
  id: number;
  refundRecipient: string;
  escrowBalance: bigint;
  onSuccess: () => void;
}

function formatXlm(balance: bigint): string {
  return (Number(balance) / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function CancelDialog({ open, onClose, subscriber, id, refundRecipient, escrowBalance, onSuccess }: CancelDialogProps) {
  const { status, execute, reset } = useCancel();

  if (!open) return null;

  const isPending =
    status.type === "building" ||
    status.type === "signing" ||
    status.type === "submitting";

  const handleConfirm = async () => {
    if (isPending) return;
    await execute({ subscriber, id, refundRecipient });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (status.type === "success") {
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  }

  const txStatus: TxStatusType =
    status.type === "building" || status.type === "signing" || status.type === "submitting"
      ? "pending"
      : status.type === "success"
        ? "success"
        : status.type === "error"
          ? "error"
          : "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Cancel Subscription</h3>

        <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 space-y-2">
          <p>This will immediately cancel this subscription and refund the remaining escrow balance.</p>
          <p>Refund amount: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatXlm(escrowBalance)} XLM</span></p>
          <p className="text-xs text-zinc-500">Refund recipient: {refundRecipient.slice(0, 8)}…</p>
        </div>

        <TransactionStatus
          status={txStatus}
          txHash={status.type === "success" ? status.txHash : undefined}
          error={status.type === "error" ? status.error : undefined}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Cancelling…" : "Confirm Cancel"}
          </button>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Keep Subscription
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/hooks/useSubscription.ts
git add apps/web/src/hooks/useTopUp.ts
git add apps/web/src/hooks/useCancel.ts
git add apps/web/src/components/SubscriptionCard.tsx
git add apps/web/src/components/SubscriptionList.tsx
git add apps/web/src/components/TopUpDialog.tsx
git add apps/web/src/components/CancelDialog.tsx
git commit -m "feat: subscription dashboard with list/top-up/cancel

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Event dashboard (Slice D)

**Files:**
- Create: `apps/web/src/hooks/useEvents.ts`
- Create: `apps/web/src/components/EventDashboard.tsx`
- Modify: `apps/web/src/app/page.tsx` — integrate all components

- [ ] **Step 1: Create useEvents hook**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getServer } from "@/lib/contract";
import { parseEventTopic } from "@/lib/scval";
import type { ContractEvent, EventType } from "@/lib/types";

export interface UseEventsReturn {
  events: ContractEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const server = getServer();

        // Use getEvents to fetch recent contract events
        const eventResult = await server.getEvents({
          startLedger: 0, // Will use latest available
          filters: [{
            type: "contract" as any,
            contractIds: [process.env.NEXT_PUBLIC_CONTRACT_ID ?? ""].filter(Boolean),
          }],
          limit: 50,
        });

        if (cancelled) return;

        const parsed: ContractEvent[] = [];

        for (const entry of eventResult?.events ?? []) {
          const topic = entry.topic;
          const topicParsed = parseEventTopic(topic);
          if (!topicParsed) continue;

          parsed.push({
            type: topicParsed.type.substring(0, 7) as EventType,
            subscriber: topicParsed.subscriber,
            id: topicParsed.id,
            value: entry.value,
            timestamp: entry.ledgerClosedAt
              ? new Date(entry.ledgerClosedAt).getTime()
              : Date.now(),
            txHash: entry.id ?? "",
          });
        }

        if (!cancelled) {
          setEvents(parsed.reverse()); // reverse-chronological
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch events");
          setLoading(false);
        }
      }
    };

    fetchEvents();

    // Poll every 10 seconds
    const interval = setInterval(fetchEvents, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [trigger]);

  return { events, loading, error, refresh };
}
```

- [ ] **Step 2: Create EventDashboard component**

```tsx
"use client";

import { useEvents, EVENT_LABELS } from "@/lib/types";
import { EXPLORER_BASE } from "@/lib/types";
import { useEvents as useEventsHook } from "@/hooks/useEvents";

const EVENT_ICONS: Record<string, string> = {
  sub_crt: "🟢",
  sub_cnc: "🔴",
  sub_exp: "⚪",
  sub_top: "🔵",
  pay_exe: "🪙",
  pay_fal: "⛔",
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function EventDashboard() {
  const { events, loading, error, refresh } = useEventsHook();

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Event Dashboard</h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">⚠ {error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">No events yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Create a subscription to get started.
          </p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && events.length > 0 && (
        <div className="space-y-2">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
            >
              <span className="text-lg">{EVENT_ICONS[evt.type] ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                  {EVENT_LABELS[evt.type as keyof typeof EVENT_LABELS] ?? evt.type}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {evt.subscriber.slice(0, 8)}… #{evt.id} — {timeAgo(evt.timestamp)}
                </p>
              </div>
              {evt.txHash && (
                <a
                  href={`${EXPLORER_BASE}/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline shrink-0"
                >
                  Tx
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**NOTE:** The EventDashboard imports use `EVENT_LABELS` from types but we defined it there, and `useEvents` from hooks — need to fix the import to not re-import from types. Fix:

```tsx
// Remove: import { useEvents, EVENT_LABELS } from "@/lib/types";
// Keep only:
import { EVENT_LABELS } from "@/lib/types";
import { useEvents as useEventsHook } from "@/hooks/useEvents";
// And in the component call useEventsHook() not useEvents()
```

- [ ] **Step 3: Update page.tsx — integrate subscription UI + event dashboard**

Replace the content of `apps/web/src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SubscriptionList } from "@/components/SubscriptionList";
import { EventDashboard } from "@/components/EventDashboard";
import { TopUpDialog } from "@/components/TopUpDialog";
import { CancelDialog } from "@/components/CancelDialog";

export default function Home() {
  const { address, isConnected, isTestnet } = useWallet();
  const { balance, isLoading, error } = useBalance();

  // Dialog state
  const [topUpTarget, setTopUpTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  const formatted = balance
    ? Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      })
    : null;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center py-8 px-4 gap-10">
        {/* Header */}
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Stellar Drips
          </h1>
          <p className="max-w-lg text-base text-zinc-600 dark:text-zinc-400">
            Recurring payments and subscriptions on the Stellar network.
          </p>

          {/* Wallet status */}
          {isConnected && address && (
            <div className="flex flex-col items-center gap-2">
              <code className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg break-all max-w-full">
                {address}
              </code>

              {/* Balance */}
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {isLoading ? (
                  <span className="animate-pulse">Loading balance…</span>
                ) : error ? (
                  <span className="text-red-500">⚠ {error}</span>
                ) : formatted ? (
                  <>Balance: <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatted}</strong> XLM</>
                ) : null}
              </div>

              {!isTestnet && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠ Switch wallet network to Testnet
                </p>
              )}

              {isTestnet && (
                <a
                  href={`https://friendbot.stellar.org?addr=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline"
                >
                  🪣 Get testnet XLM from Friendbot
                </a>
              )}
            </div>
          )}
        </header>

        {/* Subscribe form — only when connected on testnet */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <SubscribeForm />
          </section>
        )}

        {/* Subscription dashboard */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center">
            <SubscriptionList
              onTopUp={(sub) => setTopUpTarget(sub)}
              onCancel={(sub) => setCancelTarget(sub)}
            />
          </section>
        )}

        {/* Event dashboard */}
        {isConnected && isTestnet && (
          <section className="w-full flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <EventDashboard />
          </section>
        )}

        {/* Disconnected state */}
        {!isConnected && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Connect your wallet using the button above to get started.
          </p>
        )}
      </main>

      {/* Dialogs */}
      <TopUpDialog
        open={!!topUpTarget}
        onClose={() => setTopUpTarget(null)}
        subscriber={topUpTarget?.subscriber ?? ""}
        id={topUpTarget?.id ?? 0}
        currentEscrow={topUpTarget?.escrowBalance ?? BigInt(0)}
        onSuccess={() => setTopUpTarget(null)}
      />

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        subscriber={cancelTarget?.subscriber ?? ""}
        id={cancelTarget?.id ?? 0}
        refundRecipient={cancelTarget?.subscriber ?? ""}
        escrowBalance={cancelTarget?.escrowBalance ?? BigInt(0)}
        onSuccess={() => setCancelTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/hooks/useEvents.ts
git add apps/web/src/components/EventDashboard.tsx
git add apps/web/src/app/page.tsx
git commit -m "feat: event dashboard with real-time timeline

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: ErrorBoundary + env + WalletContext update (infrastructure)

**Files:**
- Create: `apps/web/src/components/ErrorBoundary.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/context/WalletContext.tsx`
- Modify: `.env.example`

- [ ] **Step 1: Create ErrorBoundary component**

```tsx
"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 2: Update layout.tsx to wrap with ErrorBoundary**

In `apps/web/src/app/layout.tsx`, add the import and wrap:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";
```

Then change `<body>`:
```tsx
<body className="min-h-full flex flex-col">
  <WalletProvider>
    <ErrorBoundary>
      <header>...</header>
      {children}
    </ErrorBoundary>
  </WalletProvider>
</body>
```

- [ ] **Step 3: Update .env.example**

Ensure the following entries exist in `.env.example`:
```
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_CONTRACT_ID=
NEXT_PUBLIC_TOKEN_ID=
```

- [ ] **Step 4: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/components/ErrorBoundary.tsx
git add apps/web/src/app/layout.tsx
git add .env.example
git commit -m "chore: add ErrorBoundary, env config, and layout wrap

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Update README with deployment info and docs (Slice D docs)

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README.md**

Update the "Deployed Contracts" section and "Live demo" section in `README.md`:

Replace the placeholder addresses:
```markdown
## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| Subscription | Testnet | `<CONTRACT_ID_FROM_TASK_1>` |
| Test Token | Testnet | `<TOKEN_ID_FROM_TASK_1>` |

See [docs/evidence/contract-address.md](docs/evidence/contract-address.md) for full details.
```

Replace the demo links:
```markdown
- **Live demo:** `<VERCEL_URL_FROM_TASK_1>`
```

Also add Level 3 features to README — add a Features section with checkmarks:
```markdown
## Features

### Level 1 ✅
- ✅ Freighter wallet connect/disconnect
- ✅ Stellar Testnet support
- ✅ XLM balance display
- ✅ One-time XLM payment with success/failure feedback

### Level 2 ✅
- ✅ Soroban smart contract (subscribe, top_up, execute_payment, cancel)
- ✅ 26 contract tests passing
- ✅ Off-chain payment scheduler / keeper

### Level 3 ✅
- ✅ Contract deployed on testnet
- ✅ Inter-contract communication (token::Client)
- ✅ Subscription creation UI with contract integration
- ✅ Subscription dashboard (list, top-up, cancel)
- ✅ Event dashboard with real-time updates
- ✅ CI/CD pipeline (GitHub Actions + Vercel)
- ✅ Mobile responsive
- ✅ Error handling and loading states across all components
- ✅ Frontend and contract tests
- ✅ 15+ meaningful commits
- ✅ Live demo on Vercel
```

- [ ] **Step 2: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add README.md
git commit -m "docs: update README with deployed addresses and live URL

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Mobile responsive styling (Slice E)

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/page.tsx` (responsive classes already applied in earlier tasks)
- Review: All components for responsive behavior

- [ ] **Step 1: Verify responsive grid classes**

The page.tsx and components already use responsive Tailwind classes:
- Sub grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (applied in SubscriptionList)
- Max-width: `max-w-5xl` on main container
- Padding: `px-4` on main

Add responsive utilities to `globals.css` if not already present — the container queries approach:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

No changes needed — the existing globals.css is already minimal and compatible.

- [ ] **Step 2: Add responsive nav (collapsible on mobile)**

In `layout.tsx`, wrap the nav items in responsive containers. The current layout already shows address on `hidden sm:inline` for the address text, which is correct. No changes needed.

- [ ] **Step 3: Verify form responsiveness**

Forms use `w-full max-w-md` which already works on mobile (full width) and desktop (centered max 448px). Dialog modals use `max-w-sm w-full mx-4` — correct.

- [ ] **Step 4: Commit (if any responsive changes needed)**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/src/app/globals.css
git commit -m "style: mobile responsive layout polish

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Frontend tests (Slice E)

**Files:**
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/__tests__/SubscribeForm.test.tsx`
- Create: `apps/web/src/__tests__/SubscriptionCard.test.tsx`
- Create: `apps/web/src/__tests__/TransactionStatus.test.tsx`
- Create: `apps/web/src/__tests__/useSubscribe.test.ts`
- Modify: `apps/web/package.json` — add vitest dev dependency

- [ ] **Step 1: Install vitest and testing library**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips/apps/web
bun add -d vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Add test script to `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create TransactionStatus.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionStatus } from "@/components/TransactionStatus";

describe("TransactionStatus", () => {
  it("renders nothing when idle", () => {
    const { container } = render(<TransactionStatus status="idle" />);
    expect(container.innerHTML).toBe("");
  });

  it("shows spinner when pending", () => {
    render(<TransactionStatus status="pending" />);
    expect(screen.getByText("Confirming transaction…")).toBeDefined();
  });

  it("shows success with explorer link", () => {
    render(<TransactionStatus status="success" txHash="abc123" />);
    expect(screen.getByText("✅ Transaction confirmed")).toBeDefined();
    expect(screen.getByText("View on Stellar.Expert →").getAttribute("href")).toContain("abc123");
  });

  it("shows error with retry button", () => {
    const onRetry = () => {};
    render(<TransactionStatus status="error" error="Something failed" onRetry={onRetry} />);
    expect(screen.getByText("⚠ Something failed")).toBeDefined();
    expect(screen.getByText("Try again")).toBeDefined();
  });

  it("shows error without retry when onRetry not provided", () => {
    render(<TransactionStatus status="error" error="Failed" />);
    expect(screen.getByText("⚠ Failed")).toBeDefined();
    expect(screen.queryByText("Try again")).toBeNull();
  });
});
```

- [ ] **Step 4: Create SubscriptionCard.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionStatus } from "@/lib/types";

const baseSub = {
  subscriber: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
  recipient: "GB4W7R5CN7H7J5T6ZNZ6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y",
  token: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
  amount: BigInt(100_000_000), // 10 XLM
  intervalSeconds: 604800,
  nextPaymentTime: Math.floor(Date.now() / 1000) + 86400,
  escrowBalance: BigInt(500_000_000), // 50 XLM
  paymentCount: 3,
  status: SubscriptionStatus.Active,
  createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
  expirationTime: Math.floor(Date.now() / 1000) + 86400 * 335,
};

describe("SubscriptionCard", () => {
  it("renders active status badge", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("shows Top Up and Cancel buttons when active", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Top Up")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("shows cancelled status badge", () => {
    const cancelled = { ...baseSub, status: SubscriptionStatus.Cancelled };
    render(<SubscriptionCard sub={cancelled} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Cancelled")).toBeDefined();
  });

  it("hides action buttons when not active", () => {
    const expired = { ...baseSub, status: SubscriptionStatus.Expired };
    render(<SubscriptionCard sub={expired} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText("Top Up")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("shows payment count", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("#3 payments")).toBeDefined();
  });
});
```

- [ ] **Step 5: Create useSubscribe.test.ts**

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { useWallet } from "@/context/WalletContext";

// Mock wallet context
vi.mock("@/context/WalletContext", () => ({
  useWallet: () => ({
    address: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
    isConnected: true,
  }),
}));

// Mock stellar-sdk
vi.mock("@stellar/stellar-sdk", () => ({
  TransactionBuilder: vi.fn(),
  Transaction: vi.fn(),
  rpc: {
    Server: vi.fn(() => ({
      getAccount: vi.fn(),
      prepareTransaction: vi.fn(),
      sendTransaction: vi.fn(),
      getTransaction: vi.fn(),
    })),
  },
}));

describe("useSubscribe", () => {
  it("returns idle status initially", () => {
    const { result } = renderHook(() => useSubscribe());
    expect(result.current.status.type).toBe("idle");
  });

  it("resets to idle", () => {
    const { result } = renderHook(() => useSubscribe());
    act(() => { result.current.reset(); });
    expect(result.current.status.type).toBe("idle");
  });
});
```

- [ ] **Step 6: Run tests and verify they pass**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips/apps/web
bun test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add apps/web/vitest.config.ts
git add apps/web/package.json
git add apps/web/src/__tests__/
git commit -m "test: frontend component and hook tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Update COMPLIANCE.md evidence (Slice E docs)

**Files:**
- Modify: `COMPLIANCE.md`

- [ ] **Step 1: Update COMPLIANCE.md Level 3 section**

Update all applicable Level 3 items:

```
| 3.1 | Advanced smart contract development | ✅ | 6 functions, 26 tests, events, token transfers |
| 3.2 | Inter-contract communication | ✅ | token::Client integration, test token deployed |
| 3.3 | Event streaming and real-time updates | ✅ | EventDashboard with useEvents hook |
| 3.4 | CI/CD pipeline setup | ✅ | `.github/workflows/ci.yml` |
| 3.5 | Smart contract deployment workflow | ✅ | `Makefile` + Stellar CLI |
| 3.6 | Mobile responsive frontend | ✅ | Tailwind responsive grid, mobile-optimized |
| 3.7 | Error handling and loading states | ✅ | ErrorBoundary, AsyncState patterns, skeleton loading |
| 3.8 | Tests for contracts and frontend | ✅ | 26 contract tests + frontend tests (Vitest) |
| 3.9 | Production-ready architecture practices | ✅ | CI/CD, env hardening, ErrorBoundary, tx polling |
| 3.10 | Documentation and demo presentation | ✅ | README, DEMO_SCRIPT.md, evidence docs |
| 3.11 | Minimum 10+ meaningful commits | ✅ | 17 commits |
| 3.12 | Live demo link on Vercel/Netlify | ✅ | `<VERCEL_URL>` |
| 3.13 | Screenshot: mobile responsive UI | 👤 | `docs/screenshots/mobile-responsive.png` |
| 3.14 | Screenshot: CI/CD pipeline running | 👤 | `docs/screenshots/ci-pipeline.png` |
| 3.15 | Screenshot: test output 3+ passing tests | 👤 | `docs/screenshots/test-output.png` |
| 3.16 | Demo video link, 1–2 minutes | ⬜ | `docs/DEMO_SCRIPT.md` |
```

Also update Level 2 items that are now complete:
```
| 2.3 | Deploy contract on testnet | ✅ | `docs/evidence/contract-address.md` |
```

Update the summary table at the bottom.

- [ ] **Step 2: Commit**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git add COMPLIANCE.md
git commit -m "chore: update COMPLIANCE.md evidence for Level 3

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Push all commits

- [ ] **Step 1: Push to main**

```bash
cd /home/anuragt/Drive-A/Project/StellarDrips
git push origin main
```

Expected: GitHub Actions CI triggers and passes.
