/**
 * Stellar Drips — Off-chain Payment Scheduler (Keeper)
 *
 * Periodically checks a registry of known subscriptions and calls
 * `execute_payment` on the Soroban contract for any that are due.
 *
 * Subscription registry is maintained as a simple JSON file. In
 * production this would be populated by a webhook listening to
 * contract events (sub_crt / sub_cnc / sub_exp).
 *
 * SAFETY:
 * - Dry-run mode by default (SCHEDULER_DRY_RUN=true).
 * - The Soroban contract guards against double execution via
 *   `payment_count` and `next_payment_time`.
 * - The keeper never holds user funds — it only triggers transfers
 *   that the contract escrow already guarantees.
 */

import {
  Address,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
  rpc,
} from "@stellar/stellar-sdk";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IS_DRY_RUN = process.env.SCHEDULER_DRY_RUN !== "false";
const INTERVAL_SECONDS = Number(process.env.SCHEDULER_INTERVAL_SECONDS) || 60;
const RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const CONTRACT_ID = process.env.CONTRACT_ID || "";
const KEEPER_SECRET = process.env.KEEPER_SECRET_KEY || "";
const REGISTRY_PATH =
  process.env.SUBSCRIPTIONS_REGISTRY ||
  join(dirname(fileURLToPath(import.meta.url)), "subscriptions.json");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subscription {
  subscriber: string;
  recipient: string;
  token: string;
  amount: bigint;
  interval_seconds: number;
  next_payment_time: number;
  escrow_balance: bigint;
  payment_count: number;
  status: number; // 0=Active, 1=Cancelled, 2=Expired
  created_at: number;
  expiration_time: number;
}

interface RegistryEntry {
  subscriber: string;
  id: number;
  label?: string;
}

type Registry = RegistryEntry[];

interface SchedulerStats {
  checked: number;
  executed: number;
  skipped_due: number;
  skipped_expired: number;
  skipped_inactive: number;
  errors: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = dirname(fileURLToPath(import.meta.url));

function log(level: "INFO" | "OK" | "WARN" | "ERROR" | "DRY", msg: string) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}][${level}]`;
  switch (level) {
    case "ERROR":
      return console.error(`${prefix} ${msg}`);
    case "WARN":
      return console.warn(`${prefix} ${msg}`);
    default:
      return console.log(`${prefix} ${msg}`);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Registry persistence
// ---------------------------------------------------------------------------

function loadRegistry(): Registry {
  if (!existsSync(REGISTRY_PATH)) {
    log("INFO", `Registry not found at ${REGISTRY_PATH} — starting empty`);
    return [];
  }
  try {
    const raw = readFileSync(REGISTRY_PATH, "utf-8");
    const entries: Registry = JSON.parse(raw);
    log("INFO", `Loaded ${entries.length} entries from registry`);
    return entries;
  } catch (err) {
    log("ERROR", `Failed to load registry: ${err}`);
    return [];
  }
}

function saveRegistry(entries: Registry): void {
  try {
    writeFileSync(REGISTRY_PATH, JSON.stringify(entries, null, 2), "utf-8");
  } catch (err) {
    log("ERROR", `Failed to save registry: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Soroban contract interaction
// ---------------------------------------------------------------------------

/**
 * Build and simulate a Soroban contract call, returning the ScVal result
 * from the simulation (or null if simulation fails).
 */
async function simulateContractCall(
  server: rpc.Server,
  source: Keypair,
  method: string,
  args: xdr.ScVal[],
): Promise<xdr.ScVal | null> {
  try {
    const account = await server.getAccount(source.publicKey());
    const contract = new Contract(CONTRACT_ID);

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!sim) {
      log("WARN", `Simulation returned nothing for ${method}`);
      return null;
    }

    // @stellar/stellar-sdk v16 returns results on `sim.results[0]` or `sim.result`
    const result = (sim as any).result?.retval
      ? (sim as any).result
      : (sim as any).results?.[0];

    return result?.retval ?? null;
  } catch (err) {
    log("ERROR", `Simulation error for ${method}: ${err}`);
    return null;
  }
}

