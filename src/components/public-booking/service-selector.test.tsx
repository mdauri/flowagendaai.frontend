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
});
