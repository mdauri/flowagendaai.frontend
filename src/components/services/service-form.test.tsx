import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServiceForm } from "./service-form";

describe("ServiceForm", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("loads preview when a valid image is dropped in create mode", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} />
      </QueryClientProvider>,
    );

    const dropzone = screen.getByLabelText("Pré-visualização da imagem");
    const file = new File(["image"], "service.png", { type: "image/png" });

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [file] },
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText("service.png")).toBeInTheDocument();
    expect(screen.getByAltText("Pré-visualização do serviço")).toHaveAttribute(
      "src",
      "blob:preview",
    );
  });

  it("renders mandatory fields in create mode", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText("Nome do servico")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Descreva o que esta incluso no servico, prerequisitos, ou outras informacoes relevantes."
      )
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex.: 60")).toBeInTheDocument();
    expect(screen.getByText("Preco")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar servico" })).toBeInTheDocument();
  });

  it("loads edit values and allows canceling inline edit", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const cancelEdit = vi.fn();
    const service = {
      id: "service-1",
      tenantId: "tenant-1",
      name: "Corte tradicional",
      description: "Corte classico.",
      durationInMinutes: 60,
      price: 50,
      imageUrl: "https://example.com/service.jpg",
      thumbnailUrl: null,
      isActive: true,
      createdAt: "2026-04-08T12:00:00.000Z",
      updatedAt: "2026-04-08T12:00:00.000Z",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm
          mode="edit"
          initialValues={service}
          onSubmit={vi.fn(async () => ({ service }))}
          isSubmitting={false}
          onCancelEdit={cancelEdit}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByDisplayValue("Corte tradicional")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edicao" }));
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });
});
