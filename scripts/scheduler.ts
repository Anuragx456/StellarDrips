/**
 * Stellar Drips — Off-chain Payment Scheduler
 *
 * Fetches active subscriptions and executes due payments
 * by calling the Soroban subscription contract.
 *
 * Designed to run either locally (node-cron) or as a
 * GitHub Actions scheduled workflow.
 *
 * SAFETY:
 * - Dry-run mode by default (SCHEDULER_DRY_RUN=true)
 * - Contract state prevents double execution via
 *   `payment_count` and `next_payment_time` checks.
 */

import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

const DRY_RUN = process.env.SCHEDULER_DRY_RUN !== "false";
const RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.CONTRACT_ID || "";
const KEEPER_SECRET = process.env.KEEPER_SECRET_KEY || "";

async function main() {
  console.log(`[Scheduler] Starting ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}`);
  console.log(`[Scheduler] RPC: ${RPC_URL}`);
  console.log(`[Scheduler] Contract: ${CONTRACT_ID || "(not set)"}`);

  if (!CONTRACT_ID) {
    console.log("[Scheduler] No contract ID configured — skipping");
    return;
  }

  if (!KEEPER_SECRET && !DRY_RUN) {
    console.error("[Scheduler] KEEPER_SECRET_KEY required for live run");
    process.exit(1);
  }

  // TODO: Implement actual scheduler logic in Phase 3
  // 1. Query contract for active subscriptions (keeper view)
  // 2. For each subscription where next_payment_time <= now:
  //    - Build and submit execute_payment transaction
  //    - Handle failures and log results
  // 3. Report summary

  console.log("[Scheduler] Skeleton — no actual execution yet");

  if (DRY_RUN) {
    console.log("[Scheduler] Dry run complete — no transactions sent");
  } else {
    console.log("[Scheduler] Live run complete");
  }
}

main().catch((err) => {
  console.error("[Scheduler] Fatal error:", err);
  process.exit(1);
});
