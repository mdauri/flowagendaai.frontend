import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Route, Routes } from "react-router";
import { SignupForm } from "@/components/auth/signup-form";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  refetchCurrentUser: vi.fn(),
  mutationState: {
    isPending: false,
    error: null as unknown,
  },
}));

vi.mock("@/hooks/use-public-signup-mutation", () => ({
  usePublicSignupMutation: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: mocks.mutationState.isPending,
    error: mocks.mutationState.error,
  }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    refetchCurrentUser: mocks.refetchCurrentUser,
  }),
}));

function renderSignupForm() {
  return renderWithProviders(
    <Routes>
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/app" element={<div>app-destination</div>} />
    </Routes>,
    { route: "/signup", withRouter: true },
  );
}

async function fillValidSignupForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Seu nome"), "Ana Silva");
  await user.type(screen.getByLabelText("E-mail"), "ana@studio.com");
  await user.type(screen.getByLabelText("WhatsApp"), "(11) 99999-9999");
  await user.type(screen.getByLabelText("CPF ou CNPJ"), "12.345.678/0001-95");
  await user.type(screen.getByLabelText("Nome da empresa"), "Studio Bella");
  await user.type(screen.getByLabelText("Senha"), "senha-segura");
  await user.type(screen.getByLabelText("Confirmar senha"), "senha-segura");
  await user.click(screen.getAllByRole("checkbox")[0]);
}

describe("SignupForm", () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset();
    mocks.refetchCurrentUser.mockReset();
    mocks.mutationState.isPending = false;
    mocks.mutationState.error = null;
  });

  test("renderiza campos e links legais", () => {
    renderSignupForm();

    expect(screen.getByRole("heading", { name: "Comece seu teste gratis" })).toBeInTheDocument();
    expect(screen.getByLabelText("Seu nome")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da empresa")).toBeInTheDocument();
    expect(screen.getByLabelText("CPF ou CNPJ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos-de-uso");
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/politica-de-privacidade");
    expect(screen.getByRole("link", { name: "Ja tenho conta" })).toHaveAttribute("href", "/login");
  });

  test("bloqueia submit com validacao local", async () => {
    const user = userEvent.setup();

    renderSignupForm();

    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(screen.getByText("Informe seu nome.")).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail valido.")).toBeInTheDocument();
    expect(screen.getByText("Informe um WhatsApp valido.")).toBeInTheDocument();
    expect(screen.getByText("Informe um CPF ou CNPJ valido.")).toBeInTheDocument();
    expect(screen.getByText("Aceite os termos para continuar.")).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  test("submete payload normalizado e navega apos bootstrap de auth", async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockResolvedValue({
      accessToken: "jwt-signup",
      expiresIn: "1d",
      user: { id: "user-1", name: "Ana Silva", email: "ana@studio.com", role: "admin" },
      tenant: { id: "tenant-1", name: "Studio Bella", timezone: "America/Sao_Paulo", slug: "studio-bella" },
      trial: {
        status: "TRIALING",
        startsAt: "2026-08-17T00:00:00.000Z",
        endsAt: "2026-08-31T00:00:00.000Z",
      },
    });
    mocks.refetchCurrentUser.mockResolvedValue({
      data: {
        user: { id: "user-1", name: "Ana Silva", email: "ana@studio.com", role: "admin" },
        tenant: { id: "tenant-1", name: "Studio Bella", timezone: "America/Sao_Paulo", slug: "studio-bella" },
      },
      error: null,
    });

    renderSignupForm();
    await fillValidSignupForm(user);
    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        responsibleName: "Ana Silva",
        email: "ana@studio.com",
        phone: "11999999999",
        cpfCnpj: "12345678000195",
        companyName: "Studio Bella",
        password: "senha-segura",
        acceptedTerms: true,
      });
    });
    expect(mocks.refetchCurrentUser).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("app-destination")).toBeInTheDocument();
  });

  test("renderiza mensagem generica para conflito de signup", () => {
    mocks.mutationState.error = new ApiError(
      409,
      "SIGNUP_CONFLICT",
      "Ja existe uma conta com esses dados.",
      "req-1",
    );

    renderSignupForm();

    expect(screen.getByText("Nao foi possivel criar a conta")).toBeInTheDocument();
    expect(screen.getByText("Ja existe uma conta com esses dados.")).toBeInTheDocument();
  });

  test("renderiza mensagem de rate limit", () => {
    mocks.mutationState.error = new ApiError(
      429,
      "RATE_LIMIT_EXCEEDED",
      "Muitas tentativas.",
      "req-1",
    );

    renderSignupForm();

    expect(screen.getByText("Muitas tentativas")).toBeInTheDocument();
    expect(screen.getByText("Muitas tentativas. Tente novamente em alguns minutos.")).toBeInTheDocument();
  });
});
