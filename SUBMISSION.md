# Stellar Drips — Hackathon Submission

> **Recurring payments and subscriptions on the Stellar network**
>
> Built for the Stellar / Soroban hackathon — covering all three levels: wallet integration,
> Soroban smart contracts, events, off-chain scheduling, CI/CD, and production deployment.

---

## Project Overview

**Stellar Drips** is a decentralized recurring-payment dApp that allows users to:

- Connect their **Freighter wallet** (and multi-wallet via Stellar Wallets Kit)
- View **XLM balance** from the Stellar testnet via Horizon API
- Send **one-time XLM payments**
- Create **subscriptions** via a Soroban smart contract with escrow accounting
- **Top up** subscription escrow balances
- **Cancel** subscriptions and refund escrowed funds
- Watch **real-time event feeds** of subscription activity
- Execute due payments via an **off-chain keeper scheduler** (local Node.js or GitHub Actions cron)

The contract monitors `next_payment_time` vs. ledger time to determine when a payment is due, and an off-chain scheduler triggers `execute_payment` calls. Double-execution is prevented by atomic state updates on `payment_count`.

---

## Levels & Deliverables

| Level | Focus | Status |
|-------|-------|--------|
| **Level 1** | Wallet, Balance, Testnet Transaction | 12/15 ✅ — 3 screenshots 👤 |
| **Level 2** | Multi-wallet, Contract, Events | 7/9 ✅ — 1 screenshot 👤, 1 tx hash ⬜ |
| **Level 3** | Advanced dApp, Scheduler, CI/CD, Tests | 12/16 ✅ — 3 screenshots 👤, 2 deployment ⬜ |

> 👤 = User action required (screenshot capture / video / Vercel setup)
> ⬜ = Not started

See [COMPLIANCE.md](./COMPLIANCE.md) for the full per-item checklist.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Rust, Soroban SDK 22.x, `soroban-sdk` |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Wallet** | Freighter (Stellar Wallets Kit) |
| **Blockchain** | Stellar Testnet (Soroban RPC, Horizon API) |
| **Scheduler** | Node.js / TypeScript (local), GitHub Actions cron (CI) |
| **CI/CD** | GitHub Actions (lint, typecheck, test, build) |
| **Deployment** | Vercel (pending setup) |
| **Testing** | `cargo test` (contract), Vitest + Testing Library (frontend) |

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Frontend (Next.js)│     │  Off-Chain Scheduler  │
│   Wallet Connect    │     │  (Node.js / GH Actions)│
│   Subscription UI   │     │  Calls execute_payment │
│   Event Dashboard   │     └──────────┬─────────────┘
└─────────┬───────────┘                │
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────┐
│         Stellar Testnet (Soroban RPC)        │
│  ┌─────────────────────────────────────────┐ │
│  │   Subscription Contract (Soroban)       │ │
│  │   - Escrow accounting                   │ │
│  │   - Time-based execution rules          │ │
│  │   - Event emission                      │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │   Stellar Asset Contract (XLM / Token)  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Project Structure

```
stellar-drips/
├── apps/web/              # Next.js frontend
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # UI components
│       ├── hooks/         # Contract interaction hooks
│       ├── lib/           # Contract client library
│       └── __tests__/     # Frontend tests
├── contracts/subscription/ # Soroban smart contract
│   ├── src/lib.rs         # Contract implementation
│   └── src/test.rs        # 26 contract tests
├── scripts/               # Off-chain scheduler
├── docs/                  # Documentation & evidence
├── .github/workflows/     # CI/CD pipeline
└── Makefile               # Build orchestration
```

---

## Smart Contract

### Functions

| Function | Description |
|----------|-------------|
| `subscribe` | Create a new subscription with initial escrow deposit |
| `get_subscription` | Read subscription state by subscriber + id |
| `get_subscriptions_count` | Get subscription count for a subscriber |
| `top_up` | Add funds to an existing subscription escrow |
| `execute_payment` | Process one due payment (called by scheduler) |
| `cancel` | Cancel subscription, refund remaining escrow |

### Key Security Properties

