# Security Policy — Stellar Drips

## Scope

This document covers the security model for the Stellar Drips subscription contract and its supporting infrastructure. It applies to testnet deployments only.

---

## Threat Model

### Assumptions

- The Stellar testnet is used exclusively; no mainnet assets are at risk.
- The off-chain scheduler runs in a controlled environment (local machine or GitHub Actions).
- Users interact via browser wallets (Freighter, etc.) that handle key management.
- The Soroban runtime provides ledger security and prevents unauthorized state access.

### Trust Boundaries

```
[User Browser / Wallet] ───→ [Soroban RPC] ───→ [Subscription Contract]
                              [Horizon API]         │
                                                    │
[Off-chain Scheduler] ────→ [Soroban RPC] ──────────┘
```

- **User → RPC:** Authenticated via wallet signatures
- **Scheduler → RPC:** Authenticated via keeper keypair
- **Contract → Token:** Called via token interface (SAC)

---

## Escrow Model

```
┌──────────────┐     deposit      ┌──────────────────┐
│  Subscriber  │ ────────────────→│  Contract Escrow  │
│   (Wallet)   │                  │  (per-subscriber) │
│              │←──── refund ─────│                   │
└──────────────┘                  │                   │
                                  │  execute_payment  │
┌──────────────┐                  │       │           │
│  Recipient   │←───── payment ───│───────┘           │
└──────────────┘                  └───────────────────┘
```

### Invariant

```
contract_token_balance ≥ Σ(subscriber_escrow_balances)
```

This invariant must be enforced by all contract write methods. Test coverage must include a check that this invariant holds after every state mutation.

---

## Authorization Model

| Operation | Authorized Caller | Notes |
|-----------|-------------------|-------|
| `subscribe` | Subscriber (via auth) | Deposits initial escrow |
| `top_up` | Subscriber (via auth) | Adds to existing escrow |
| `cancel` | Subscriber (via auth) | Refunds remaining escrow to subscriber |
| `execute_payment` | Anyone (keeper) | Must pass contract-internal checks |
| `get_subscription` | Anyone | Read-only, no auth required |

### Key Rules

1. **Only the subscriber** can cancel their own subscription.
2. **Non-subscribers** cannot cancel or withdraw subscriber funds.
3. **execute_payment** is permissionless but gated by contract state:
   - Subscription must exist and be `Active`
   - Current time must be ≥ `next_payment_time`
   - Escrow balance must be ≥ payment amount
   - Subscription must not be expired

---

## Double Payment Prevention

### Mechanism

- Each subscription has a `payment_count` field, incremented atomically on each successful `execute_payment`.
- Each subscription has a `next_payment_time` field, set to `current_time + interval_seconds` after each payment.
- A second `execute_payment` call for the same due period will fail because `next_payment_time > current_time`.
- Both fields are updated in the same contract call (atomic).
- The scheduler uses idempotent execution — calling `execute_payment` twice for the same subscription in the same period is safe (the second call reverts).

### Test Coverage

- Test: `execute_payment` succeeds when due
- Test: `execute_payment` fails when called again immediately (not due)
- Test: Double payment attempt for same period fails
- Test: Property-based test that no two sequential `execute_payment` calls both succeed within one interval

---

## TTL and Expiration

### Soroban Context

Soroban ledger entries have a Time-to-Live (TTL) measured in ledgers. Active subscriptions must have their TTL extended periodically to avoid state eviction.

### Approach

1. On every contract write (`subscribe`, `top_up`, `execute_payment`, `cancel`), extend the TTL for the subscription's storage entry.
2. On `execute_payment`, if the current time exceeds `expiration_time`, set status to `Expired` and reject further payments.
3. Expired subscriptions remain readable but cannot execute payments.

### Important

- **Expiration is time-based**, enforced via ledger timestamp comparison.
- **TTL is blockchain-time-based** (ledger count), not wall-clock time.
- These are separate concerns: TTL prevents state eviction; expiration stops payments after a deadline.

---

## Scheduler Safety

### Design

- **Idempotent:** Calling `execute_payment` multiple times for the same subscription in the same period is safe — only the first succeeds.
- **Concurrency control:** GitHub Actions uses `concurrency: group: scheduler` to prevent overlapping runs.
- **Dry-run mode:** Default mode logs what would happen without sending transactions.
- **Error handling:** Failed payments are logged but do not prevent other payments from executing.

### Secrets

- `KEEPER_SECRET_KEY` is the secret key for a dedicated testnet account.
- It must never be exposed in frontend code or NEXT_PUBLIC variables.
- It must never be committed to the repository.
- It is provided to the scheduler via environment variables (GitHub Actions secrets or local `.env`).

---

## Secret Handling

### Rules

1. **Never** commit `.env` files, private keys, or `.soroban/identity` secrets.
2. **Never** paste private keys into chat, logs, or issue comments.
3. Use `.env.example` as a template — never include real secrets.
4. Use GitHub Actions secrets for CI/CD secrets.
5. Rotate any accidentally exposed secret immediately.

### If a secret is exposed

1. Regenerate the affected keypair.
2. Update Friendbot-funded accounts.
3. Update GitHub secrets.
4. Update `.env.local` on developer machines.
5. If committed, squash and force-push (or remove from git history).

---

## Contact

For security concerns, open an issue in the repository.
