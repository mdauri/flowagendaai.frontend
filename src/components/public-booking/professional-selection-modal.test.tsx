import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfessionalSelectionModal } from "./professional-selection-modal";

const mockProfessionals = [
  {
    id: "prof_123",
    name: "Maria Silva",
    slug: "maria-silva",
  },
  {
    id: "prof_456",
    name: "João Santos",
    slug: "joao-santos",
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
