# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three overlapping audiences, all confirmed:

- **Crypto end-users** — Stellar ecosystem participants who want to set up recurring payments (subscriptions, tips, recurring transfers) without manual intervention each period.
- **Stellar/Soroban developers** — Builders looking for a reference implementation of a Soroban subscription contract with wallet integration, event handling, and off-chain scheduling.
- **Hackathon evaluators** — Judges assessing technical completeness across three levels (wallet/basic tx, contract/events, scheduler/CI-CD/tests).

## Product Purpose

Stellar Drips provides the first native recurring-payment primitive on the Stellar network. It enables anyone with a Stellar wallet to create automated subscription payments using Soroban smart contracts — no centralized infrastructure required. Success means a user can connect their wallet, fund a subscription escrow, and have payments execute automatically on schedule without further intervention.

## Positioning

The Stellar ecosystem lacks a native recurring-payment primitive. Existing approaches require manual transfers or centralized intermediaries. Stellar Drips is different: a Soroban escrow contract holds subscriber funds and disburses them on a schedule via an off-chain keeper, with double-execution prevention, subscriber-only cancellation, and full event transparency. It is the first open-source, end-to-end recurring-payment dApp built on Soroban — equally a product you can use and a reference you can learn from.

## Operating Context

- Users access the dApp via a web browser (desktop and mobile) with a Stellar wallet extension installed (Freighter, xBull, Albedo, Rabet, Lobstr, Hana, Klever) or WalletConnect-compatible mobile wallet.
- The app connects to Stellar Testnet via Soroban RPC. There is no mainnet deployment yet.
- An off-chain scheduler (Node.js, run via GitHub Actions cron or local CLI) periodically calls `execute_payment` on the contract for any due subscriptions.
- Transactions require wallet signing — the app never holds private keys.
- Users obtain testnet XLM via Friendbot for testing.
- Contract events are emitted on-chain and polled by the frontend (10-second interval).

## Capabilities and Constraints

### Confirmed capabilities

- **Wallet**: Multi-wallet connect/disconnect via Stellar Wallets Kit (8 modules + WalletConnect). Network detection (testnet enforcement). Balance display via Horizon API.
- **Subscriptions**: Create (subscribe), top up escrow, cancel with refund. Configurable amount, interval (daily/weekly/monthly), initial escrow, and expiration.
- **Payments**: One-time XLM transfer. Off-chain scheduler executes due payments automatically.
- **Events**: Real-time event dashboard with 6 event types (creation, cancellation, expiration, top-up, payment success, payment failure). Explorer links for every transaction.
- **Contract**: Soroban smart contract deployed on Testnet. Escrow accounting, time-based execution, payment_count + next_payment_time anti-double-execution. Token support via Stellar Asset Contract (XLM native + custom tokens).
- **Scheduler**: Node.js runner with dry-run mode. GitHub Actions cron workflow (every 30 minutes). Idempotent, concurrency-controlled.
- **CI/CD**: GitHub Actions CI (lint, typecheck, test, build). Vercel deploy workflow. 26 contract tests + 12 frontend tests.
- **Security**: SECURITY.md with full threat model. COMPLIANCE.md for all three levels.
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS. Responsive (mobile/desktop). Loading, empty, error states on all data views. ErrorBoundary at app level.

### Confirmed constraints

- **No on-chain timer**: Soroban has no native timer; time-based execution requires an off-chain scheduler.
- **Testnet only**: No mainnet deployment; no production token support.
- **Escrow model**: Subscribers must pre-fund escrow; the contract cannot initiate pulls.
- **Wallet dependency**: Requires a browser wallet extension or WalletConnect-compatible wallet.
- **Scheduler liveness**: Payment execution depends on the scheduler running (local or GitHub Actions); no on-chain fallback.

### Explicitly undecided

- Mainnet deployment timeline and token support beyond XLM.
- Pricing, fee model, or monetization.
- Formal auditing of the smart contract.
- Team/DAO governance model.

## Brand Commitments

- **Name**: Stellar Drips (capitalized as shown).
- **Tone**: Functional, neutral, developer-friendly. No aspirational brand personality beyond the name.
- **Voice**: Clear, technical, direct — describes what the product does and how it works without marketing flourish.
- **Visual**: No binding visual commitments. Current implementation uses utility-first Tailwind with a blue-on-zinc color scheme and dark mode support. This is incidental, not a brand directive.
- **Assets**: No logo, icons, or brand assets have been created. Absence is noted.

## Evidence on Hand

- **Deployed contract**: Subscription contract `CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC` on Stellar Testnet. Test token `CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO`. See `docs/evidence/contract-address.md`.
- **Security model**: `SECURITY.md` — threat model, escrow invariant, double-payment prevention, authorization, scheduler safety, secret handling.
- **Compliance**: `COMPLIANCE.md` — level-by-level checklist with evidence links.
- **Tests**: 26 contract tests (cargo test), 12 frontend tests (Vitest/Testing Library). CI pipeline validated passing.
- **CI/CD**: `.github/workflows/ci.yml` (push/PR), `deploy.yml` (manual Vercel deploy), `scheduler.yml` (cron every 30 min).
- **Demo**: `docs/DEMO_SCRIPT.md` walkthrough. Screenshots pending user capture under `docs/screenshots/`.
- **No fabricated evidence**: No testimonials, case studies, benchmarks, pricing, licensing, or deployment claims exist. Future work must not fabricate these.

## Product Principles

1. **Trustless by design** — The escrow model ensures the contract can only disburse what the subscriber deposited. Subscriber authorization is enforced at every write path; the off-chain scheduler never controls funds.
2. **Developer-first clarity** — The codebase, README, and UI communicate blockchain state transparently. We name what exists and call out what is absent; we never paper over complexity with abstraction.
3. **Composable foundation** — The contract is a primitive others can build on. Keep the interface clean, the events structured, and the documentation honest about what the scheduler does and does not guarantee.
4. **Production discipline from day one** — CI/CD, tests, error handling, security documentation, and responsive UI are first-class deliverables alongside features, not afterthoughts.
5. **Ecosystem inclusivity** — Multi-wallet support, a clear demo script, and accessible documentation lower the barrier for any Stellar user. The reference implementation should teach, not just run.

## Accessibility & Inclusion

No product-specific accessibility requirements have been established. The frontend uses semantic HTML, focusable form controls, prefers reduced motion respects `prefers-reduced-motion` (via Tailwind), and supports OS-level dark mode. Future work should evaluate WCAG 2.1 AA conformance formally. The mobile-responsive layout is confirmed.
