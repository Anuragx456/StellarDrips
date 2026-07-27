# Level 3 — Complete Mini dApp: Frontend & Infrastructure

## Overview

Upgrade Stellar Drips from a contract-only MVP to a complete Level 3 hackathon submission. This covers contract deployment to testnet, a full subscription management UI, event dashboard, mobile responsive styling, frontend tests, and CI/CD to Vercel — delivered in 5 vertical slices.

## Architecture

```
src/
├── app/
│   ├── layout.tsx          ← Nav with connect-wallet button
│   └── page.tsx            ← Dashboard combining all panels
├── components/
│   ├── ConnectWallet.tsx   ← Existing (Freighter + Stellar Wallets Kit)
│   ├── PaymentForm.tsx     ← Existing (one-time XLM)
│   ├── SubscribeForm.tsx   ★ Create subscription
│   ├── SubscriptionList.tsx ★ List & manage subs
│   ├── SubscriptionCard.tsx ★ Single sub card
│   ├── TopUpDialog.tsx     ★ Modal: add escrow funds
│   ├── CancelDialog.tsx    ★ Modal: cancel & refund
│   ├── EventDashboard.tsx  ★ Event timeline
│   ├── TransactionStatus.tsx ★ Reusable tx feedback
│   └── ErrorBoundary.tsx   ★ Catch render errors
├── hooks/
│   ├── useBalance.ts       ← Existing
│   ├── usePayment.ts       ← Existing
│   ├── useSubscribe.ts     ★ create subscription
│   ├── useSubscription.ts  ★ read subscription(s) by simulation
│   ├── useTopUp.ts         ★ top_up mutation
│   ├── useCancel.ts        ★ cancel mutation
│   └── useEvents.ts        ★ fetch contract events
├── lib/
│   ├── contract.ts         ★ Contract client singleton
│   ├── scval.ts            ★ ScVal encode/decode helpers
│   └── types.ts            ★ Shared TS types
└── context/
    └── WalletContext.tsx    ← Extended with RPC server + network info
```

## Data Flow

1. **WalletContext** provides: connected address, `rpc.Server` instance, network passphrase
2. **Read operations** (get_subscription, events): `simulateTransaction` — no signing required
3. **Write operations** (subscribe, top_up, cancel): `prepareTransaction` → wallet signs → `sendTransaction` → poll `getTransaction` for confirmation
4. **Every hook** returns `{ data, loading, error }` — components render all three states
5. **TransactionStatus** normalises tx feedback: pending spinner → success (explorer link) → error (message + retry)

---

## Slice A — Deploy & Infrastructure

### Contract Deployment

- Build wasm: `cd contracts/subscription && cargo build --target wasm32v1-none --release`
- Create testnet identity: `stellar keys generate testnet-keeper --network testnet`
- Fund via Friendbot: `curl "https://friendbot.stellar.org?addr=$(stellar keys address testnet-keeper)"`
- Deploy: `stellar contract deploy --wasm ... --source testnet-keeper --network testnet`
- Record deployed address in `.env.example` and `docs/evidence/contract-address.md`
- Update `COMPLIANCE.md` item 2.3 (contract deployed on testnet) and 2.8 (deployed address in README)

### Test Token (Inter-Contract Communication, 3.2)

- Deploy a Stellar Asset Contract (SAC) as a test token for demonstrating non-XLM subscriptions
- Record token address in environment docs

### Vercel Deployment

- Review `.github/workflows/deploy.yml` — should trigger on push to main or manual dispatch
- Add GitHub secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`
- Configure `NEXT_PUBLIC_*` env vars in Vercel dashboard
- Verify preview deployment works
- Update README with live demo URL (3.12)

**Deliverables**: deployed contract on testnet, test token address, verification docs, live Vercel URL

---

## Slice B — Subscribe Form + Contract Integration

### lib/contract.ts

- Singleton that initialises `rpc.Server` from `NEXT_PUBLIC_RPC_URL`
- Creates `Contract(CONTRACT_ID)` from `NEXT_PUBLIC_CONTRACT_ID`
- Methods mirror contract functions:
  - `subscribe(subscriber, recipient, token, amount, interval, expiration)` → write
  - `getSubscription(subscriber, id)` → read via `simulateTransaction`
  - `subscriptionCount(subscriber)` → read via simulation
  - `topUp(subscriber, id, amount)` → write
  - `cancel(subscriber, id, refundRecipient)` → write

### lib/scval.ts

- `stringToScVal(s)` — basic string → ScVal (for address-like strings)
- `addressToScVal(addr)` — `Address.fromString(addr).toScVal()`
- `u32ToScVal(n)` — `nativeToScVal(n, { type: "u32" })`
- `i128ToScVal(n)` — `nativeToScVal(n, { type: "i128" })` for i128 amounts
- `subscriptionFromScVal(raw)` — parse the 11-element Vec from `scValToNative`
- `eventFromScVal(event)` — parse event topics/data into typed event object

### lib/types.ts

```typescript
enum SubscriptionStatus { Active = 0, Cancelled = 1, Expired = 2 }

