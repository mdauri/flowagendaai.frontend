import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { DeleteProfessionalDialog } from "@/components/professionals/delete-professional-dialog";
import { ProfessionalForm } from "@/components/professionals/professional-form";
import { ProfessionalsList } from "@/components/professionals/professionals-list";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProfessionalMutation } from "@/hooks/use-create-professional-mutation";
import { useDeleteProfessionalMutation } from "@/hooks/use-delete-professional-mutation";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useUpdateProfessionalMutation } from "@/hooks/use-update-professional-mutation";
import { ApiError } from "@/types/api";
import type { CreateProfessionalInput, CreateProfessionalResponse, Professional } from "@/types/professional";

export function ProfessionalsPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const professionalsQuery = useProfessionalsQuery();
  const createProfessionalMutation = useCreateProfessionalMutation();
  const updateProfessionalMutation = useUpdateProfessionalMutation();
  const deleteProfessionalMutation = useDeleteProfessionalMutation();
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [pendingImageUploads, setPendingImageUploads] = useState<Record<string, { file: File; message: string }>>({});

  async function handleCreateProfessional(input: CreateProfessionalInput): Promise<CreateProfessionalResponse> {
    return createProfessionalMutation.mutateAsync(input);
  }

  async function handleUpdateProfessional(professionalId: string, name: string, description?: string | null) {
    await updateProfessionalMutation.mutateAsync({
      professionalId,
      input: { name, description },
    });
  }

  async function handleDeleteProfessional() {
    if (!deletingProfessional) {
      return;
    }

    setDeleteErrorMessage(null);

    try {
      await deleteProfessionalMutation.mutateAsync(deletingProfessional.id);
      setPendingImageUploads((current) => {
        const next = { ...current };
        delete next[deletingProfessional.id];
        return next;
      });
      setEditingProfessional((current) =>
        current?.id === deletingProfessional.id ? null : current
      );
      setDeletingProfessional(null);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        error.code === "PROFESSIONAL_HAS_IMPACTED_BOOKINGS"
      ) {
        setEditingProfessional((current) =>
          current?.id === deletingProfessional.id ? null : current
        );
        setDeletingProfessional(null);
        navigate(`/app/professionals/${deletingProfessional.id}/removal`);
        return;
      }

      setDeleteErrorMessage(
        error instanceof ApiError ? error.message : "Nao foi possivel remover o profissional."
      );
    }
  }

  const professionals = professionalsQuery.data?.professionals ?? [];
  const isEditingProfessional = editingProfessional !== null;
  const canManageProfessionals = useMemo(
    () => ["admin", "mandant"].includes(auth.user?.role ?? ""),
    [auth.user?.role]
  );

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    formSectionRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <SectionHeading
        eyebrow="Operational Core"
        title="Profissionais"
        description="Gerencie o cadastro inicial dos profissionais usando o contrato real do backend, sem acoplar regra de agenda no frontend."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {canManageProfessionals ? (
          <div ref={formSectionRef}>
            <ProfessionalForm
              mode={isEditingProfessional ? "edit" : "create"}
              initialValues={editingProfessional}
              isSubmitting={
                createProfessionalMutation.isPending || updateProfessionalMutation.isPending
              }
              onCreateSubmit={handleCreateProfessional}
              onEditSubmit={handleUpdateProfessional}
              onCancelEdit={() => setEditingProfessional(null)}
              pendingImageRetry={
                editingProfessional && pendingImageUploads[editingProfessional.id]
                  ? pendingImageUploads[editingProfessional.id]
                  : null
              }
              onImageUploadFailed={(professionalId, file, message) => {
                setPendingImageUploads((current) => ({
                  ...current,
                  [professionalId]: { file, message },
                }));
              }}
              onImageUploadSucceeded={(professionalId) => {
                setPendingImageUploads((current) => {
                  if (!current[professionalId]) {
                    return current;
                  }
                  const next = { ...current };
                  delete next[professionalId];
                  return next;
                });
              }}
            />
          </div>
        ) : (
          <Card variant="premium" padding="lg" className="h-full">
            <CardTitle>Acesso de leitura</CardTitle>
            <CardDescription className="mt-3">
              Apenas usuarios com role `admin` ou `mandant` podem criar, alterar ou remover
              profissionais.
            </CardDescription>
          </Card>
        )}

        <div className="grid gap-6">
          <Card variant="glass" padding="lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Listagem operacional</CardTitle>
                <CardDescription className="mt-3">
                  A listagem agora concentra create, edicao, remocao logica e o encaminhamento para
                  a resolucao de agendamentos impactados.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-soft">
                  {professionals.length}{" "}
                  {professionals.length === 1
                    ? "profissional listado"
                    : "profissionais listados"}
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    void professionalsQuery.refetch();
                  }}
                  disabled={professionalsQuery.isFetching}
                >
                  {professionalsQuery.isFetching ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </div>
          </Card>

          {professionalsQuery.isLoading ? (
            <PageState
              title="Carregando profissionais"
              description="Estamos preparando a listagem operacional para este tenant."
            />
          ) : null}

          {professionalsQuery.isError ? (
            <div className="grid gap-4">
              <FeedbackBanner
                title="Nao foi possivel carregar a listagem"
                description="Revise a conectividade da API e o contexto autenticado do tenant antes de tentar novamente."
              />
              <div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    void professionalsQuery.refetch();
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : null}

          {!professionalsQuery.isLoading &&
          !professionalsQuery.isError &&
          professionals.length === 0 ? (
            <PageState
              title="Nenhum profissional cadastrado"
              description="Comece pelo formulario ao lado para criar o primeiro profissional desta operacao."
              actionLabel="Ir para o formulario"
              onAction={() => {
                formSectionRef.current?.scrollIntoView?.({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
          ) : null}

          {!professionalsQuery.isLoading &&
          !professionalsQuery.isError &&
          professionals.length > 0 ? (
            <ProfessionalsList
              professionals={professionals}
              tenantTimezone={auth.tenant?.timezone ?? "UTC"}
              canManageProfessionals={canManageProfessionals}
              onEditProfessional={handleEditProfessional}
              pendingImageUploads={pendingImageUploads}
              onRetryImageUpload={(professional) => {
                handleEditProfessional(professional);
              }}
              onDeleteProfessional={(professional) => {
                setDeleteErrorMessage(null);
                setDeletingProfessional(professional);
              }}
            />
          ) : null}
        </div>
      </div>

      <DeleteProfessionalDialog
        professional={deletingProfessional}
        isOpen={deletingProfessional !== null}
        isSubmitting={deleteProfessionalMutation.isPending}
        errorMessage={deleteErrorMessage}
        onClose={() => {
          setDeletingProfessional(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={() => {
          void handleDeleteProfessional();
        }}
      />
    </>
  );
}
