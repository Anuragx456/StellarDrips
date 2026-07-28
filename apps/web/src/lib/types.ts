/** Status of a subscription — matches contract SubscriptionStatus enum. */
export enum SubscriptionStatus {
  Active = 0,
  Cancelled = 1,
  Expired = 2,
}

/** Core subscription data — matches contract Subscription struct fields. */
export interface Subscription {
  id: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Format a stroop-denominated bigint balance to a human-readable XLM string. */
export function formatXlm(balance: bigint): string {
  const num = Number(balance) / 10_000_000;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

/** Format a unix-epoch timestamp to a short readable date string. */
export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Truncate a Stellar address for display. */
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
