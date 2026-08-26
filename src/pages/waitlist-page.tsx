import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Badge } from "@/components/flow/badge";
import { Input } from "@/components/flow/input";
import { Select, type SelectOption } from "@/components/flow/select";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import { SectionHeading } from "@/components/flow/section-heading";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useServicesQuery } from "@/hooks/use-services-query";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useWaitlistQuery } from "@/hooks/use-waitlist-query";
import { useCreateWaitlistMutation } from "@/hooks/use-create-waitlist-mutation";
import { useDeleteWaitlistMutation } from "@/hooks/use-delete-waitlist-mutation";
import { ApiError } from "@/types/api";
import type {
  CreateWaitlistInput,
  WaitlistEntry,
  WaitlistEntryStatus,
  WaitlistPeriod,
  WaitlistFilters,
  WaitlistPrefillParams,
} from "@/types/waitlist";
import type { Service } from "@/types/service";
import type { Professional } from "@/types/professional";

interface DraftFormState {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  employeeId: string;
  preferredDate: string;
  preferredPeriod: string;
  notes: string;
}

const emptyDraftFormState: DraftFormState = {
  customerName: "",
  customerPhone: "",
  serviceId: "",
  employeeId: "",
  preferredDate: "",
  preferredPeriod: "",
  notes: "",
};

const statusOptions: Array<{ value: WaitlistEntryStatus; label: string }> = [
  { value: "WAITING", label: "Aguardando" },
  { value: "OFFERED", label: "Oferta enviada" },
  { value: "BOOKED", label: "Reservado" },
  { value: "EXPIRED", label: "Expirado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const periodOptions: Array<{ value: WaitlistPeriod; label: string }> = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
];

function formatDateOnly(value: string | null | undefined, timezone: string) {
  if (!value) {
    return "-";
  }

  const date = DateTime.fromISO(value, { zone: "utc" }).setZone(timezone);
  if (!date.isValid) {
    return "-";
  }

  return date.toFormat("dd/LL/yyyy");
}

function formatDateTime(value: string, timezone: string) {
  const date = DateTime.fromISO(value, { zone: "utc" }).setZone(timezone);
  if (!date.isValid) {
    return "-";
  }

  return date.toFormat("dd/LL/yyyy HH:mm");
}

function statusLabel(status: WaitlistEntryStatus) {
  switch (status) {
    case "WAITING":
      return "Aguardando";
    case "OFFERED":
      return "Oferta enviada";
    case "BOOKED":
      return "Reservado";
    case "EXPIRED":
      return "Expirado";
    case "CANCELLED":
      return "Cancelado";
  }
}

function statusVariant(status: WaitlistEntryStatus) {
  switch (status) {
    case "WAITING":
      return "warning";
    case "OFFERED":
      return "info";
    case "BOOKED":
      return "success";
    case "EXPIRED":
      return "danger";
    case "CANCELLED":
      return "neutral";
  }
}

function resolvePeriodLabel(period: WaitlistPeriod | null | undefined) {
  if (!period) {
    return "Qualquer período";
  }

  switch (period) {
    case "MORNING":
      return "Manhã";
    case "AFTERNOON":
      return "Tarde";
    case "EVENING":
      return "Noite";
  }
}

function resolveApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Nao foi possivel concluir a operacao.";
}

function normalizePhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : "";
}

function resolveServiceLabel(service: Service | undefined) {
  return service ? service.name : "Servico removido";
}

function resolveProfessionalLabel(professional: Professional | undefined) {
  return professional ? professional.name : "Profissional removido";
}

function readPrefillFromSearchParams(searchParams: URLSearchParams): WaitlistPrefillParams {
  const preferredPeriod = searchParams.get("preferredPeriod");

  return {
    customerName: searchParams.get("customerName") ?? undefined,
    customerPhone: searchParams.get("customerPhone") ?? undefined,
    serviceId: searchParams.get("serviceId") ?? undefined,
    employeeId: searchParams.get("employeeId") ?? undefined,
    preferredDate: searchParams.get("preferredDate") ?? undefined,
    preferredPeriod:
      preferredPeriod === "MORNING" ||
      preferredPeriod === "AFTERNOON" ||
      preferredPeriod === "EVENING"
        ? preferredPeriod
        : undefined,
    notes: searchParams.get("notes") ?? undefined,
  };
}