- **Escrow invariant**: `total_deposited - total_withdrawn ≤ escrow_balance`
- **Double-payment prevention**: `payment_count` and `next_payment_time` are atomically updated
- **Authorization**: Only the subscriber can top-up or cancel their subscription
- **TTL management**: Contract extends its own rent on each `execute_payment` call
- **Inter-contract calls**: Uses Stellar Asset Contract (SAC) token interface for XLM transfers

### Contract Tests

26 tests covering:
- Subscription creation and validation
- Escrow top-up
- Payment execution with time checks
- Subscription cancellation with refund
- Double-execution prevention
- Event emission verification
- Error cases (not found, already active, insufficient balance, etc.)

**Test output:** `make contract-test` → `cargo test` — all 26 passing.

---

## Frontend

### Components

| Component | Description |
|-----------|-------------|
| `ConnectWallet` | Wallet connect/disconnect via Stellar Wallets Kit |
| `PaymentForm` | One-time XLM payment with send feedback |
| `SubscribeForm` | Create subscription with contract integration |
| `SubscriptionList` | Dashboard of user subscriptions (loading/empty/error/active) |
| `SubscriptionCard` | Individual subscription with balance, status, actions |
| `TopUpDialog` | Modal to add funds to subscription escrow |
| `CancelDialog` | Modal to cancel subscription with refund |
| `EventDashboard` | Real-time event feed with 10s polling |
| `TransactionStatus` | Transaction progress, hash, explorer link |
| `ErrorBoundary` | React error boundary wrapping the app |

### States Covered

Every component handles these states:
- **Loading**: Skeleton/spinner while data is fetched
- **Empty**: Informational message when no data exists
- **Error**: User-friendly error messages with recovery actions
- **Success**: Confirmation with relevant details
- **Pending**: Transaction submission progress

### Frontend Tests

3 test files (12 tests):
- `TransactionStatus.test.tsx` — renders success, pending, error states
- `SubscriptionCard.test.tsx` — renders subscription info, balance, action buttons
- `useSubscribe.test.ts` — hook test coverage for subscribe flow

---

## Off-Chain Scheduler

The off-chain keeper (`scripts/scheduler.ts`) is a Node.js script that:

1. Reads subscription contract state on-chain
2. Identifies subscriptions where `next_payment_time ≤ ledger_time`
3. Calls `execute_payment` on the contract for each due subscription
4. Reports results (success / insufficient balance / not yet due / error)

**Execution modes:**
- `make scheduler-dry-run` — Read-only: shows due subscriptions without executing
- `make scheduler-run` — Live execution (requires `KEEPER_SECRET_KEY` in `.env.local`)

**GitHub Actions cron:** The `.github/workflows/scheduler.yml` runs every 15 minutes on the `main` branch if configured with the appropriate secrets.

---

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| **Subscription** | Stellar Testnet | `CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC` |
| **Test Token** | Stellar Testnet | `CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO` |

---

## CI/CD

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| **CI** | `.github/workflows/ci.yml` | Push/PR to `main` | Lint → Typecheck → Test → Build |
| **Deploy** | `.github/workflows/deploy.yml` | Manual dispatch | Deploy to Vercel (preview/production) |
| **Scheduler** | `.github/workflows/scheduler.yml` | Cron (every 15min) + manual | Execute due subscription payments |

The CI workflow runs:
1. `bun install` — dependency installation
2. `bun run lint` — ESLint
3. `bun run typecheck` — TypeScript type checking
4. `bun run test` — Vitest frontend tests
5. `make contract-build` — Rust contract wasm compilation
6. `make contract-test` — Cargo contract tests

---

## Screenshots

> 📸 **Screenshots are not yet captured.** Capture each and save to `docs/screenshots/`.

| # | Screenshot | File | Status |
|---|------------|------|--------|
| 1 | Wallet connected (Freighter showing address) | `docs/screenshots/wallet-connected.png` | ⬜ |
| 2 | XLM balance displayed in UI | `docs/screenshots/balance-displayed.png` | ⬜ |
| 3 | Successful testnet XLM transaction | `docs/screenshots/successful-transaction.png` | ⬜ |
| 4 | Multi-wallet options | `docs/screenshots/wallet-options.png` | ⬜ |
| 5 | Mobile responsive UI (375px viewport) | `docs/screenshots/mobile-responsive.png` | ⬜ |
| 6 | CI/CD pipeline (GitHub Actions all green) | `docs/screenshots/ci-pipeline.png` | ⬜ |
| 7 | Test output (3+ passing tests) | `docs/screenshots/test-output.png` | ⬜ |