interface Subscription {
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

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface SubscriptionEvent {
  type: 'sub_crt' | 'sub_top_up' | 'pay_exec' | 'sub_cnc' | 'sub_exp';
  subscriber: string;
  id: number;
  value: any;
  timestamp: number;
  txHash: string;
}
```

### hooks/useSubscribe.ts

- Input: `SubscribeInput { recipient, token?, amount, intervalSeconds, expirationTime }`
- Gets subscriber from WalletContext
- Calls `NEXT_PUBLIC_CONTRACT_ID` subscribe via `prepareTransaction` → wallet signs → `sendTransaction` → poll
- Returns `{ execute, txResult, loading, error, reset }`
- On success: returns subscription id (from `subscription_count`) and tx hash
- On error: surfaces contract error code in human-readable form

### components/TransactionStatus.tsx

Props:
```typescript
interface TxStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}
```
- `pending`: animated spinner with "Confirming transaction..."
- `success`: green checkmark, "Transaction confirmed!", explorer link
- `error`: red X, error message, retry button (calls `onRetry` prop)
- `idle`: renders nothing

### components/SubscribeForm.tsx

- Fields: `recipient` (Stellar address input), `token` (address, defaults to XLM native contract), `amount` (number input, XLM × 10^7), `interval` (dropdown: 86400=daily, 604800=weekly, 2592000=monthly), `expiration` (optional date picker or duration from now)
- Validation: all fields required except token and expiration, valid Stellar address format, amount > 0, interval ≥ 1
- Loading: button shows spinner, form fields disabled during submission
- Success: TransactionStatus shows success with explorer link, "Create Another" button, "View Dashboard" link
- Error: TransactionStatus shows error, form remains editable
- Empty: initial clean form state

**Deliverables**: working SubscribeForm that creates a subscription on testnet

---

## Slice C — Subscription Dashboard + Management

### hooks/useSubscription.ts

- `useSubscription(subscriber, id?)` — single sub if id provided, otherwise fetches by iterating `subscription_count` and calling `get_subscription` for each
- Read-only (simulation), no transaction
- Returns `AsyncState<Subscription[]>`
- Manual `refresh()` function

### hooks/useTopUp.ts

- Input: `{ subscriber, id, amount }`
- Calls `top_up` via transaction flow
- Requires wallet auth
- Returns `{ execute, txResult, loading, error }`

### hooks/useCancel.ts

- Input: `{ subscriber, id, refundRecipient }` (refund recipient defaults to subscriber)
- Calls `cancel` via transaction flow
- Requires wallet auth
- Returns `{ execute, txResult, loading, error }`

### components/SubscriptionCard.tsx

- Status badge: Active (green pill), Cancelled (grey), Expired (red)
- Info rows: recipient (truncated), amount per interval, next payment date, escrow progress bar (escrow_balance / expected X payments)
- Payment count: "N payments made"
- Actions (only when Active):
  - "Top Up" button → opens TopUpDialog
  - "Cancel" button → opens CancelDialog
- Click card → expand detail view (optional, stretch goal)

States:
- **Loading**: skeleton card with pulsing bars
- **Error**: inline "Failed to load" with retry icon
- **Empty**: not applicable per-card

### components/SubscriptionList.tsx

- Calls `useSubscription()` for connected wallet
- States:
  - **Loading**: 3 skeleton cards in a responsive grid
  - **Empty**: Illustration + "No subscriptions yet" + "Create Subscription" CTA button (links to SubscribeForm)
  - **Error**: Error message + "Try Again" button
  - **Data**: Responsive grid of SubscriptionCards (1-col mobile, 2-col tablet, 3-col desktop)
- "Create Subscription" button always visible in header

### components/TopUpDialog.tsx

- Modal overlay with backdrop click-to-close
- Shows: current escrow balance, recipient preview
- Input: amount to add
- Confirm → calls `useTopUp.execute()` → shows TransactionStatus inside dialog
- On success: refreshes subscription list, closes dialog after 2s
- On error: shows error, user can retry or close

### components/CancelDialog.tsx

- Modal confirmation with warning styling (red/orange)
- Shows: refund amount (current escrow), refund recipient (pre-filled subscriber address, editable)
- Confirm → calls `useCancel.execute()` → TransactionStatus
- On success: refreshes list, closes dialog

**Deliverables**: full subscription management — list, top up, cancel

---

## Slice D — Event Dashboard & Polish

### hooks/useEvents.ts

- Uses Soroban RPC `getEvents` to fetch contract events related to subscriptions
- Falls back to parsing stored tx hashes if `getEvents` is unavailable
- Groups events into `SubscriptionEvent[]` typed union
- Auto-poll on 10s interval (configurable)
- Returns `AsyncState<SubscriptionEvent[]>`

### components/EventDashboard.tsx

- Timeline: reverse-chronological, each row = one event
- Color-coded icons per event type:
  - `sub_crt` (created) → green plus
  - `sub_top_up` → blue arrow up
  - `pay_exec` (payment executed) → gold coin
  - `sub_cnc` (cancelled) → red X
  - `sub_exp` (expired) → grey clock
- Each event: icon, human-readable description (e.g. "Payment of 100 XLM sent to GABCD..."), relative timestamp ("2 min ago"), tx hash (clickable explorer link)
- States:
  - **Loading**: 5 skeleton event rows
  - **Empty**: "No events yet — create a subscription to get started" + CTA
  - **Error**: "Failed to load events" + retry
- Filter bar (optional): dropdown to filter by event type

### Update README

- Add deployed contract address and explorer link
- Add live demo Vercel URL
- Update evidence paths in documentation

**Deliverables**: Event dashboard with live data, README updates

---

## Slice E — Tests, Mobile, Docs

### Frontend Tests (Vitest + Testing Library)

Setup:
- `vitest.config.ts` in `apps/web/`
- Test setup file with mocked WalletContext
- Mock `@stellar/stellar-sdk` for RPC calls

Test cases per component:
- **SubscribeForm**: renders all fields, validates empty, validates address format, shows loading on submit, shows success result, shows error
- **SubscriptionCard**: renders status badges (Active/Cancelled/Expired), shows actions when Active, hides actions when not Active
- **SubscriptionList**: shows skeleton on loading, shows empty state, shows error with retry, renders cards in grid
- **TransactionStatus**: renders idle (nothing), pending (spinner), success (explorer link), error (message + retry)
- **EventDashboard**: shows loading skeleton, empty state, renders events, filters by type

### Mobile Responsive

- Tailwind breakpoints: `sm:640px` / `md:768px` / `lg:1024px`
- Dashboard layout: 1 column mobile → 2 columns tablet → 3 columns desktop
- Navigation: hamburger menu on mobile (if nav items exist)
- Forms: full-width on mobile, `max-w-md centered` on desktop
- Tables/cards: stack vertically on mobile, grid on desktop
- Test on: 375px (iPhone SE), 768px (iPad), 1024px+ (desktop)

### Error Handling + Loading States

- **ErrorBoundary** wrapping `<body>`: catches render errors, shows "Something went wrong" with stack trace toggle
- Every component handles: `loading` → skeleton/Spinner, `error` → colored alert + retry, `empty` → illustration + CTA
- Network errors in hooks: catch and surface as user-friendly messages ("Unable to reach Stellar network. Check your connection.")
- Contract errors: map error codes to human-readable messages ("Subscription not found", "Payment not due yet", "Insufficient escrow balance")

### Documentation & Compliance

- Create `docs/evidence/contract-address.md` with deployed address, explorer link, deploy date
- Update `COMPLIANCE.md`:
  - Mark 3.1 ✅ (advanced contract: 6 functions, 26 tests, events, token transfers)
  - Mark 3.2 ✅ (inter-contract via token::Client, test token deployed)
  - Mark 3.3 ✅ (event dashboard with live data)
  - Mark 3.6 ✅ (mobile responsive layout)
  - Mark 3.7 ✅ (error/loading/empty states across all components)
  - Mark 3.8 ✅ (26 contract tests + frontend tests)
  - Mark 3.9 ✅ (production practices: CI/CD, env hardening, error boundaries)
  - Mark 3.10 ✅ (README, demo script, evidence docs)
  - Mark 3.11 ✅ (10+ commits — hit naturally across slices)
  - Mark 3.12 ✅ (Vercel deployment)
- Note 👤 items (screenshots, demo video) as user action

**Deliverables**: Test suite, mobile layout, comprehensive error states, updated compliance tracker

---

## Commit Strategy

| Order | Commit | Slice |
|-------|--------|-------|
| 1 | `deploy: contract to testnet, test token, Vercel infra` | A |
| 2 | `feat: contract lib layer with ScVal helpers and types` | B |
| 3 | `feat: SubscribeForm with contract integration` | B |
| 4 | `feat: subscription dashboard with list/top-up/cancel` | C |
| 5 | `feat: event dashboard with real-time timeline` | D |
| 6 | `docs: update README with deployed addresses and live URL` | D |
| 7 | `test: frontend component and hook tests` | E |
| 8 | `style: mobile responsive layout and error states` | E |
| 9 | `chore: update COMPLIANCE.md evidence for Level 3` | E |

9 additional commits on top of 8 existing = 17 total (meets 3.11's 10+ requirement).

## Status Key

- ✅ Done | ⬜ Not Started | 🔧 In Progress | 👤 User Action Required
