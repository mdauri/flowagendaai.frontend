import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfessionalSelectionModal } from "./professional-selection-modal";

const mockProfessionals = [
  {
    id: "prof_123",
    name: "Maria Silva",
    slug: "maria-silva",
    thumbnailUrl: "https://cdn.example.com/maria_thumb.webp",
    imageUrl: "https://cdn.example.com/maria.webp",
  },
  {
    id: "prof_456",
    name: "João Santos",
    slug: "joao-santos",
    thumbnailUrl: null,
    imageUrl: null,
  },
];

describe("ProfessionalSelectionModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <ProfessionalSelectionModal
        isOpen={false}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render modal when isOpen is true", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Escolha o profissional")).toBeInTheDocument();
    expect(screen.getByText("Corte Feminino")).toBeInTheDocument();
  });

  it("should render all professionals", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("João Santos")).toBeInTheDocument();
  });

  it("should call onSelectProfessional when professional is clicked", async () => {
    const user = userEvent.setup();
    const onSelectProfessional = vi.fn();

    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={onSelectProfessional}
        onClose={vi.fn()}
      />
    );

    const mariaButton = screen.getByText("Maria Silva").closest("button");
    expect(mariaButton).toBeInTheDocument();

    if (mariaButton) {
      await user.click(mariaButton);
    }

    expect(onSelectProfessional).toHaveBeenCalledWith("maria-silva");
    expect(onSelectProfessional).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={onClose}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={onClose}
      />
    );

    // Click on the backdrop area (outside the modal content)
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should render close button with aria-label", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Fechar modal")).toBeInTheDocument();
  });

  it("should render professional image when available", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const mariaImage = screen.getByRole("img", { name: "Foto de Maria Silva" });
    expect(mariaImage).toHaveAttribute("src", "https://cdn.example.com/maria_thumb.webp");
  });

  it("should render fallback initial when professional has no image", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("should fallback to initial when image loading fails", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const mariaImage = screen.getByRole("img", { name: "Foto de Maria Silva" });
    fireEvent.error(mariaImage);

    expect(screen.queryByRole("img", { name: "Foto de Maria Silva" })).not.toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("should render professional avatars with initials", () => {
    render(
      <ProfessionalSelectionModal
        isOpen={true}
        serviceName="Corte Feminino"
        professionals={mockProfessionals}
        tenantSlug="test-tenant"
        serviceId="svc_123"
        onSelectProfessional={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Check that initials are rendered (M for Maria, J for João)
    const avatars = screen.getAllByText(/^[MJ]$/);
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });
});
