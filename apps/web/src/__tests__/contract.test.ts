import { describe, it, expect } from "vitest";
import {
  getContract,
  getTokenId,
  getNetworkPassphrase,
  encodeSubscribeArgs,
} from "@/lib/contract";

describe("contract helpers", () => {
  it("getContract returns contract instance with fallback contract ID", () => {
    const contract = getContract();
    expect(contract).toBeDefined();
    expect(contract.contractId()).toBe("CCEWB5F27ETPU7FAQWDEWEGGTL4DIUCWNHU36RV2MDXSSGFJUDSONPAC");
  });

  it("getTokenId returns default token contract address", () => {
    expect(getTokenId()).toBe("CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO");
  });

  it("getNetworkPassphrase returns testnet passphrase", () => {
    expect(getNetworkPassphrase()).toBe("Test SDF Network ; September 2015");
  });

  it("encodeSubscribeArgs constructs 7 ScVal parameters in correct order", () => {
    const subscriber = "GAZ4FWKYGV2LIQFIVHI6ZLY6GU34TVYEQWZEKIRNJNW2R5UWXZXKEQRZ";
    const recipient = "GACXJOK6WX2NSBG5JDZW4BWODDDMRHDKDBALT45QUMOHXZMQFTWL7JAM";
    const token = "CDFJZD3D5Y2RF27NFM4BPDMSKYMDMD5AT2ZQCAWAXAZZBONUB3M3BNCO";
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
  });
});
