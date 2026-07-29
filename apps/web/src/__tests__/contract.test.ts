import { afterEach, describe, it, expect, vi } from "vitest";
import { scValToNative } from "@stellar/stellar-sdk";
import {
  getContract,
  getTokenId,
  getNetworkPassphrase,
  encodeSubscribeArgs,
  TESTNET_NATIVE_XLM_TOKEN_ID,
} from "@/lib/contract";

describe("contract helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("getContract returns contract instance with fallback contract ID", () => {
    const contract = getContract();
    expect(contract).toBeDefined();
    expect(contract.contractId()).toBe("CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC");
  });

  it("getTokenId returns the native XLM SAC address by default", () => {
    expect(getTokenId()).toBe(TESTNET_NATIVE_XLM_TOKEN_ID);
  });

  it("getTokenId allows an explicit custom token override", () => {
    vi.stubEnv("NEXT_PUBLIC_TOKEN_ID", "CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO");

    expect(getTokenId()).toBe("CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO");
  });

  it("getNetworkPassphrase returns testnet passphrase", () => {
    expect(getNetworkPassphrase()).toBe("Test SDF Network ; September 2015");
  });

  it("encodeSubscribeArgs constructs 7 ScVal parameters in correct order", () => {
    const subscriber = "GAZ4FWKYGV2LIQFIVHI6ZLY6GU34TVYEQWZEKIRNJNW2R5UWXZXKEQRZ";
    const recipient = "GACXJOK6WX2NSBG5JDZW4BWODDDMRHDKDBALT45QUMOHXZMQFTWL7JAM";
    const token = getTokenId();
    const amount = BigInt(100_000_000);
    const intervalSeconds = 604800;
    const initialEscrow = BigInt(1_000_000_000);
    const expirationTime = 1785150000;

    const args = encodeSubscribeArgs(
      subscriber,
      recipient,
      token,
      amount,
      intervalSeconds,
      initialEscrow,
      expirationTime,
    );

    expect(args).toHaveLength(7);
    expect(scValToNative(args[0])).toBe(subscriber);
    expect(scValToNative(args[1])).toBe(recipient);
    expect(scValToNative(args[2])).toBe(TESTNET_NATIVE_XLM_TOKEN_ID);
    expect(scValToNative(args[3])).toBe(amount);
    expect(scValToNative(args[4])).toBe(BigInt(intervalSeconds));
    expect(scValToNative(args[5])).toBe(initialEscrow);
    expect(scValToNative(args[6])).toBe(BigInt(expirationTime));
  });
});
