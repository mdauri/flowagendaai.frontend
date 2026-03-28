import { useRef } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { ProfessionalCreateForm } from "@/components/professionals/professional-create-form";
import { ProfessionalsList } from "@/components/professionals/professionals-list";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProfessionalMutation } from "@/hooks/use-create-professional-mutation";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import type { CreateProfessionalInput } from "@/types/professional";

export function ProfessionalsPage() {
  const auth = useAuth();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const professionalsQuery = useProfessionalsQuery();
  const createProfessionalMutation = useCreateProfessionalMutation();

  async function handleCreateProfessional(input: CreateProfessionalInput) {
    await createProfessionalMutation.mutateAsync(input);
  }

  const professionals = professionalsQuery.data?.professionals ?? [];

  return (
    <>
      <SectionHeading
        eyebrow="Operational Core"
        title="Profissionais"
        description="Gerencie o cadastro inicial dos profissionais usando o contrato real do backend, sem acoplar regra de agenda no frontend."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div ref={formSectionRef}>
          <ProfessionalCreateForm
            onSubmit={handleCreateProfessional}
            isSubmitting={createProfessionalMutation.isPending}
          />
        </div>

        <div className="grid gap-6">
          <Card variant="glass" padding="lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Listagem operacional</CardTitle>
                <CardDescription className="mt-3">
                  Este modulo ja opera com `GET /professionals` e
                  `POST /professionals`, mantendo a tela concentrada em create,
                  list e feedback visual.
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
                formSectionRef.current?.scrollIntoView({
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
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
