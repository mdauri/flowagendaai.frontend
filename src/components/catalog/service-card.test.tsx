import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceCard } from "./service-card";

const mockService = {
  id: "svc_123",
  name: "Corte Feminino",
  description: "Corte + escova + finalização",
  price: 80,
  durationInMinutes: 60,
  imageUrl: null,
  thumbnailUrl: null,
};

describe("ServiceCard", () => {
  it("should render service name", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    expect(screen.getByText("Corte Feminino")).toBeInTheDocument();
  });

  it("should render formatted price", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    expect(screen.getByText("R$ 80,00")).toBeInTheDocument();
  });

  it("should render duration", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    expect(screen.getByText("Corte + escova + finalização")).toBeInTheDocument();
  });

  it("should render booking button", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    expect(screen.getByRole("button", { name: /agendar/i })).toBeInTheDocument();
  });

  it("should call onBook when booking button is clicked", async () => {
    const onBook = vi.fn();
    const user = userEvent.setup();

    render(<ServiceCard service={mockService} tenantSlug="test" onBook={onBook} />);

    await user.click(screen.getByRole("button", { name: /agendar/i }));

    expect(onBook).toHaveBeenCalledWith("svc_123");
  });

  it("should show fallback when no image", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);
    // Should show initials "CF" for "Corte Feminino"
    expect(screen.getByText("CF")).toBeInTheDocument();
  });

  it("should format duration correctly for different values", () => {
    const testCases = [
      { minutes: 30, expected: "30 min" },
      { minutes: 60, expected: "1h" },
      { minutes: 90, expected: "1h 30min" },
      { minutes: 120, expected: "2h" },
      { minutes: 45, expected: "45 min" },
    ];

    testCases.forEach(({ minutes, expected }) => {
      const { container, unmount } = render(
        <ServiceCard
          service={{ ...mockService, durationInMinutes: minutes }}
          tenantSlug="test"
          onBook={vi.fn()}
        />
      );
      expect(container.textContent).toContain(expected);
      unmount();
    });
  });

  it("should have proper ARIA labels", () => {
    render(<ServiceCard service={mockService} tenantSlug="test" onBook={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Agendar Corte Feminino" });
    expect(button).toBeInTheDocument();
  });

  it("should prefer thumbnail when available", () => {
    render(
      <ServiceCard
        service={{
          ...mockService,
          imageUrl: "https://cdn.example.com/original.webp",
          thumbnailUrl: "https://cdn.example.com/thumb.webp",
        }}
        tenantSlug="test"
        onBook={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: "Corte Feminino" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/thumb.webp",
    );
  });
});
