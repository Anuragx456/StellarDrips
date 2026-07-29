import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubscribe } from "@/hooks/useSubscribe";

vi.mock("@/context/WalletContext", () => ({
  useWallet: () => ({
    address: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
    isConnected: true,
  }),
}));

vi.mock("@/lib/contract", () => ({
  getServer: () => ({
    getAccount: vi.fn().mockRejectedValue(new Error("no network")),
  }),
  getContract: () => ({}),
  getTokenId: () => "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  encodeSubscribeArgs: vi.fn(() => []),
  getNetworkPassphrase: () => "Test SDF Network ; September 2015",
}));

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    signTransaction: vi.fn(),
  },
}));

describe("useSubscribe", () => {
  it("returns idle status initially", () => {
    const { result } = renderHook(() => useSubscribe());
    expect(result.current.status.type).toBe("idle");
  });

  it("resets to idle", () => {
    const { result } = renderHook(() => useSubscribe());
    act(() => { result.current.reset(); });
    expect(result.current.status.type).toBe("idle");
  });
});