/**
 * Fetch subscription details from the Soroban contract.
 */
async function getSubscription(
  server: rpc.Server,
  source: Keypair,
  subscriber: string,
  id: number,
): Promise<Subscription | null> {
  const args = [
    Address.fromString(subscriber).toScVal(),
    nativeToScVal(id, { type: "u32" }),
  ];

  const retval = await simulateContractCall(server, source, "get_subscription", args);
  if (!retval) return null;

  try {
    const raw: any = scValToNative(retval);

    // The contract returns the Subscription struct as an ordered Vec (array).
    if (!Array.isArray(raw) || raw.length < 11) {
      log("WARN", `Unexpected get_subscription result shape for ${subscriber}#${id}`);
      return null;
    }

    return {
      subscriber: String(raw[0] ?? ""),
      recipient: String(raw[1] ?? ""),
      token: String(raw[2] ?? ""),
      amount: BigInt(String(raw[3] ?? "0")),
      interval_seconds: Number(raw[4] ?? 0),
      next_payment_time: Number(raw[5] ?? 0),
      escrow_balance: BigInt(String(raw[6] ?? "0")),
      payment_count: Number(raw[7] ?? 0),
      status: Number(raw[8] ?? -1),
      created_at: Number(raw[9] ?? 0),
      expiration_time: Number(raw[10] ?? 0),
    };
  } catch (err) {
    log("ERROR", `Failed to parse subscription for ${subscriber}#${id}: ${err}`);
    return null;
  }
}

/**
 * Prepare, sign, and submit an execute_payment transaction.
 * Returns the transaction hash on success, or throws on failure.
 */
