import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "@/test/render";
import { ManageBookingPage } from "./manage-booking-page";
import { ApiError } from "@/types/api";

const mockManageQuery = vi.fn();
const mockCancelMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
} as const;
const mockConfirmMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
} as const;

vi.mock("@/hooks/use-public-manage-booking-query", () => ({
  usePublicManageBookingQuery: () => mockManageQuery(),
}));
vi.mock("@/hooks/use-cancel-public-manage-booking-mutation", () => ({
  useCancelPublicManageBookingMutation: () => mockCancelMutation,
}));
vi.mock("@/hooks/use-confirm-public-manage-booking-mutation", () => ({
  useConfirmPublicManageBookingMutation: () => mockConfirmMutation,
}));

const basePendingBooking = {
  tenantName: "Clinica Demo",
  tenantTimezone: "America/Sao_Paulo",
  serviceName: "Corte",
  professionalName: "Dra. Ana",
  startAt: "2026-04-18T10:00:00.000Z",
  endAt: "2026-04-18T11:00:00.000Z",
  status: "PENDING",
  customerName: "Jessica",
  canConfirm: true,
  canCancel: true,
  publicBookingUrl: "http://localhost:5173/manage/manage-token-1",
  manageTokenExpiresAt: "2026-05-18T00:00:00.000Z",
};

const baseConfirmedBooking = {
  ...basePendingBooking,
  status: "CONFIRMED",
  canConfirm: false,
};

beforeEach(() => {
  mockManageQuery.mockReturnValue({
    data: basePendingBooking,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  mockCancelMutation.mutateAsync.mockReset();
  mockConfirmMutation.mutateAsync.mockReset();
});

describe("ManageBookingPage", () => {
  it("shows friendly state when token is invalid", () => {
    mockManageQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, "NOT_FOUND", "not found", "req"),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <Routes>
        <Route path="/manage/:token" element={<ManageBookingPage />} />
      </Routes>,
      { route: "/manage/invalid", withRouter: true }
    );

    expect(screen.getByRole("heading", { name: /Link expirado ou invalido/i })).toBeInTheDocument();
  });

  it("renders pending booking with confirm and cancel actions, and no reschedule CTA", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/manage/:token" element={<ManageBookingPage />} />
      </Routes>,
      { route: "/manage/manage-token-1", withRouter: true }
    );

    expect(screen.getByText("Clinica Demo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar agendamento/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar agendamento/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reagendar pelo WhatsApp/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Falar com atendente/i })).not.toBeInTheDocument();

    mockConfirmMutation.mutateAsync.mockResolvedValue({
      booking: {
        id: "booking-1",
        status: "CONFIRMED",
        confirmedAt: "2026-04-18T12:00:00.000Z",
        confirmedByType: "PUBLIC",
        confirmedById: null,
      },
    });

    await user.click(screen.getByRole("button", { name: /Confirmar agendamento/i }));

    expect(mockConfirmMutation.mutateAsync).toHaveBeenCalledWith({
      token: "manage-token-1",
    });
    expect(await screen.findByText("Agendamento confirmado com sucesso.")).toBeInTheDocument();
  });

  it("renders confirmed booking with cancel action only and allows cancel confirmation", async () => {
    const user = userEvent.setup();
    mockManageQuery.mockReturnValue({
      data: baseConfirmedBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <Routes>
        <Route path="/manage/:token" element={<ManageBookingPage />} />
      </Routes>,
      { route: "/manage/manage-token-1", withRouter: true }
    );

    expect(screen.queryByRole("button", { name: /Confirmar agendamento/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar agendamento/i })).toBeInTheDocument();

    mockCancelMutation.mutateAsync.mockResolvedValue({
      booking: {
        id: "booking-1",
        status: "CANCELLED",
        cancelledAt: "2026-04-18T12:00:00.000Z",
        cancelledByType: "PUBLIC",
        cancelReason: null,
      },
    });

    await user.click(screen.getByRole("button", { name: /Cancelar agendamento/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar cancelamento/i }));

    expect(mockCancelMutation.mutateAsync).toHaveBeenCalledWith({
      token: "manage-token-1",
      reason: undefined,
    });
    expect(await screen.findByText("Agendamento cancelado com sucesso.")).toBeInTheDocument();
  });

  it("shows a resolved-state message when confirm returns 409", async () => {
    const user = userEvent.setup();
    mockConfirmMutation.mutateAsync.mockRejectedValue(
      new ApiError(409, "BOOKING_ALREADY_RESOLVED", "already resolved", "req")
    );

    renderWithProviders(
      <Routes>
        <Route path="/manage/:token" element={<ManageBookingPage />} />
      </Routes>,
      { route: "/manage/manage-token-1", withRouter: true }
    );

    await user.click(screen.getByRole("button", { name: /Confirmar agendamento/i }));

    expect(
      await screen.findByText(/Este agendamento ja foi resolvido/i)
    ).toBeInTheDocument();
  });
});
