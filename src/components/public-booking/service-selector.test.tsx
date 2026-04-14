import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceSelector } from "./service-selector";

const services = [
  {
    id: "service-1",
    name: "Corte Feminino",
    durationInMinutes: 60,
    imageUrl: "https://cdn.example.com/original.webp",
    thumbnailUrl: "https://cdn.example.com/thumb.webp",
  },
];

describe("ServiceSelector", () => {
  it("renders service image using thumbnail when available", () => {
    render(
      <ServiceSelector
        services={services}
        selectedServiceId={null}
        onSelect={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByRole("img", { name: "Imagem do serviço Corte Feminino" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/thumb.webp",
    );
  });

  it("shows fallback when image fails to load", () => {
    render(
      <ServiceSelector
        services={services}
        selectedServiceId={null}
        onSelect={vi.fn()}
        isLoading={false}
      />,
    );

    const image = screen.getByRole("img", { name: "Imagem do serviço Corte Feminino" });
    fireEvent.error(image);

    expect(screen.getByText("CF")).toBeInTheDocument();
  });

  it("shows fallback when service has no image", () => {
    render(
      <ServiceSelector
        services={[
          { id: "service-2", name: "Coloração", durationInMinutes: 90, imageUrl: null, thumbnailUrl: null },
        ]}
        selectedServiceId={null}
        onSelect={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Imagem do serviço Coloração" })).not.toBeInTheDocument();
  });

  it("multi-day service shows badge with correct day count", () => {
    render(
      <ServiceSelector
        services={[
          { id: "service-3", name: "Imersao", durationInMinutes: 2400, imageUrl: null, thumbnailUrl: null },
        ]}
        selectedServiceId={null}
        onSelect={vi.fn()}
        isLoading={false}
      />,
    );

    // 2400 / (10 * 60) = 4 days
    expect(screen.getByText("4d")).toBeInTheDocument();
  });

  it("single-day service does not show badge", () => {
    render(
      <ServiceSelector
        services={[
          { id: "service-4", name: "Consulta", durationInMinutes: 60, imageUrl: null, thumbnailUrl: null },
        ]}
        selectedServiceId={null}
        onSelect={vi.fn()}
        isLoading={false}
      />,
    );

    // The badge shows "Xd" where X is a number, so we check that no such pattern exists
    expect(screen.queryByText(/\d+d/)).not.toBeInTheDocument();
  });

  it("selection still works for multi-day service", () => {
    const onSelect = vi.fn();
    const multiDayService = { id: "service-5", name: "Imersao", durationInMinutes: 1440, imageUrl: null, thumbnailUrl: null };

    render(
      <ServiceSelector
        services={[multiDayService]}
        selectedServiceId={null}
        onSelect={onSelect}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { pressed: false }));
    expect(onSelect).toHaveBeenCalledWith(multiDayService);
  });
});
