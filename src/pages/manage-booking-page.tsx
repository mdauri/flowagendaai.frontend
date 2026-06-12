import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { DateTime } from "luxon";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardTitle } from "@/components/flow/card";
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { usePublicManageBookingQuery } from "@/hooks/use-public-manage-booking-query";
import { useCancelPublicManageBookingMutation } from "@/hooks/use-cancel-public-manage-booking-mutation";
import { useConfirmPublicManageBookingMutation } from "@/hooks/use-confirm-public-manage-booking-mutation";
import {
  formatDateTimeInTenantTimezone,
  formatUtcTimeRangeWithDateWhenCrossesDay,
} from "@/lib/date-time";
import {
  ApiError,
  isBookingAlreadyResolvedApiError,
} from "@/types/api";

function resolveStatusVariant(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "CANCELLED") return "danger" as const;
  if (normalized === "COMPLETED") return "neutral" as const;
  if (normalized === "PENDING") return "warning" as const;
  if (normalized === "AWAITING_DEPOSIT") return "warning" as const;
  return "success" as const;
}

function resolveStatusLabel(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "CANCELLED") return "Cancelado";
  if (normalized === "COMPLETED") return "Concluido";
  if (normalized === "PENDING") return "Pendente de confirmacao";
  if (normalized === "AWAITING_DEPOSIT") return "Aguardando sinal";
  return "Confirmado";
}

function resolveManageActionError(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 404) {
    return "Este link nao esta mais disponivel.";
  }

  if (isBookingAlreadyResolvedApiError(error)) {
    return "Este agendamento ja foi resolvido. Atualize a pagina e tente novamente.";
  }

  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

function resolveStatusNotice(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "CANCELLED") {
    return {
      title: "Agendamento cancelado",
      description: "Esse agendamento ja foi cancelado.",
    };
  }

  if (normalized === "COMPLETED") {
    return {
      title: "Agendamento concluido",
      description: "Esse agendamento ja foi concluido.",
    };
  }

  if (normalized === "CONFIRMED") {
    return {
      title: "Agendamento confirmado",
      description: "Esse agendamento ja foi confirmado.",
    };
  }

  if (normalized === "AWAITING_DEPOSIT") {
    return {
      title: "Aguardando sinal",
      description: "Este agendamento foi criado e aguarda a baixa manual do sinal.",
    };
  }

  return null;
}

function resolveDepositStatusLabel(status?: string) {
  const normalized = status?.toUpperCase() ?? "";

  if (normalized === "NOT_REQUIRED") return "Sem sinal";
  if (normalized === "PENDING") return "Aguardando sinal";
  if (normalized === "PAID") return "Sinal pago";
  if (normalized === "WAIVED") return "Sinal dispensado";
  if (normalized === "EXPIRED") return "Sinal expirado";

  return "Nao informado";
}

