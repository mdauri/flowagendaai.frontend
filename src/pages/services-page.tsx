import { useRef } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { ServiceCreateForm } from "@/components/services/service-create-form";
import { ServicesList } from "@/components/services/services-list";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useCreateServiceMutation } from "@/hooks/use-create-service-mutation";
import { useServicesQuery } from "@/hooks/use-services-query";
import type { CreateServiceInput } from "@/types/service";

export function ServicesPage() {
  const auth = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const servicesQuery = useServicesQuery();
  const createServiceMutation = useCreateServiceMutation();

  function handleCreateService(input: CreateServiceInput) {
    return createServiceMutation.mutateAsync(input);
  }

  const services = servicesQuery.data?.services ?? [];

  return (
    <>
      <SectionHeading
        eyebrow="Operational Core"
        title="Servicos"
        description="Gerencie o catalogo inicial de servicos usando o contrato real do backend, sem antecipar scheduling."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div ref={formSectionRef}>
          <ServiceCreateForm
            onSubmit={handleCreateService}
            isSubmitting={createServiceMutation.isPending}
          />
        </div>

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
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