**Quick-capture script** (run after `make web-dev` and opening `http://localhost:3000`):

```bash
# Prerequisites for screenshot 1-4:
# - Freighter installed and connected on testnet
# - Wallet funded with testnet XLM (friendbot)

# For screenshot 5 (mobile): Open DevTools → Toggle Device Toolbar → 375px width

# For screenshot 6: Go to https://github.com/Anuragx456/StellarDrips/actions

# For screenshot 7:
make contract-test > docs/screenshots/test-output.txt 2>&1
```

---

## Demo Video

> 🎥 **Demo video is not yet recorded.**

Cover these steps (1-2 minutes):
1. Connect Freighter wallet → show address + testnet indicator
2. View XLM balance on dashboard
3. Create a subscription (fill recipient, amount, interval → approve)
4. Run scheduler dry-run → show pending payments
5. View event dashboard → show subscription and payment events
6. Wrap up with architecture summary

See [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) for the full script.

---

## Setup Instructions

### For running the app locally:

```bash
# 1. Prerequisites: Rust, Stellar CLI, Bun, Freighter wallet

# 2. Install dependencies
make install

# 3. Environment config
cp .env.example apps/web/.env.local
# Set NEXT_PUBLIC_CONTRACT_ID if re-deploying

# 4. Start dev server
make web-dev

# 5. Open http://localhost:3000 → Connect Freighter wallet
```

### For Vercel deployment:

1. Install Vercel CLI: `bun add -g vercel`
2. Run `vercel login` to authenticate
3. Run `vercel link` in `apps/web/` to link the project
4. Add the following secrets to GitHub repository:
   - `VERCEL_TOKEN` — Create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` — From `.vercel/project.json` (`team_EqzbAXXDYsuhftkJF91bLMyC`)
   - `VERCEL_PROJECT_ID` — From `.vercel/project.json` (`prj_I3yBA1mV1fomvHsfjnvKFmdDURbW`)
5. Trigger the deploy workflow: GitHub → Actions → Deploy Frontend → Run workflow

---

## Repository

- **GitHub:** https://github.com/Anuragx456/StellarDrips
- **Default branch:** `main`

### Recent commits (12 ahead of remote):

```
e935cf6 Merge branch 'worktree-level3-mini-dapp'
88ca522 fix: deploy workflow working-directory, Makefile wasm path, vercel.json
2638fbb deploy: contract to testnet, test token, Vercel infra
f6dca2d test: frontend component and hook tests
45050de docs: update README, COMPLIANCE.md with Level 3 evidence
7952beb feat: event dashboard, page.tsx integration, ErrorBoundary
553b014 feat: subscription dashboard with list/top-up/cancel
68265a7 feat: SubscribeForm with contract integration
84aeaa7 feat: contract lib layer with ScVal helpers and types
f0f73ce deploy: contract to testnet, test token, evidence docs
...
```

---

## Summary

| Category | Count |
|----------|-------|
| Smart contract functions | 6 |
| Contract tests | 26 |
| Frontend components | 10 |
| Frontend tests (3 files) | 12 |
| GitHub Actions workflows | 3 |
| Total commits | 15+ |
| Screenshots needed | 7 |
| Demo video needed | 1 (1-2 min) |
| Vercel deployment | Pending |

---

## Quick Links

- [README.md](./README.md) — Full project documentation
- [COMPLIANCE.md](./COMPLIANCE.md) — Hackathon requirements checklist
- [SECURITY.md](./SECURITY.md) — Threat model and security properties
- [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) — Demo walkthrough script
- [docs/screenshots/checklist.md](./docs/screenshots/checklist.md) — Screenshot instructions
- [PLAN.md](./PLAN.md) — Implementation plan and status

---

*Built with ❤️ for the Stellar / Soroban ecosystem*
