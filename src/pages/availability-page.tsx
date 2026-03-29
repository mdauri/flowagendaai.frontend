import { useMemo, useState } from "react";
import { AvailabilityRuleForm } from "@/components/availability/availability-rule-form";
import { AvailabilityRulesList } from "@/components/availability/availability-rules-list";
import { SectionHeading } from "@/components/flow/section-heading";
import { AvailabilityProfessionalSelector } from "@/components/availability/availability-professional-selector";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useAvailabilityQuery } from "@/hooks/use-availability-query";
import { useCreateAvailabilityMutation } from "@/hooks/use-create-availability-mutation";
import { useDeleteAvailabilityMutation } from "@/hooks/use-delete-availability-mutation";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useUpdateAvailabilityMutation } from "@/hooks/use-update-availability-mutation";
import { formatUtcTimeInTenantTimezone } from "@/lib/date-time";
import { ApiError } from "@/types/api";
import type { AvailabilityBaseItem, CreateAvailabilityBaseInput, UpdateAvailabilityBaseInput } from "@/types/base-availability";

export function AvailabilityPage() {
  const auth = useAuth();
  const professionalsQuery = useProfessionalsQuery();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [editingAvailability, setEditingAvailability] = useState<AvailabilityBaseItem | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const availabilityQuery = useAvailabilityQuery(selectedProfessionalId || null);
  const createAvailabilityMutation = useCreateAvailabilityMutation();
  const updateAvailabilityMutation = useUpdateAvailabilityMutation();
  const deleteAvailabilityMutation = useDeleteAvailabilityMutation();

  const professionals = professionalsQuery.data?.professionals ?? [];
  const tenantTimezone = auth.tenant?.timezone ?? "UTC";

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => professional.id === selectedProfessionalId) ?? null,
    [professionals, selectedProfessionalId]
  );

  async function handleSubmitAvailability(
    input: CreateAvailabilityBaseInput | UpdateAvailabilityBaseInput
  ) {
    if (!selectedProfessionalId) {
      return;
    }

    if ("id" in input) {
      await updateAvailabilityMutation.mutateAsync({
        professionalId: selectedProfessionalId,
        input,
      });
      setEditingAvailability(null);
      return;
    }

    await createAvailabilityMutation.mutateAsync({
      professionalId: selectedProfessionalId,
      input,
    });
  }

  async function handleDeleteAvailability(item: AvailabilityBaseItem) {
    if (!selectedProfessionalId) {
      return;
    }

    setDeleteErrorMessage(null);

    const confirmed = window.confirm(`Remover a regra de ${item.dayOfWeek} para este profissional?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteAvailabilityMutation.mutateAsync({
        professionalId: selectedProfessionalId,
        availabilityId: item.id,
      });
      if (editingAvailability?.id === item.id) {
        setEditingAvailability(null);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setDeleteErrorMessage("Existe um conflito retornado pela API para esta operacao.");
        return;
      }

      setDeleteErrorMessage(
        error instanceof ApiError ? error.message : "Nao foi possivel remover a regra."
      );
    }
  }

  const isSubmitting =
    createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending;

  return (
    <>
      <SectionHeading
        eyebrow="Availability Base"
        title="Disponibilidade base"
        description="Configure a disponibilidade base por profissional usando o contrato real do backend, sem calcular agenda no frontend."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="grid gap-6">
          {professionalsQuery.isLoading ? (
            <PageState
              title="Carregando profissionais"
              description="Precisamos do cadastro operacional de profissionais antes de representar a disponibilidade base."
            />
          ) : null}

          {professionalsQuery.isError ? (
            <FeedbackBanner
              title="Nao foi possivel carregar os profissionais"
              description="A selecao do profissional depende do fluxo operacional ja existente. Revise o backend de professionals antes de seguir."
            />
          ) : null}

          {!professionalsQuery.isLoading && !professionalsQuery.isError ? (
            <>
              <AvailabilityProfessionalSelector
                professionals={professionals}
                selectedProfessionalId={selectedProfessionalId}
                tenantTimezone={tenantTimezone}
                onProfessionalChange={(professionalId) => {
                  setSelectedProfessionalId(professionalId);
                  setEditingAvailability(null);
                  setDeleteErrorMessage(null);
                }}
              />
              <AvailabilityRuleForm
                professionalId={selectedProfessionalId || null}
                mode={editingAvailability ? "edit" : "create"}
                initialValues={
                  editingAvailability
                    ? {
                        id: editingAvailability.id,
                        dayOfWeek: editingAvailability.dayOfWeek,
                        startTime: formatUtcTimeInTenantTimezone(
                          editingAvailability.dayOfWeek,
                          editingAvailability.startTimeUtc,
                          tenantTimezone
                        ),
                        endTime: formatUtcTimeInTenantTimezone(
                          editingAvailability.dayOfWeek,
                          editingAvailability.endTimeUtc,
                          tenantTimezone
                        ),
                      }
                    : undefined
                }
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitAvailability}
                onCancelEdit={() => {
                  setEditingAvailability(null);
                }}
              />
            </>
          ) : null}
        </div>

        <div className="grid gap-6">
          {!professionalsQuery.isLoading &&
          !professionalsQuery.isError &&
          professionals.length === 0 ? (
            <PageState
              title="Nenhum profissional disponivel para configuracao"
              description="Cadastre ao menos um profissional antes de preparar a disponibilidade base."
            />
          ) : null}

          {!professionalsQuery.isLoading &&
          !professionalsQuery.isError &&
          professionals.length > 0 &&
          !selectedProfessional ? (
            <PageState
              title="Selecione um profissional"
              description="A tela so exibe estados de disponibilidade depois que um profissional e escolhido."
            />
          ) : null}

          {selectedProfessional && availabilityQuery.isLoading ? (
            <PageState
              title="Carregando disponibilidade"
              description="Estamos consultando a disponibilidade base do profissional selecionado."
            />
          ) : null}

          {selectedProfessional && availabilityQuery.isError ? (
            <div className="grid gap-4">
              <FeedbackBanner
                title="Nao foi possivel carregar a disponibilidade"
                description="Revise o contrato da API e tente novamente para o profissional selecionado."
              />
            </div>
          ) : null}

          {deleteErrorMessage ? (
            <FeedbackBanner
              title="Falha ao remover disponibilidade"
              description={deleteErrorMessage}
            />
          ) : null}

          {selectedProfessional &&
          !availabilityQuery.isLoading &&
          !availabilityQuery.isError &&
          availabilityQuery.data &&
          availabilityQuery.data.availability.length === 0 ? (
            <PageState
              title="Nenhuma disponibilidade configurada"
              description="O profissional selecionado ainda nao possui regras de disponibilidade base."
            />
          ) : null}

          {selectedProfessional &&
          !availabilityQuery.isLoading &&
          !availabilityQuery.isError &&
          availabilityQuery.data &&
          availabilityQuery.data.availability.length > 0 ? (
            <AvailabilityRulesList
              availability={availabilityQuery.data.availability}
              professionalName={selectedProfessional.name}
              tenantTimezone={tenantTimezone}
              isDeleting={deleteAvailabilityMutation.isPending}
              onEdit={(item) => {
                setEditingAvailability(item);
              }}
              onDelete={handleDeleteAvailability}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
