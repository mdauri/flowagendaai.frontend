import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
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
import { HelpContextualLink } from "@/components/help/help-contextual-link";
import type {
  CreateProfessionalInput,
  CreateProfessionalResponse,
  Professional,
} from "@/types/professional";

export function ProfessionalsPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const professionalsQuery = useProfessionalsQuery();
  const createProfessionalMutation = useCreateProfessionalMutation();
  const updateProfessionalMutation = useUpdateProfessionalMutation();
  const deleteProfessionalMutation = useDeleteProfessionalMutation();
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] =
    useState<Professional | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );
  const [pendingImageUploads, setPendingImageUploads] = useState<
    Record<string, { file: File; message: string }>
  >({});

  async function handleCreateProfessional(
    input: CreateProfessionalInput,
  ): Promise<CreateProfessionalResponse> {
    return createProfessionalMutation.mutateAsync(input);
  }

  async function handleUpdateProfessional(
    professionalId: string,
    name: string,
    description: string | null | undefined,
    hasSystemAccess?: boolean,
    email?: string | null,
  ) {
    await updateProfessionalMutation.mutateAsync({
      professionalId,
      input: { name, description, hasSystemAccess, email },
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
        current?.id === deletingProfessional.id ? null : current,
      );
      setDeletingProfessional(null);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        error.code === "PROFESSIONAL_HAS_IMPACTED_BOOKINGS"
      ) {
        setEditingProfessional((current) =>
          current?.id === deletingProfessional.id ? null : current,
        );
        setDeletingProfessional(null);
        navigate(`/app/professionals/${deletingProfessional.id}/removal`);
        return;
      }

      setDeleteErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel remover o profissional.",
      );
    }
  }

  const professionals = professionalsQuery.data?.professionals ?? [];
  const isEditingProfessional = editingProfessional !== null;
  const canManageProfessionals = useMemo(
    () => ["admin"].includes(auth.user?.role ?? ""),
    [auth.user?.role],
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
        eyebrow=""
        title="Profissionais"
        description="Equipe e acesso ao sistema"
      />
      <HelpContextualLink href="/ajuda/profissionais/primeiro-profissional">Como configurar profissionais</HelpContextualLink>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {canManageProfessionals ? (
          <div ref={formSectionRef}>
            <ProfessionalForm
              mode={isEditingProfessional ? "edit" : "create"}
              initialValues={editingProfessional}
              isSubmitting={
                createProfessionalMutation.isPending ||
                updateProfessionalMutation.isPending
              }
              onCreateSubmit={handleCreateProfessional}
              onEditSubmit={handleUpdateProfessional}
              onCancelEdit={() => setEditingProfessional(null)}
              pendingImageRetry={
                editingProfessional &&
                pendingImageUploads[editingProfessional.id]
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
              Apenas usuarios com role `admin` podem criar, alterar ou remover
              profissionais.
            </CardDescription>
          </Card>
        )}

        <div className="grid gap-6 content-start">
          <Card variant="glass" padding="md">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Profissionais ({professionals.length})</CardTitle>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void professionalsQuery.refetch();
                  }}
                  disabled={professionalsQuery.isFetching}
                >
                  {professionalsQuery.isFetching
                    ? "Atualizando..."
                    : "Atualizar"}
                </Button>
              </div>
            </div>
          </Card>

          {professionalsQuery.isLoading ? (
            <PageState
              title="Carregando profissionais"
              description="Estamos preparando a lista de profissionais."
            />
          ) : null}

          {professionalsQuery.isError ? (
            <div className="grid gap-4">
              <FeedbackBanner
                title="Nao foi possivel carregar os profissionais"
                description="Verifique a conexao e tente novamente."
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
              description="Cadastre o primeiro profissional para comecar."
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
              tenantTimezone={""}
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
