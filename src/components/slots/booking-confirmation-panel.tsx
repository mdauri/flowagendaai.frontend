import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { MultiDaySummary } from "@/components/slots/multi-day-summary";
import { semanticTokens } from "@/design-system";
import { formatDateTimeInTenantTimezone, formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import type { CreateBookingResponse } from "@/types/booking";
import type { AvailableSlot } from "@/types/slot";

export type BookingConfirmationPanelState =
  | "idle"
  | "pending"
  | "success"
  | "conflict"
  | "error";

interface BookingConfirmationPanelProps {
  state: BookingConfirmationPanelState;
  selectedSlot: AvailableSlot | null;
  confirmedBooking: CreateBookingResponse | null;
  tenantTimezone: string;
  professionalName?: string;
  serviceName?: string;
  canConfirm: boolean;
  onConfirm: () => void;
  onRetry: () => void;
  onRefreshSlots: () => void;
  onResetSuccess: () => void;
  daysAffected?: { date: string; start: string; end: string; durationMinutes: number }[];
}

function SlotSummary({
  start,
  end,
  tenantTimezone,
  professionalName,
  serviceName,
}: {
  start: string;
  end: string;
  tenantTimezone: string;
  professionalName?: string;
  serviceName?: string;
}) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">Horario</span>
        <Badge variant="info">{formatUtcTimeRangeInTenantTimezone(start, end, tenantTimezone)}</Badge>
      </div>
      <p className="text-sm leading-6 text-text-soft">
        {formatDateTimeInTenantTimezone(start, tenantTimezone)} ({tenantTimezone})
      </p>
      {professionalName ? (
        <p className="text-sm leading-6 text-text-soft">
          Profissional: <span className="font-semibold text-white">{professionalName}</span>
        </p>
      ) : null}
      {serviceName ? (
        <p className="text-sm leading-6 text-text-soft">
          Servico: <span className="font-semibold text-white">{serviceName}</span>
        </p>
      ) : null}
    </div>
  );
}

function SuccessState({
  booking,
  tenantTimezone,
  professionalName,
  serviceName,
  onResetSuccess,
}: {
  booking: CreateBookingResponse;
  tenantTimezone: string;
  professionalName?: string;
  serviceName?: string;
  onResetSuccess: () => void;
}) {
  return (
    <Card
      variant="glass"
      padding="lg"
      className="grid gap-4 border"
      style={{
        borderColor: semanticTokens.feedback.success.border,
        backgroundColor: semanticTokens.feedback.success.background,
      }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Agendamento confirmado</CardTitle>
          <CardDescription className="mt-3">
            O horario foi confirmado pelo backend e voce permanece nesta mesma tela.
          </CardDescription>
        </div>
        <Badge variant="success">Confirmado</Badge>
      </div>

      <SlotSummary
        start={booking.start}
        end={booking.end}
        tenantTimezone={tenantTimezone}
        professionalName={professionalName}
        serviceName={serviceName}
      />

      <Button type="button" variant="secondary" size="md" onClick={onResetSuccess}>
        Consultar outros horarios
      </Button>
    </Card>
  );
}

export function BookingConfirmationPanel({
  state,
  selectedSlot,
  confirmedBooking,
  tenantTimezone,
  professionalName,
  serviceName,
  canConfirm,
  onConfirm,
  onRetry,
  onRefreshSlots,
  onResetSuccess,
}: BookingConfirmationPanelProps) {
  if (state === "success" && confirmedBooking) {
    return (
      <SuccessState
        booking={confirmedBooking}
        tenantTimezone={tenantTimezone}
        professionalName={professionalName}
        serviceName={serviceName}
        onResetSuccess={onResetSuccess}
      />
    );
  }

  return (
    <Card variant="glass" padding="lg" className="grid gap-5" aria-live="polite">
      <div>
        <CardTitle>Confirmacao do agendamento</CardTitle>
        <CardDescription className="mt-3">
          O frontend apenas envia o slot escolhido. Disponibilidade, conflito e horario final
          continuam sendo confirmados pelo backend.
        </CardDescription>
      </div>

      {selectedSlot ? (
        selectedSlot.daysAffected && selectedSlot.daysAffected.length > 0 ? (
          <MultiDaySummary
            start={selectedSlot.start}
            end={selectedSlot.end}
            daysAffected={selectedSlot.daysAffected}
            timezone={tenantTimezone}
            professionalName={professionalName}
            serviceName={serviceName}
          />
        ) : (
          <SlotSummary
            start={selectedSlot.start}
            end={selectedSlot.end}
            tenantTimezone={tenantTimezone}
            professionalName={professionalName}
            serviceName={serviceName}
          />
        )
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          Selecione um horario para continuar.
        </div>
      )}

      {state === "conflict" ? (
        <FeedbackBanner
          title="Horario indisponivel"
          description="Este horario acabou de ser reservado. Escolha outro horario."
          tone="danger"
        />
      ) : null}

      {state === "error" ? (
        <FeedbackBanner
          title="Falha ao confirmar"
          description="Nao foi possivel confirmar o agendamento agora. Tente novamente."
          tone="warning"
        />
      ) : null}

      {state === "pending" ? (
        <FeedbackBanner
          title="Confirmando com o servidor"
          description="Validando disponibilidade com o servidor."
          tone="info"
        />
      ) : null}

      {state === "conflict" ? (
        <Button type="button" size="md" onClick={onRefreshSlots}>
          Atualizar horarios
        </Button>
      ) : state === "error" ? (
        <Button type="button" size="md" onClick={onRetry} disabled={!selectedSlot}>
          Tentar novamente
        </Button>
      ) : (
        <Button type="button" size="md" onClick={onConfirm} disabled={!canConfirm}>
          {state === "pending" ? "Confirmando..." : "Confirmar agendamento"}
        </Button>
      )}
    </Card>
  );
}
