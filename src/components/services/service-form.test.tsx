import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
      </QueryClientProvider>,
    );

    const dropzone = screen.getByLabelText("Pre-visualizacao da imagem");
    const file = new File(["image"], "service.png", { type: "image/png" });

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [file] },
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText("service.png")).toBeInTheDocument();
    expect(screen.getByAltText("Pre-visualizacao do servico")).toHaveAttribute(
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
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
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
    expect(screen.queryByText("Exigir sinal para este servico")).not.toBeInTheDocument();
  });

  it("shows deposit configuration only when module is enabled", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Exigir sinal para este servico")).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={true} />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Exigir sinal para este servico")).toBeInTheDocument();
  });

  it("shows deposit type and value only after enabling deposit", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={true} />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Exigir sinal para este servico")).toBeInTheDocument();
    expect(screen.queryByText("Tipo de sinal")).not.toBeInTheDocument();
    expect(screen.queryByText("Valor do sinal")).not.toBeInTheDocument();
    expect(screen.queryByText("Percentual do sinal")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[0]);

    expect(screen.getByText("Tipo de sinal")).toBeInTheDocument();
    expect(screen.getByText("Valor do sinal")).toBeInTheDocument();
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
          depositModuleEnabled={false}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByDisplayValue("Corte tradicional")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edicao" }));
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });

  it("shows DurationHelper when duration > 960", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
      </QueryClientProvider>,
    );

    const durationInput = screen.getByPlaceholderText("Ex.: 60");
    await fireEvent.change(durationInput, { target: { value: "1440" } });

    expect(await screen.findByText(/Servico multi-dia/)).toBeInTheDocument();
  });

  it("does not show DurationHelper for single-day duration", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
      </QueryClientProvider>,
    );

    const durationInput = screen.getByPlaceholderText("Ex.: 60");
    fireEvent.change(durationInput, { target: { value: "60" } });

    expect(screen.queryByText(/Servico multi-dia/)).not.toBeInTheDocument();
  });

  it("shows compact duration helper hint", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ServiceForm onSubmit={vi.fn()} isSubmitting={false} depositModuleEnabled={false} />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Use minutos inteiros/)).toBeInTheDocument();
  });
});