async function submitExecutePayment(
  server: rpc.Server,
  source: Keypair,
  subscriber: string,
  id: number,
): Promise<string> {
  const account = await server.getAccount(source.publicKey());
  const contract = new Contract(CONTRACT_ID);

  const args = [
    Address.fromString(subscriber).toScVal(),
    nativeToScVal(id, { type: "u32" }),
  ];

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("execute_payment", ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(source);

  const sendResult = await server.sendTransaction(prepared);

  if (sendResult.errorResult) {
    throw new Error(`Transaction rejected: ${sendResult.errorResult}`);
  }

  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction error: ${JSON.stringify(sendResult)}`);
  }

  // Poll for completion
  const hash = sendResult.hash;
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    attempts++;
    const result = await server.getTransaction(hash);

    if (result.status === "SUCCESS") {
      return hash;
    }

    if (result.status === "FAILED") {
      throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
    }

    // Still pending — wait and retry
    await sleep(1_000);
  }

  throw new Error(`Timeout waiting for transaction ${hash}`);
}

// ---------------------------------------------------------------------------
// Core scheduler run
// ---------------------------------------------------------------------------

async function runOnce(
  server: rpc.Server,
  source: Keypair,
  entries: Registry,
  stats: SchedulerStats,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  for (const entry of entries) {
    const sub = await getSubscription(server, source, entry.subscriber, entry.id);

    if (!sub) {
      stats.errors++;
      continue;
    }

    stats.checked++;

    // Skip inactive subscriptions.
    if (sub.status !== 0) {
      if (sub.status === 1) {
        log("INFO", `[${entry.subscriber}#${entry.id}] Already cancelled — skipping`);
      } else if (sub.status === 2) {
        log("INFO", `[${entry.subscriber}#${entry.id}] Expired — skipping`);
      } else {
        log("WARN", `[${entry.subscriber}#${entry.id}] Unknown status ${sub.status}`);
      }
      stats.skipped_inactive++;
      continue;
    }

    // Check expiration.
    if (now >= sub.expiration_time) {
      log("INFO", `[${entry.subscriber}#${entry.id}] Expired (${new Date(sub.expiration_time * 1000).toISOString()}) — skipping`);
      stats.skipped_expired++;
      continue;
    }

    // Check if due.
    if (now < sub.next_payment_time) {
      // Not due yet — skip this round.
      stats.skipped_due++;
      continue;
    }

    // Check sufficient escrow.
    if (sub.escrow_balance < sub.amount) {
      log("WARN", `[${entry.subscriber}#${entry.id}] Insufficient escrow (${sub.escrow_balance} < ${sub.amount}) — waiting for top-up`);
      stats.skipped_due++;
      continue;
    }

    // Execute the payment.
    if (IS_DRY_RUN) {
      log("DRY", `[${entry.subscriber}#${entry.id}] Would execute payment` +
        ` — amount: ${sub.amount}, escrow after: ${sub.escrow_balance - sub.amount}` +
        `, next_payment: ${new Date(sub.next_payment_time * 1000).toISOString()} → ${new Date((sub.next_payment_time + sub.interval_seconds) * 1000).toISOString()}`);
      stats.executed++;
    } else {
      try {
        const txHash = await submitExecutePayment(server, source, entry.subscriber, entry.id);
        log("OK", `[${entry.subscriber}#${entry.id}] Payment executed — tx: ${txHash}`);
        stats.executed++;
      } catch (err) {
        log("ERROR", `[${entry.subscriber}#${entry.id}] Payment failed: ${err}`);
        stats.errors++;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  log("INFO", `===== Stellar Drips Scheduler ${IS_DRY_RUN ? "(DRY RUN)" : "(LIVE)"} =====`);
  log("INFO", `RPC: ${RPC_URL}`);
  log("INFO", `Contract: ${CONTRACT_ID || "(not set — configure CONTRACT_ID)"}`);
  log("INFO", `Interval: ${INTERVAL_SECONDS}s`);
  log("INFO", `Registry: ${REGISTRY_PATH}`);

  if (!CONTRACT_ID) {
    log("WARN", "No CONTRACT_ID configured — scheduler will be idle");
    log("INFO", "Set CONTRACT_ID in environment after deploying the contract");
    return;
  }

  if (!KEEPER_SECRET && !IS_DRY_RUN) {
    log("ERROR", "KEEPER_SECRET_KEY is required for live runs");
    process.exit(1);
  }

  if (!KEEPER_SECRET && IS_DRY_RUN) {
    log("INFO", "No keeper key configured — using ephemeral key for dry-run simulations");
  }

  // Create a keypair for simulation (we need a source account for RPC calls).
  const source = KEEPER_SECRET ? Keypair.fromSecret(KEEPER_SECRET) : Keypair.random();

  const server = new rpc.Server(RPC_URL);

  // Continuous polling loop.
  let iteration = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    iteration++;
    log("INFO", `--- Iteration ${iteration} ---`);

    const stats: SchedulerStats = {
      checked: 0,
      executed: 0,
      skipped_due: 0,
      skipped_expired: 0,
      skipped_inactive: 0,
      errors: 0,
    };

    const entries = loadRegistry();
    if (entries.length === 0) {
      log("INFO", "No subscriptions in registry — sleeping");
    } else {
      await runOnce(server, source, entries, stats);
    }

    log("INFO", `Stats: ${stats.executed} executed, ${stats.checked} checked, ` +
      `${stats.skipped_inactive} inactive, ${stats.skipped_expired} expired, ` +
      `${stats.skipped_due - stats.errors} not-yet-due, ` +
      `${stats.errors} errors`);

    if (!IS_DRY_RUN) {
      // Clean up registry: remove entries that are no longer active.
      const entries = loadRegistry();
      const before = entries.length;

      // We re-check by calling get_subscription and filtering.
      const cleaned: Registry = [];
      for (const entry of entries) {
        const sub = await getSubscription(server, source, entry.subscriber, entry.id);
        if (!sub || sub.status === 0) {
          // Keep if Active or if we can't reach the contract (might be transient).
          cleaned.push(entry);
        } else {
          log("INFO", `Removing ${entry.subscriber}#${entry.id} from registry (status=${sub.status})`);
        }
      }

      if (cleaned.length < before) {
        saveRegistry(cleaned);
      }
    }

    log("INFO", `Sleeping ${INTERVAL_SECONDS}s until next iteration...`);
    await sleep(INTERVAL_SECONDS * 1000);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((err) => {
  log("ERROR", `Fatal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
