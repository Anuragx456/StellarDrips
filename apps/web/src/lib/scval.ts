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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const raw = topic.map((v) => scValToNative(v));
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
