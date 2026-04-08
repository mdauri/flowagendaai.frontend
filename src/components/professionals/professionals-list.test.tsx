import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfessionalsList } from "@/components/professionals/professionals-list";

describe("ProfessionalsList", () => {
  it("nao exibe descricao quando nao existir", () => {
    render(
      <ProfessionalsList
        professionals={[
          {
            id: "p1",
            name: "Ana Souza",
            slug: "ana-souza",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        tenantTimezone="UTC"
      />,
    );

    expect(
      screen.queryByText(/Especialista/i),
    ).not.toBeInTheDocument();
  });

  it("exibe descricao com clamp em 5 linhas quando existir", () => {
    const description = "Especialista em coloracao\nAtende seg-sex.";

    render(
      <ProfessionalsList
        professionals={[
          {
            id: "p1",
            name: "Ana Souza",
            slug: "ana-souza",
            description,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        tenantTimezone="UTC"
      />,
    );

    const el = screen.getByText((content) => {
      return (
        content.includes("Especialista em coloracao") &&
        content.includes("Atende seg-sex.")
      );
    });
    expect(el.style.webkitLineClamp).toBe("5");
  });

  it("mostra CTA de retry no card quando existir pending upload", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ProfessionalsList
        professionals={[
          {
            id: "p1",
            name: "Ana Souza",
            slug: "ana-souza",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        tenantTimezone="UTC"
        pendingImageUploads={{
          p1: {
            file: new File(["x"], "foto.png", { type: "image/png" }),
            message: "Nao foi possivel enviar a foto.",
          },
        }}
        onRetryImageUpload={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0][0].id).toBe("p1");
  });
});
