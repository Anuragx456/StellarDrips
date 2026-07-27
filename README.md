# Stellar Drips

> Recurring payments and subscriptions on the **Stellar network** — powered by **Soroban smart contracts**.

**Stellar Drips** is a hackathon-winning decentralized application that enables users to create, manage, and automate recurring payments on the Stellar blockchain. It demonstrates wallet integration, Soroban contract deployment, event-driven architecture, off-chain scheduling, and production-ready CI/CD — covering all three hackathon levels.

---

## Problem

The Stellar ecosystem lacks a native recurring-payment primitive. Existing solutions require centralized infrastructure or manual intervention. Stellar Drips solves this by combining a Soroban escrow contract with an off-chain keeper/scheduler to deliver trustless subscription payments.

---

## Architecture Overview

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

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **On-chain timer** | None (Soroban constraint) | Time is tracked via ledger timestamps; execution is triggered by an off-chain scheduler |
| **Token standard** | Stellar Asset Contract (SAC) | Inter-operable with native XLM and custom tokens via the token interface |
| **Escrow model** | Pre-funded subscriber escrow | Prevents unauthorized draining; contract only disburses pre-deposited funds |
| **Payment security** | `payment_count` + `next_payment_time` | Double-execution prevention via atomic state updates |
| **Scheduler** | Node.js + GitHub Actions | Idempotent, concurrency-controlled off-chain execution |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Rust, Soroban SDK, Stellar CLI |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **State / Data** | React Query, Zod, React Hook Form |
| **Wallet** | Freighter (primary), Stellar Wallets Kit (multi-wallet Level 2) |
| **Libraries** | @stellar/stellar-sdk, @creit.tech/stellar-wallets-kit |
| **Scheduler** | Node.js (local), GitHub Actions cron (CI) |
| **CI/CD** | GitHub Actions, Vercel |
| **Testing** | cargo test (contract), Vitest / Testing Library (frontend) |

---

## Prerequisites

- **Rust** 1.79+ (`rustup install stable`)
- **Stellar CLI** (`cargo install stellar-cli`)
- **Bun** 1.x (`curl -fsSL https://bun.sh/install | bash` or `npm i -g bun`)
- **Node.js** 22+
- **Freighter Wallet** browser extension ([install](https://freighter.app))
- **Stellar Testnet funds** via [Friendbot](https://friendbot.stellar.org)

---

## Local Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd stellar-drips
make install
```

### 2. Environment

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with any overrides
```

### 3. Fund a testnet wallet

Open Freighter → Settings → Network → Testnet.
Use Friendbot to fund your public key:
```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

### 4. Build and test the contract

```bash
make contract-build
make contract-test
```

### 5. Deploy the contract (testnet)

```bash
# Create a testnet identity
stellar keys generate testnet-keeper --network testnet

# Fund the identity via Friendbot
curl "https://friendbot.stellar.org?addr=$(stellar keys address testnet-keeper)"

# Deploy
make contract-deploy-testnet
# Copy the contract ID to .env.local as NEXT_PUBLIC_CONTRACT_ID
```

### 6. Run the frontend

```bash
make web-dev
# Open http://localhost:3000
```

### 7. Run the scheduler (local)

```bash
make scheduler-dry-run
# For live execution (requires KEEPER_SECRET_KEY in .env):
# SCHEDULER_DRY_RUN=false make scheduler-run
```

---

## Wallet Setup

1. Install [Freighter Wallet](https://freighter.app) browser extension
2. Create or import a wallet
3. Switch network to **Testnet** (Settings → Network)
4. Fund your wallet via [Friendbot](https://friendbot.stellar.org)

---

## Contract Deployment

```bash
# Build optimized wasm
cd contracts/subscription
cargo build --target wasm32v1-none --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_drips_subscription.wasm \
  --source testnet-keeper \
  --network testnet

# Verify deployment
stellar contract id --network testnet
```

---

## Project Structure

```
stellar-drips/
├── apps/
│   └── web/              # Next.js frontend
├── contracts/
│   └── subscription/     # Soroban smart contract
├── scripts/
│   ├── scheduler.ts      # Off-chain payment executor
│   └── package.json
├── docs/
│   ├── evidence/         # Level 1/2/3 checklists & proofs
│   ├── screenshots/      # Required screenshots
│   └── DEMO_SCRIPT.md    # Demo walkthrough
├── .github/
│   └── workflows/
│       ├── ci.yml        # Continuous integration
│       ├── deploy.yml    # Vercel deployment
│       └── scheduler.yml # Scheduled payment execution
├── Makefile
├── COMPLIANCE.md
├── SECURITY.md
└── README.md
```

---

## Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make contract-build` | Build contract wasm |
| `make contract-test` | Run contract tests |
| `make web-dev` | Start frontend dev server |
| `make web-build` | Build frontend |
| `make scheduler-dry-run` | Run scheduler in dry mode |
| `make ci` | Full CI pipeline (lint + test + build) |

---

## Testing

```bash
# Contract tests
make contract-test

# Frontend tests
cd apps/web && bun test

# Full CI pipeline
make ci
```

---

## CI/CD

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | push/PR to main | Lint, typecheck, test, build contract + frontend |
| `deploy.yml` | manual dispatch | Deploy frontend to Vercel (preview or production) |
| `scheduler.yml` | cron + manual | Execute due payments on schedule |

---

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| Subscription | Testnet | `CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC` |
| Test Token | Testnet | `CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO` |

See [docs/evidence/contract-address.md](docs/evidence/contract-address.md) for full details.

---

## Demo

- **Live demo:** Pending GitHub + Vercel deployment
- **Demo video:** [____________](____________)
- **Demo script:** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

---

## Screenshots

| Category | Screenshot |
|----------|-----------|
| Wallet Connected | *See docs/screenshots/* |
| Balance Displayed | *See docs/screenshots/* |
| Successful Transaction | *See docs/screenshots/* |

---

## Security

See [SECURITY.md](SECURITY.md) for the full threat model, including:

- Escrow accounting invariant
- Double-payment prevention
- Authorization model
- Scheduler safety
- Secret handling

---

## Compliance

See [COMPLIANCE.md](COMPLIANCE.md) for the hackathon level checklists.

---

## License

MIT

---

*Built with ❤️ for the Stellar / Soroban ecosystem.*
