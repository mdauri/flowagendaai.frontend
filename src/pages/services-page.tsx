import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { DeleteServiceDialog } from "@/components/services/delete-service-dialog";
import { ServiceForm } from "@/components/services/service-form";
import { ServicesList } from "@/components/services/services-list";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useCreateServiceMutation } from "@/hooks/use-create-service-mutation";
import { useDeleteServiceMutation, useUpdateServiceMutation } from "@/hooks/use-service-mutations";
import { useServicesQuery } from "@/hooks/use-services-query";
import { ApiError } from "@/types/api";
import type { Service } from "@/types/service";
import type { CreateServiceInput, UpdateServiceInput } from "@/types/service";

export function ServicesPage() {
  const auth = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const servicesQuery = useServicesQuery();
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();
  const deleteServiceMutation = useDeleteServiceMutation();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  function handleCreateService(input: CreateServiceInput) {
    return createServiceMutation.mutateAsync(input);
  }

  function handleUpdateService(input: UpdateServiceInput) {
    if (!editingService) {
      return Promise.reject(new Error("Servico nao selecionado para edicao."));
    }

    return updateServiceMutation.mutateAsync({
      id: editingService.id,
      input,
    });
  }

  async function handleDeleteService() {
    if (!deletingService) return;
    setDeleteErrorMessage(null);

    try {
      await deleteServiceMutation.mutateAsync(deletingService.id);
      setDeletingService(null);
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof ApiError ? error.message : "Nao foi possivel desativar o servico."
      );
    }
  }

  const services = servicesQuery.data?.services ?? [];
  const canManageServices = useMemo(
    () => ["admin", "mandant"].includes(auth.user?.role ?? ""),
    [auth.user?.role],
  );

  return (
    <>
      <SectionHeading
        eyebrow="Operational Core"
        title="Servicos"
        description="Gerencie o catalogo inicial de servicos usando o contrato real do backend, sem antecipar scheduling."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {canManageServices ? (
          <div ref={formSectionRef}>
            {editingService ? (
              <ServiceForm
                mode="edit"
                initialValues={editingService}
                onSubmit={handleUpdateService}
                onCancelEdit={() => {
                  setEditingService(null);
                }}
                isSubmitting={updateServiceMutation.isPending}
              />
            ) : (
              <ServiceForm
                onSubmit={handleCreateService}
                isSubmitting={createServiceMutation.isPending}
              />
            )}
          </div>
        ) : (
          <Card variant="premium" padding="lg" className="h-full">
            <CardTitle>Acesso de leitura</CardTitle>
            <CardDescription className="mt-3">
              Apenas usuarios com role `admin` ou `mandant` podem criar, alterar ou remover servicos.
            </CardDescription>
          </Card>
        )}

        <div className="grid gap-6">
          <Card variant="glass" padding="lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Catalogo operacional</CardTitle>
                <CardDescription className="mt-3">
                  Este modulo ja opera com `GET /services` e `POST /services`,
                  mantendo create, list e feedback visual no frontend.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-soft">
                  {services.length} {services.length === 1 ? "servico listado" : "servicos listados"}
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    void servicesQuery.refetch();
                  }}
                  disabled={servicesQuery.isFetching}
                >
                  {servicesQuery.isFetching ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </div>
          </Card>

          {servicesQuery.isLoading ? (
            <PageState
              title="Carregando servicos"
              description="Estamos preparando a listagem operacional deste tenant."
            />
          ) : null}

          {servicesQuery.isError ? (
            <div className="grid gap-4">
              <FeedbackBanner
                title="Nao foi possivel carregar os servicos"
                description="Revise a conectividade da API e o contexto autenticado antes de tentar novamente."
              />
              <div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    void servicesQuery.refetch();
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : null}

          {!servicesQuery.isLoading &&
          !servicesQuery.isError &&
          services.length === 0 ? (
            <PageState
              title="Nenhum servico cadastrado"
              description="Comece pelo formulario ao lado para criar o primeiro servico operacional."
              actionLabel="Ir para o formulario"
              onAction={() => {
                formSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
          ) : null}

          {!servicesQuery.isLoading &&
          !servicesQuery.isError &&
          services.length > 0 ? (
            <ServicesList
              services={services}
              tenantTimezone={auth.tenant?.timezone ?? "UTC"}
              canManageServices={canManageServices}
              onEditService={(service) => {
                setEditingService(service);
                formSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              onDeleteService={(service) => {
                setDeleteErrorMessage(null);
                setDeletingService(service);
              }}
            />
          ) : null}
        </div>
      </div>

      <DeleteServiceDialog
        service={deletingService}
        isOpen={deletingService !== null}
        isSubmitting={deleteServiceMutation.isPending}
        errorMessage={deleteErrorMessage}
        onClose={() => {
          setDeletingService(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={() => {
          void handleDeleteService();
        }}
      />
    </>
  );
}