export function ManageBookingPage() {
  const { token } = useParams<{ token: string }>();
  const manageQuery = usePublicManageBookingQuery(token);
  const cancelMutation = useCancelPublicManageBookingMutation();
  const confirmMutation = useConfirmPublicManageBookingMutation();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const booking = manageQuery.data;

  const dateText = useMemo(() => {
    if (!booking) return null;
    return DateTime.fromISO(booking.startAt, { zone: "utc" })
      .setZone(booking.tenantTimezone)
      .setLocale("pt-BR")
      .toFormat("cccc, d 'de' LLLL");
  }, [booking]);

  const timeRangeText = useMemo(() => {
    if (!booking) return null;
    return formatUtcTimeRangeWithDateWhenCrossesDay(
      booking.startAt,
      booking.endAt,
      booking.tenantTimezone,
    );
  }, [booking]);

  const startDateTimeText = useMemo(() => {
    if (!booking) return null;
    return formatDateTimeInTenantTimezone(
      booking.startAt,
      booking.tenantTimezone,
    );
  }, [booking]);

  const normalizedStatus = booking?.status.toUpperCase() ?? "";
  const canConfirmBooking = Boolean(
    booking && booking.canConfirm && normalizedStatus === "PENDING",
  );
  const canCancelBooking = Boolean(booking && booking.canCancel);
  const showStatusNotice = Boolean(
    booking && !pageMessage && !confirmError && !manageQuery.isError,
  );
  const statusNotice = booking ? resolveStatusNotice(booking.status) : null;

  const handleConfirm = async () => {
    if (!token) return;

    setConfirmError(null);
    setCancelError(null);
    setPageMessage(null);

    try {
      await confirmMutation.mutateAsync({ token });
      setPageMessage("Agendamento confirmado com sucesso.");
    } catch (error) {
      setConfirmError(
        resolveManageActionError(
          error,
          "Nao foi possivel confirmar agora. Tente novamente.",
        ),
      );
    }
  };

  if (!token) {
    return (
      <ManageBookingShell>
        <PageState
          title="Link invalido"
          description="Nao encontramos o token de gerenciamento no endereco informado."
          actionLabel="Voltar para a pagina inicial"
          onAction={() => {
            window.location.href = "/";
          }}
        />
      </ManageBookingShell>
    );
  }

  if (manageQuery.isLoading) {
    return (
      <ManageBookingShell>
        <Card variant="glass" padding="lg" className="mx-auto w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded-full bg-white/10" />
            <div className="h-10 w-2/3 rounded-2xl bg-white/10" />
            <div className="h-28 rounded-[28px] bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-12 rounded-2xl bg-white/10" />
              <div className="h-12 rounded-2xl bg-white/10" />
            </div>
          </div>
        </Card>
      </ManageBookingShell>
    );
  }

  if (manageQuery.isError || !booking) {
    const isExpired =
      manageQuery.error instanceof ApiError && manageQuery.error.status === 404;

    return (
      <ManageBookingShell>
        <PageState
          title={
            isExpired
              ? "Link expirado ou invalido"
              : "Nao foi possivel carregar"
          }
          description={
            isExpired
              ? "Este link de gerenciamento nao e mais valido."
              : "Nao conseguimos carregar os detalhes desse agendamento agora."
          }
          actionLabel="Voltar para a pagina inicial"
          onAction={() => {
            window.location.href = "/";
          }}
        />
      </ManageBookingShell>
    );
  }

  return (
    <ManageBookingShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card
          variant="premium"
          padding="lg"
          className="shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant={resolveStatusVariant(booking.status)}>
                {resolveStatusLabel(booking.status)}
              </Badge>
              <CardTitle className="mt-4 text-3xl sm:text-4xl">
                {booking.tenantName}
              </CardTitle>
            </div>
            <ThemeSwitcher compact />
          </div>

          <div className="mt-6 grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
            <Detail label="Servico" value={booking.serviceName} />
            <Detail
              label="Profissional"
              value={booking.professionalName ?? "Nao informado"}
            />
            <Detail label="Data" value={dateText ?? "Nao informada"} />
            <Detail label="Horario" value={timeRangeText ?? "Nao informado"} />
            <Detail
              label="Horario completo"
              value={startDateTimeText ?? "Nao informado"}
            />
            <Detail label="Status" value={resolveStatusLabel(booking.status)} />
            <Detail
              label="Sinal"
              value={resolveDepositStatusLabel(booking.depositStatus)}
            />
          </div>

          {showStatusNotice && statusNotice ? (
            <FeedbackBanner
              className="mt-5"
              tone="info"
              title={statusNotice.title}
              description={statusNotice.description}
            />
          ) : null}

          {pageMessage ? (
            <FeedbackBanner
              className="mt-5"
              tone="info"
              title="Atualizacao registrada"
              description={pageMessage}
            />
          ) : null}

          {confirmError ? (
            <FeedbackBanner
              className="mt-5"
              title="Nao foi possivel confirmar"
              description={confirmError}
            />
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {canConfirmBooking ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                className="sm:flex-1"
                onClick={handleConfirm}
                disabled={confirmMutation.isPending}
              >
                {confirmMutation.isPending
                  ? "Confirmando..."
                  : "Confirmar agendamento"}
              </Button>
            ) : null}
            {canCancelBooking ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                className="sm:flex-1"
                onClick={() => {
                  setCancelError(null);
                  setIsCancelDialogOpen(true);
                }}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending
                  ? "Cancelando..."
                  : "Cancelar agendamento"}
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      <CancelBookingDialog
        isOpen={isCancelDialogOpen}
        context="public"
        bookingSummary={{
          customerName: booking.customerName,
          professionalName: booking.professionalName,
          serviceName: booking.serviceName,
          start: booking.startAt,
          end: booking.endAt,
        }}
        isSubmitting={cancelMutation.isPending}
        errorMessage={cancelError}
        supportReason
        onClose={() => {
          if (cancelMutation.isPending) {
            return;
          }

          setIsCancelDialogOpen(false);
          setCancelError(null);
        }}
        onConfirm={async ({ reason }) => {
          if (!token) return;

          setCancelError(null);
          setConfirmError(null);
          setPageMessage(null);

          try {
            await cancelMutation.mutateAsync({
              token,
              reason,
            });
            setIsCancelDialogOpen(false);
            setPageMessage("Agendamento cancelado com sucesso.");
          } catch (error) {
            setCancelError(
              resolveManageActionError(
                error,
                "Nao foi possivel cancelar agora. Tente novamente.",
              ),
            );
          }
        }}
      />
    </ManageBookingShell>
  );
}

function ManageBookingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(253,224,71,0.22),_transparent_34%),linear-gradient(180deg,_#fbf5eb_0%,_#f7efe5_44%,_#efe3d4_100%)] px-4 py-6 text-[var(--theme-text-primary)]">
      <div className="absolute left-[-8rem] top-[-7rem] h-64 w-64 rounded-full bg-[#ffd37d]/40 blur-3xl" />
      <div className="absolute bottom-[-9rem] right-[-5rem] h-80 w-80 rounded-full bg-[#8fd5c8]/30 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-soft">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">
        {value}
      </p>
    </div>
  );
}
