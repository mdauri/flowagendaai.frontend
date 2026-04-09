import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicBookingHeader } from "./public-booking-header";

const baseProfessional = {
  id: "prof-1",
  name: "Maria Silva",
  slug: "maria-silva",
  tenantId: "tenant-1",
  tenantTimezone: "America/Sao_Paulo",
};

describe("PublicBookingHeader", () => {
  it("renders professional photo when thumbnail is available", () => {
    render(
      <PublicBookingHeader
        professional={{
          ...baseProfessional,
          thumbnailUrl: "https://cdn.example.com/maria_thumb.webp",
          imageUrl: "https://cdn.example.com/maria.webp",
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Foto de Maria Silva" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/maria_thumb.webp",
    );
  });

  it("falls back to initial when image fails to load", () => {
    render(
      <PublicBookingHeader
        professional={{
          ...baseProfessional,
          thumbnailUrl: "https://cdn.example.com/maria_thumb.webp",
          imageUrl: null,
        }}
      />,
    );

    const image = screen.getByRole("img", { name: "Foto de Maria Silva" });
    fireEvent.error(image);

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders fallback initial when no image is provided", () => {
    render(<PublicBookingHeader professional={baseProfessional} />);

    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Foto de Maria Silva" })).not.toBeInTheDocument();
  });
});
