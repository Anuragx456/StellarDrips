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

/** Get the contract ID from env or default to testnet contract. */
function getContractId(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTRACT_ID) {
    return process.env.NEXT_PUBLIC_CONTRACT_ID;
  }
  return "CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC";
}

export const TESTNET_NATIVE_XLM_TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

/** Get the token contract ID (wrapped XLM SAC) from env or default to testnet native SAC. */
export function getTokenId(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TOKEN_ID) {
    return process.env.NEXT_PUBLIC_TOKEN_ID;
  }
  return TESTNET_NATIVE_XLM_TOKEN_ID;
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
