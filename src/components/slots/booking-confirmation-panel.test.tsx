import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { BookingConfirmationPanel } from "@/components/slots/booking-confirmation-panel";
import type { CreateBookingResponse } from "@/types/booking";
import type { AvailableSlot } from "@/types/slot";

const selectedSlot: AvailableSlot = {
  start: "2026-04-01T12:00:00.000Z",
  end: "2026-04-01T13:00:00.000Z",
};

const confirmedBooking: CreateBookingResponse = {
  id: "booking-1",
  professionalId: "professional-1",
  serviceId: "service-1",
  start: "2026-04-01T12:00:00.000Z",
  end: "2026-04-01T13:00:00.000Z",
  status: "CONFIRMED",
};

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof BookingConfirmationPanel>> = {}
) {
  const onConfirm = vi.fn();
  const onRetry = vi.fn();
  const onRefreshSlots = vi.fn();
  const onResetSuccess = vi.fn();

  render(
    <BookingConfirmationPanel
      state="idle"
      selectedSlot={null}
      confirmedBooking={null}
      tenantTimezone="America/Sao_Paulo"
      professionalName="Ana"
      serviceName="Consulta"
      canConfirm={false}
      onConfirm={onConfirm}
      onRetry={onRetry}
      onRefreshSlots={onRefreshSlots}
      onResetSuccess={onResetSuccess}
      {...overrides}
    />
  );

  return {
    onConfirm,
    onRetry,
    onRefreshSlots,
    onResetSuccess,
  };
}

describe("BookingConfirmationPanel", () => {
  test("renderiza estado idle sem slot selecionado com CTA desabilitado", () => {
    renderPanel();

    expect(screen.getByText("Selecione um horario para continuar.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar agendamento" })
    ).toBeDisabled();
  });

  test("dispara o CTA de confirmacao quando existe slot selecionado", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderPanel({
      selectedSlot,
      canConfirm: true,
    });

    await user.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
  });

  test("renderiza loading com Confirmando...", () => {
    renderPanel({
      state: "pending",
      selectedSlot,
      canConfirm: false,
    });

    expect(screen.getByRole("button", { name: "Confirmando..." })).toBeDisabled();
    expect(screen.getByText("Validando disponibilidade com o servidor.")).toBeInTheDocument();
  });

  test("renderiza conflito 409 com mensagem especifica e CTA Atualizar horarios", async () => {
    const user = userEvent.setup();
    const { onRefreshSlots } = renderPanel({
      state: "conflict",
      selectedSlot: null,
      canConfirm: false,
    });

    expect(
      screen.getByText("Este horario acabou de ser reservado. Escolha outro horario.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Atualizar horarios" }));

    expect(onRefreshSlots).toHaveBeenCalledTimes(1);
  });

  test("renderiza erro generico com CTA Tentar novamente", async () => {
    const user = userEvent.setup();
    const { onRetry } = renderPanel({
      state: "error",
      selectedSlot,
    });

    expect(
      screen.getByText("Nao foi possivel confirmar o agendamento agora. Tente novamente.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("renderiza sucesso na mesma tela com horario confirmado", async () => {
    const user = userEvent.setup();
    const { onResetSuccess } = renderPanel({
      state: "success",
      confirmedBooking,
    });

    expect(screen.getByText("Agendamento confirmado")).toBeInTheDocument();
    expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Consultar outros horarios" }));

    expect(onResetSuccess).toHaveBeenCalledTimes(1);
  });
});
