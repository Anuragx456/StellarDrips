import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionStatus } from "@/lib/types";

const baseSub = {
  id: 0,
  subscriber: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
  recipient: "GB4W7R5CN7H7J5T6ZNZ6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y6L6Y",
  token: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
  amount: BigInt(100_000_000),
  intervalSeconds: 604800,
  nextPaymentTime: Math.floor(Date.now() / 1000) + 86400,
  escrowBalance: BigInt(500_000_000),
  paymentCount: 3,
  status: SubscriptionStatus.Active,
  createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
  expirationTime: Math.floor(Date.now() / 1000) + 86400 * 335,
};

describe("SubscriptionCard", () => {
  it("renders active status badge", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("shows Top Up and Cancel buttons when active", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Top Up")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("shows cancelled status badge", () => {
    const cancelled = { ...baseSub, status: SubscriptionStatus.Cancelled };
    render(<SubscriptionCard sub={cancelled} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Cancelled")).toBeDefined();
  });

  it("hides action buttons when not active", () => {
    const expired = { ...baseSub, status: SubscriptionStatus.Expired };
    render(<SubscriptionCard sub={expired} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText("Top Up")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("shows payment count", () => {
    render(<SubscriptionCard sub={baseSub} onTopUp={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("#3 payments")).toBeDefined();
  });
});
