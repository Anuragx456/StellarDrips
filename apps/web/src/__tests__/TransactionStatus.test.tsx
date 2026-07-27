import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionStatus } from "@/components/TransactionStatus";

describe("TransactionStatus", () => {
  it("renders nothing when idle", () => {
    const { container } = render(<TransactionStatus status="idle" />);
    expect(container.innerHTML).toBe("");
  });

  it("shows spinner when pending", () => {
    render(<TransactionStatus status="pending" />);
    expect(screen.getByText("Confirming transaction…")).toBeDefined();
  });

  it("shows success with explorer link", () => {
    render(<TransactionStatus status="success" txHash="abc123" />);
    expect(screen.getByText("✅ Transaction confirmed")).toBeDefined();
    const link = screen.getByText("View on Stellar.Expert →");
    expect(link.getAttribute("href")).toContain("abc123");
  });

  it("shows error with retry button", () => {
    const onRetry = () => {};
    render(<TransactionStatus status="error" error="Something failed" onRetry={onRetry} />);
    expect(screen.getByText("⚠ Something failed")).toBeDefined();
    expect(screen.getByText("Try again")).toBeDefined();
  });

  it("shows error without retry when onRetry not provided", () => {
    render(<TransactionStatus status="error" error="Failed" />);
    expect(screen.getByText("⚠ Failed")).toBeDefined();
    expect(screen.queryByText("Try again")).toBeNull();
  });
});
