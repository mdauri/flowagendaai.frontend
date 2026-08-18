import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  SubscriptionStatusBadge,
  subscriptionStatusLabel,
} from "@/components/billing/billing-status-badge";

describe("SubscriptionStatusBadge", () => {
  test("renderiza status TRIALING como teste gratis", () => {
    render(<SubscriptionStatusBadge status="TRIALING" />);

    expect(subscriptionStatusLabel("TRIALING")).toBe("Teste gratis");
    expect(screen.getByText("Teste gratis")).toBeInTheDocument();
  });
});
