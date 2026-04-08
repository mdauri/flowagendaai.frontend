import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useImpactedProfessionalBookingsQuery } from "@/hooks/use-impacted-professional-bookings-query";
import { professionalsService } from "@/services/professionals-service";
import { ApiError } from "@/types/api";

export function ProfessionalRemovalPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { professionalId } = useParams<{ professionalId: string }>();
  const impactedBookingsQuery = useImpactedProfessionalBookingsQuery(professionalId);
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);
  const [searchByBooking, setSearchByBooking] = useState<Record<string, string>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const canManageProfessionals = useMemo(
    () => ["admin", "mandant"].includes(auth.user?.role ?? ""),
    [auth.user?.role]
  );

  async function refreshState(message?: string) {
    await impactedBookingsQuery.refetch();
    setPageInfo(message ?? null);
  }

  async function handleReassign(bookingId: string, targetProfessionalId: string) {
    setPageError(null);
    setPageInfo(null);
    setBusyBookingId(bookingId);

    try {
      await professionalsService.reassignImpactedBooking(professionalId ?? "", bookingId, {
        targetProfessionalId,
      });
      await refreshState("Agendamento realocado com sucesso.");
    } catch (error) {
      setPageError(
        error instanceof ApiError ? error.message : "Nao foi possivel realocar o agendamento."
      );
    } finally {
      setBusyBookingId(null);
    }
  }

  async function handleCancel(bookingId: string) {
    setPageError(null);
    setPageInfo(null);
    setBusyBookingId(bookingId);

    try {
      const result = await professionalsService.cancelImpactedBooking(
        professionalId ?? "",
        bookingId
      );
      await refreshState(
        result.booking.notification.emailSent
          ? "Agendamento cancelado e email enviado ao cliente."
          : "Agendamento cancelado. Nenhum email foi enviado porque o booking nao possui email cadastrado."
      );
    } catch (error) {
      setPageError(
        error instanceof ApiError ? error.message : "Nao foi possivel cancelar o agendamento."
      );
    } finally {
      setBusyBookingId(null);
    }
  }

  async function handleFinalizeRemoval() {
    setPageError(null);
    setPageInfo(null);
    setIsFinalizing(true);

    try {
      await professionalsService.finalizeRemoval(professionalId ?? "");
      navigate("/app/professionals");
    } catch (error) {
      setPageError(
        error instanceof ApiError ? error.message : "Nao foi possivel concluir a remocao."
      );
    } finally {
      setIsFinalizing(false);
    }
  }

  if (!canManageProfessionals) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas usuarios com role admin ou mandant podem resolver a retirada operacional de profissionais."
      />
    );
  }

  if (impactedBookingsQuery.isLoading) {
    return (
      <PageState
        title="Carregando agendamentos impactados"
        description="Estamos buscando os agendamentos que precisam ser redistribuidos ou cancelados."
      />
    );
  }

  if (impactedBookingsQuery.isError || !impactedBookingsQuery.data) {
    return (
      <div className="grid gap-4">
        <FeedbackBanner
          title="Nao foi possivel carregar o fluxo de remocao"
          description="Revise a conectividade da API e tente novamente."
        />
        <div>
          <Button variant="secondary" size="md" onClick={() => impactedBookingsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { professional, bookings } = impactedBookingsQuery.data;

  return (
    <div className="grid gap-6">
      <SectionHeading
        eyebrow="Operational Core"
        title="Retirada operacional do profissional"
        description={`Resolva os agendamentos impactados de ${professional.name} antes da remocao logica final.`}
      />

      {pageError ? (
        <FeedbackBanner
          title="Fluxo com pendencia"
          description={pageError}
        />
      ) : null}

      {pageInfo ? (
        <FeedbackBanner
          tone="info"
          title="Atualizacao registrada"
          description={pageInfo}
        />
      ) : null}

      {bookings.length === 0 ? (
        <Card variant="glass" padding="lg" className="grid gap-4">
          <div>
            <CardTitle>Nenhum agendamento pendente</CardTitle>
            <CardDescription className="mt-3">
              Todos os agendamentos impactados ja foram tratados. Agora a remocao logica pode ser finalizada.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="md" disabled={isFinalizing} onClick={() => void handleFinalizeRemoval()}>
              {isFinalizing ? "Finalizando..." : "Concluir remocao"}
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => navigate("/app/professionals")}>
              Voltar para profissionais
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const selectedTarget = searchByBooking[booking.id] ?? "";

            return (
              <Card key={booking.id} variant="surface" padding="lg" className="grid gap-5 border-white/10">
                <div className="grid gap-2">
                  <CardTitle>{booking.service.name}</CardTitle>
                  <CardDescription>
                    Cliente: {booking.customerName ?? "Nao informado"} | WhatsApp:{" "}
                    {booking.customerPhone ?? "Nao informado"} | Email:{" "}
                    {booking.customerEmail ?? "Nao cadastrado"}
                  </CardDescription>
                  <p className="text-sm text-text-soft">
                    Inicio: {new Date(booking.start).toLocaleString("pt-BR")} | Fim:{" "}
                    {new Date(booking.end).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">
                    Realocar para outro profissional elegivel
                  </p>
                  <Input
                    list={`eligible-professionals-${booking.id}`}
                    value={selectedTarget}
                    onChange={(event) =>
                      setSearchByBooking((current) => ({
                        ...current,
                        [booking.id]: event.target.value,
                      }))
                    }
                    placeholder="Selecione pelo nome ou cole o id"
                    inputSize="md"
                    disabled={busyBookingId === booking.id}
                  />
                  <datalist id={`eligible-professionals-${booking.id}`}>
                    {booking.eligibleProfessionals.map((professionalOption) => (
                      <option
                        key={professionalOption.id}
                        value={professionalOption.id}
                      >
                        {professionalOption.name}
                      </option>
                    ))}
                  </datalist>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      size="md"
                      disabled={busyBookingId === booking.id || selectedTarget.length === 0}
                      onClick={() => void handleReassign(booking.id, selectedTarget)}
                    >
                      {busyBookingId === booking.id ? "Processando..." : "Realocar booking"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={busyBookingId === booking.id}
                      onClick={() => void handleCancel(booking.id)}
                    >
                      Cancelar booking
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