export function WaitlistPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const servicesQuery = useServicesQuery();
  const professionalsQuery = useProfessionalsQuery();

  const [draftFilters, setDraftFilters] = useState<WaitlistFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<WaitlistFilters>({});
  const [form, setForm] = useState<DraftFormState>(emptyDraftFormState);
  const prefill = useMemo(() => readPrefillFromSearchParams(searchParams), [searchParams]);

  const waitlistQuery = useWaitlistQuery(appliedFilters);
  const createWaitlistMutation = useCreateWaitlistMutation();
  const deleteWaitlistMutation = useDeleteWaitlistMutation();

  const isAllowed = useMemo(
    () => ["admin", "system-admin"].includes(auth.user?.role ?? ""),
    [auth.user?.role],
  );

  const serviceOptions: SelectOption[] = useMemo(() => {
    const services = servicesQuery.data?.services ?? [];
    return services.map((service) => ({
      label: service.name,
      value: service.id,
    }));
  }, [servicesQuery.data?.services]);

  const professionalOptions: SelectOption[] = useMemo(() => {
    const professionals = professionalsQuery.data?.professionals ?? [];
    return professionals.map((professional) => ({
      label: professional.name,
      value: professional.id,
    }));
  }, [professionalsQuery.data?.professionals]);

  const items = waitlistQuery.data?.items ?? [];
  const activeCount = items.filter((item) => item.status === "WAITING").length;
  const offeredCount = items.filter((item) => item.status === "OFFERED").length;

  useEffect(() => {
    if (
      !prefill.customerName &&
      !prefill.customerPhone &&
      !prefill.serviceId &&
      !prefill.employeeId &&
      !prefill.preferredDate &&
      !prefill.preferredPeriod &&
      !prefill.notes
    ) {
      return;
    }

    setForm((current) => ({
      ...current,
      customerName: prefill.customerName ?? current.customerName,
      customerPhone: prefill.customerPhone ?? current.customerPhone,
      serviceId: prefill.serviceId ?? current.serviceId,
      employeeId: prefill.employeeId ?? current.employeeId,
      preferredDate: prefill.preferredDate ?? current.preferredDate,
      preferredPeriod: prefill.preferredPeriod ?? current.preferredPeriod,
      notes: prefill.notes ?? current.notes,
    }));
  }, [prefill]);

  function handleApplyFilters() {
    setAppliedFilters({
      status: draftFilters.status || undefined,
      serviceId: draftFilters.serviceId || undefined,
      employeeId: draftFilters.employeeId || undefined,
      preferredDate: draftFilters.preferredDate || undefined,
      preferredPeriod: draftFilters.preferredPeriod || undefined,
    });
  }

  function handleClearFilters() {
    const nextFilters: WaitlistFilters = {};
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerName = form.customerName.trim();
    const customerPhone = normalizePhoneDigits(form.customerPhone);
    const serviceId = form.serviceId.trim();
    const employeeId = form.employeeId.trim();
    const preferredDate = form.preferredDate.trim();
    const preferredPeriod = form.preferredPeriod.trim();
    const notes = form.notes.trim();

    if (!customerName || !customerPhone || !serviceId) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe nome, telefone e servico.",
        variant: "warning",
      });
      return;
    }

    const payload: CreateWaitlistInput = {
      customerName,
      customerPhone,
      serviceId,
      employeeId: employeeId || undefined,
      preferredDate: preferredDate || undefined,
      preferredPeriod: (preferredPeriod || undefined) as WaitlistPeriod | undefined,
      notes: notes || undefined,
    };

    try {
      const result = await createWaitlistMutation.mutateAsync(payload);
      setForm(emptyDraftFormState);
      toast({
        title: result.wasCreated ? "Cliente adicionado" : "Cliente ja estava na fila",
        description: result.wasCreated
          ? "A entrada foi criada com sucesso."
          : "A duplicidade foi evitada e a entrada existente foi mantida.",
        variant: result.wasCreated ? "success" : "info",
      });
    } catch (error) {
      toast({
        title: "Falha ao adicionar cliente",
        description: resolveApiErrorMessage(error),
        variant: "danger",
      });
    }
  }

  async function handleRemove(entry: WaitlistEntry) {
    const confirmed = window.confirm(
      `Remover ${entry.customerName} da lista de espera?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWaitlistMutation.mutateAsync(entry.id);
      toast({
        title: "Entrada removida",
        description: "A entrada foi cancelada com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha ao remover entrada",
        description: resolveApiErrorMessage(error),
        variant: "danger",
      });
    }
  }

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas admin pode gerenciar a lista de espera."
      />
    );
  }

  return (
    <>
      <SectionHeading
        eyebrow="Operacao"
        title="Lista de Espera"
        description="Cadastre interessados manualmente, acompanhe a fila e remova entradas quando o cliente desistir."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <Card variant="premium" padding="lg" className="min-w-0">
          <CardTitle>Nova entrada</CardTitle>
          <CardDescription className="mt-2">
            A recepcao pode incluir clientes manualmente quando o horario estiver lotado.
          </CardDescription>

          <form className="mt-6 grid gap-4" onSubmit={handleCreate}>
            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Nome do cliente
              <Input
                value={form.customerName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerName: event.target.value }))
                }
                placeholder="Nome completo"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Telefone
              <Input
                value={form.customerPhone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerPhone: event.target.value }))
                }
                placeholder="(11) 99999-9999"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Servico
              <Select
                value={form.serviceId}
                options={serviceOptions}
                placeholder="Selecione um servico"
                onValueChange={(serviceId) =>
                  setForm((current) => ({ ...current, serviceId }))
                }
                disabled={servicesQuery.isLoading}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Profissional
              <Select
                value={form.employeeId}
                options={professionalOptions}
                placeholder="Qualquer profissional"
                onValueChange={(employeeId) =>
                  setForm((current) => ({ ...current, employeeId }))
                }
                disabled={professionalsQuery.isLoading}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Data desejada
                <Input
                  value={form.preferredDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, preferredDate: event.target.value }))
                  }
                  type="date"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Periodo
                <Select
                  value={form.preferredPeriod}
                  options={periodOptions}
                  placeholder="Qualquer período"
                  onValueChange={(preferredPeriod) =>
                    setForm((current) => ({ ...current, preferredPeriod }))
                  }
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Observacoes
              <Textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Detalhes opcionais para a recepcao"
                rows={5}
              />
              <span className="text-xs text-[var(--theme-text-muted)]">
                Não inclua informações clínicas ou dados pessoais sensíveis desnecessários.
              </span>
            </label>

            <Button type="submit" size="md" disabled={createWaitlistMutation.isPending}>
              {createWaitlistMutation.isPending ? "Salvando..." : "Adicionar a fila"}
            </Button>
          </form>
        </Card>

        <div className="grid gap-6 content-start">
          <Card variant="glass" padding="lg" className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-1">
                <CardTitle>Fila atual ({items.length})</CardTitle>
                <CardDescription>
                  {activeCount} aguardando, {offeredCount} com oferta enviada.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void waitlistQuery.refetch();
                  }}
                  disabled={waitlistQuery.isFetching}
                >
                  {waitlistQuery.isFetching ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Status
                <Select
                  value={draftFilters.status ?? ""}
                  options={statusOptions}
                  placeholder="Todos"
                  onValueChange={(status) =>
                    setDraftFilters((current) => ({
                      ...current,
                      status: status ? (status as WaitlistEntryStatus) : undefined,
                    }))
                  }
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Servico
                <Select
                  value={draftFilters.serviceId ?? ""}
                  options={serviceOptions}
                  placeholder="Todos"
                  onValueChange={(serviceId) =>
                    setDraftFilters((current) => ({
                      ...current,
                      serviceId: serviceId || undefined,
                    }))
                  }
                  disabled={servicesQuery.isLoading}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Profissional
                <Select
                  value={draftFilters.employeeId ?? ""}
                  options={professionalOptions}
                  placeholder="Todos"
                  onValueChange={(employeeId) =>
                    setDraftFilters((current) => ({
                      ...current,
                      employeeId: employeeId || undefined,
                    }))
                  }
                  disabled={professionalsQuery.isLoading}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                Data desejada
                <Input
                  value={draftFilters.preferredDate ?? ""}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      preferredDate: event.target.value || undefined,
                    }))
                  }
                  type="date"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)] xl:col-span-2">
                Periodo
                <Select
                  value={draftFilters.preferredPeriod ?? ""}
                  options={periodOptions}
                  placeholder="Qualquer período"
                  onValueChange={(preferredPeriod) =>
                    setDraftFilters((current) => ({
                      ...current,
                      preferredPeriod: preferredPeriod
                        ? (preferredPeriod as WaitlistPeriod)
                        : undefined,
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="secondary" size="md" onClick={handleApplyFilters}>
                Aplicar filtros
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            </div>
          </Card>

          {servicesQuery.isLoading || professionalsQuery.isLoading || waitlistQuery.isLoading ? (
            <Card variant="glass" padding="lg" className="grid gap-4">
              <div className="flex items-center gap-2 text-text-soft">
                <Loader2 size={16} className="animate-spin" />
                Carregando lista de espera...
              </div>
            </Card>
          ) : null}

          {waitlistQuery.isError ? (
            <PageState
              title="Falha ao carregar a lista"
              description="Nao foi possivel buscar as entradas da fila agora."
              actionLabel="Tentar novamente"
              onAction={() => {
                void waitlistQuery.refetch();
              }}
            />
          ) : null}

          {!waitlistQuery.isLoading && !waitlistQuery.isError && items.length === 0 ? (
            <PageState
              title="Nenhuma entrada encontrada"
              description="A fila esta vazia com os filtros selecionados."
              actionLabel="Recarregar"
              onAction={() => {
                void waitlistQuery.refetch();
              }}
            />
          ) : null}

          {!waitlistQuery.isLoading && !waitlistQuery.isError && items.length > 0 ? (
            <div className="grid gap-4">
              {items.map((entry) => {
                const service = servicesQuery.data?.services?.find((item) => item.id === entry.serviceId);
                const professional = professionalsQuery.data?.professionals?.find(
                  (item) => item.id === entry.employeeId,
                );

                return (
                  <Card key={entry.id} variant="glass" padding="md" className="min-w-0">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                      <div className="min-w-0 grid gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <CardTitle className="text-lg">{entry.customerName}</CardTitle>
                          <Badge variant={statusVariant(entry.status)}>{statusLabel(entry.status)}</Badge>
                        </div>

                        <div className="grid gap-2 text-sm text-text-soft sm:grid-cols-2">
                          <p>
                            <span className="font-semibold text-[var(--theme-text-primary)]">
                              Telefone:
                            </span>{" "}
                            {entry.customerPhone}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--theme-text-primary)]">
                              Servico:
                            </span>{" "}
                            {resolveServiceLabel(service)}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--theme-text-primary)]">
                              Profissional:
                            </span>{" "}
                            {resolveProfessionalLabel(professional)}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--theme-text-primary)]">
                              Preferencia:
                            </span>{" "}
                            {formatDateOnly(entry.preferredDate, auth.tenant?.timezone ?? "UTC")}{" "}
                            {entry.preferredPeriod ? `- ${resolvePeriodLabel(entry.preferredPeriod)}` : ""}
                          </p>
                        </div>

                        {entry.notes ? (
                          <p className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 text-sm leading-7 text-text-soft">
                            {entry.notes}
                          </p>
                        ) : null}

                        <p className="text-xs text-text-soft">
                          Criado em {formatDateTime(entry.createdAt, auth.tenant?.timezone ?? "UTC")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 md:justify-end">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            void handleRemove(entry);
                          }}
                          disabled={deleteWaitlistMutation.isPending}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
