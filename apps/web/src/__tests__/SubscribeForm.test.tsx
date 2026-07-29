import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubscribeForm } from "@/components/SubscribeForm";

vi.mock("@/context/WalletContext", () => ({
  useWallet: () => ({
    address: "GA3V6QO4BM6K6G4S5YNMZ5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5XK5X",
    isConnected: true,
  }),
}));

vi.mock("@/hooks/useSubscribe", () => ({
  useSubscribe: () => ({
    status: { type: "idle" },
    execute: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("SubscribeForm", () => {
  it("renders subscription form elements", () => {
    render(<SubscribeForm />);
    expect(screen.getByText("Create Subscription")).toBeDefined();
    expect(screen.getByLabelText(/Recipient Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Amount per Payment/i)).toBeDefined();
    expect(screen.getByLabelText(/Initial Escrow/i)).toBeDefined();
  });

  it("disables submit button initially when fields are empty", () => {
    render(<SubscribeForm />);
    const submitBtn = screen.getByRole("button", { name: /Create Subscription/i });
    expect(submitBtn).toHaveProperty("disabled", true);
  });

  it("shows error when initial escrow is less than payment amount", () => {
    render(<SubscribeForm />);
    
    const recipientInput = screen.getByLabelText(/Recipient Address/i);
    const amountInput = screen.getByLabelText(/Amount per Payment/i);
    const escrowInput = screen.getByLabelText(/Initial Escrow/i);

    fireEvent.change(recipientInput, { target: { value: "GAZ4FWKYGV2LIQFIVHI6ZLY6GU34TVYEQWZEKIRNJNW2R5UWXZXKEQRZ" } });
    fireEvent.change(amountInput, { target: { value: "100" } });
    fireEvent.change(escrowInput, { target: { value: "50" } });

    expect(screen.getByText(/Initial escrow must be at least equal to payment amount/i)).toBeDefined();

    const submitBtn = screen.getByRole("button", { name: /Create Subscription/i });
    expect(submitBtn).toHaveProperty("disabled", true);
  });

  it("enables submit button when valid inputs are provided", () => {
    render(<SubscribeForm />);

    const recipientInput = screen.getByLabelText(/Recipient Address/i);
    const amountInput = screen.getByLabelText(/Amount per Payment/i);
    const escrowInput = screen.getByLabelText(/Initial Escrow/i);

    fireEvent.change(recipientInput, { target: { value: "GAZ4FWKYGV2LIQFIVHI6ZLY6GU34TVYEQWZEKIRNJNW2R5UWXZXKEQRZ" } });
    fireEvent.change(amountInput, { target: { value: "10" } });
    fireEvent.change(escrowInput, { target: { value: "100" } });

    const submitBtn = screen.getByRole("button", { name: /Create Subscription/i });
    expect(submitBtn).toHaveProperty("disabled", false);
  });
});
