import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenantCoverBanner } from "./tenant-cover-banner";

describe("TenantCoverBanner", () => {
  const defaultProps = {
    tenantName: "Test Studio",
    tenantSlug: "test-studio",
    variant: "full" as const,
  };

  it("renders full variant with cover image", () => {
    render(
      <TenantCoverBanner
        {...defaultProps}
        coverImageUrl="https://example.com/cover.webp"
      />
    );

    const img = screen.getByRole("img", { name: /Cover image for Test Studio/ });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/cover.webp");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("renders compact variant with cover image", () => {
    render(
      <TenantCoverBanner
        {...defaultProps}
        variant="compact"
        coverImageUrl="https://example.com/cover.webp"
      />
    );

    const img = screen.getByRole("img", { name: /Cover image for Test Studio/ });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders fallback gradient when no cover image", () => {
    render(<TenantCoverBanner {...defaultProps} />);

    // Should have banner role with "Banner for" label
    const banner = screen.getByRole("img", { name: /Banner for Test Studio/ });
    expect(banner).toBeInTheDocument();
  });

  it("renders fallback gradient when coverImageUrl is null", () => {
    render(
      <TenantCoverBanner {...defaultProps} coverImageUrl={null as unknown as string} />
    );

    const banner = screen.getByRole("img", { name: /Banner for Test Studio/ });
    expect(banner).toBeInTheDocument();
  });

  it("displays tenant logo when logoUrl provided", () => {
    render(
      <TenantCoverBanner
        {...defaultProps}
        logoUrl="https://example.com/logo.png"
      />
    );

    const logo = screen.getByAltText("");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("displays tenant initial avatar when no logo", () => {
    render(<TenantCoverBanner {...defaultProps} />);

    // The container should contain the initial "T"
    const container = screen.getByRole("img", {
      name: /Banner for Test Studio/,
    });
    expect(container.textContent).toContain("T");
  });

  it("displays public address with title attribute", () => {
    const longAddress = "Rua Exemplo, 123 - Bairro, Cidade - Estado, 00000-000, Country";
    render(
      <TenantCoverBanner
        {...defaultProps}
        publicAddress={longAddress}
        variant="compact"
      />
    );

    const addressEl = screen.getByTitle(longAddress);
    expect(addressEl).toBeInTheDocument();
    expect(addressEl.textContent).toContain("Rua Exemplo");
  });

  it("does not display address when not provided", () => {
    render(<TenantCoverBanner {...defaultProps} />);

    // No element with a title should be present for address
    expect(screen.queryByTitle(/.+/)).not.toBeInTheDocument();
  });

  it("renders skeleton when isLoading", () => {
    render(
      <TenantCoverBanner {...defaultProps} isLoading />
    );

    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-label", "Loading banner");
  });

  it("uses coverThumbnailUrl for compact variant", () => {
    render(
      <TenantCoverBanner
        {...defaultProps}
        variant="compact"
        coverImageUrl="https://example.com/cover.webp"
        coverThumbnailUrl="https://example.com/cover_thumb.webp"
      />
    );

    const img = screen.getByRole("img", { name: /Cover image for Test Studio/ });
    expect(img).toHaveAttribute("src", "https://example.com/cover_thumb.webp");
  });

  it("uses full coverImageUrl for full variant even when thumbnail is provided", () => {
    render(
      <TenantCoverBanner
        {...defaultProps}
        variant="full"
        coverImageUrl="https://example.com/cover.webp"
        coverThumbnailUrl="https://example.com/cover_thumb.webp"
      />
    );

    const img = screen.getByRole("img", { name: /Cover image for Test Studio/ });
    expect(img).toHaveAttribute("src", "https://example.com/cover.webp");
  });

  it("displays tenant slug in full variant", () => {
    render(
      <TenantCoverBanner {...defaultProps} variant="full" />
    );

    expect(screen.getByText("@test-studio")).toBeInTheDocument();
  });

  it("does not display tenant slug in compact variant", () => {
    render(
      <TenantCoverBanner {...defaultProps} variant="compact" />
    );

    expect(screen.queryByText("@test-studio")).not.toBeInTheDocument();
  });

  it("falls back to gradient when cover image fails to load", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <TenantCoverBanner
        {...defaultProps}
        coverImageUrl="https://example.com/broken-cover.webp"
      />
    );

    const coverImg = screen.getByRole("img", {
      name: /Cover image for Test Studio/,
    });
    coverImg.dispatchEvent(new Event("error"));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[TenantCoverBanner] Cover image failed to load for tenant "Test Studio"'
      )
    );

    warnSpy.mockRestore();
  });
});
