import { useMemo, useState } from "react";
import { Card } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { AvailableSlotsList } from "@/components/slots/available-slots-list";
import { SlotSearchActions } from "@/components/slots/slot-search-actions";
import { SlotSearchFilters } from "@/components/slots/slot-search-filters";
import { SlotsEmptyState } from "@/components/slots/slots-empty-state";
import { SlotsErrorState } from "@/components/slots/slots-error-state";
import { TenantTimezoneInfo } from "@/components/slots/tenant-timezone-info";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useAvailableSlotsQuery } from "@/hooks/use-available-slots-query";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { ApiError } from "@/types/api";
import type { AvailableSlot, ListAvailableSlotsInput } from "@/types/slot";

const initialFilters: ListAvailableSlotsInput = {
  professionalId: "",
  serviceId: "",
  date: "",
};

function isSameSearch(
  left: ListAvailableSlotsInput | null,
  right: ListAvailableSlotsInput
) {
  if (!left) {
    return false;
  }

  return (
    left.professionalId === right.professionalId &&
    left.serviceId === right.serviceId &&
    left.date === right.date
  );
}

function resolveSlotsErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Nao foi possivel concluir a consulta de slots. Tente novamente em instantes.";
}

function SlotsLoadingState() {
  return (
    <Card variant="glass" padding="lg" className="grid gap-4" aria-live="polite">
      <div className="h-6 w-56 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </Card>
  );
}

export function SlotsPage() {
  const auth = useAuth();
  const professionalsQuery = useProfessionalsQuery();
  const servicesQuery = useServicesQuery();
  const [filters, setFilters] = useState<ListAvailableSlotsInput>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<ListAvailableSlotsInput | null>(null);
  const [selectedSlotStart, setSelectedSlotStart] = useState<string | null>(null);
  const availableSlotsQuery = useAvailableSlotsQuery(submittedFilters);

  const professionals = professionalsQuery.data?.professionals ?? [];
  const services = servicesQuery.data?.services ?? [];
  const hasCompleteFilters = Boolean(filters.professionalId && filters.serviceId && filters.date);
  const activeTenantTimezone =
    availableSlotsQuery.data?.tenantTimezone ?? auth.tenant?.timezone ?? "UTC";
  const isBootstrapLoading = professionalsQuery.isLoading || servicesQuery.isLoading;
  const isBootstrapError = professionalsQuery.isError || servicesQuery.isError;
  const slots = availableSlotsQuery.data?.slots ?? [];

  const bootstrapErrorMessage = useMemo(() => {
    if (professionalsQuery.isError) {
      return "Nao foi possivel carregar os profissionais necessarios para a consulta.";
    }

    if (servicesQuery.isError) {
      return "Nao foi possivel carregar os servicos necessarios para a consulta.";
    }

    return "";
  }, [professionalsQuery.isError, servicesQuery.isError]);

  function handleSearch() {
    if (!hasCompleteFilters) {
      return;
    }

    setSelectedSlotStart(null);

    if (isSameSearch(submittedFilters, filters)) {
      void availableSlotsQuery.refetch();
      return;
    }

    setSubmittedFilters({ ...filters });
  }

  function handleRetry() {
    void availableSlotsQuery.refetch();
  }

  function handleSelectSlot(slot: AvailableSlot) {
    setSelectedSlotStart(slot.start);
  }

  return (
    <>
      <SectionHeading
        eyebrow="Slot Calculation"
        title="Consulta de horarios"
        description="Consuma o contrato de slots do backend sem recalcular, sem reordenar e sem interpretar disponibilidade no frontend."
      />

      <div className="mt-8 grid gap-6">
        <TenantTimezoneInfo timezone={activeTenantTimezone} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <SlotSearchFilters
            professionals={professionals}
            services={services}
            filters={filters}
            disabled={isBootstrapLoading}
            onFiltersChange={setFilters}
          />

          <SlotSearchActions
            canSearch={hasCompleteFilters}
            isSearching={availableSlotsQuery.isLoading || availableSlotsQuery.isFetching}
            onSearch={handleSearch}
          />
        </div>

        {isBootstrapLoading ? (
          <PageState
            title="Carregando contexto da consulta"
            description="Precisamos dos cadastros de profissionais e servicos antes de consultar os horarios."
          />
        ) : null}

        {isBootstrapError ? (
          <SlotsErrorState
            message={bootstrapErrorMessage}
            onRetry={() => {
              void professionalsQuery.refetch();
              void servicesQuery.refetch();
            }}
          />
        ) : null}

        {!isBootstrapLoading && !isBootstrapError && submittedFilters === null ? (
          <PageState
            title="Preencha os filtros para consultar"
            description="Selecione profissional, servico e data. Depois use Buscar horarios para consultar a API."
          />
        ) : null}

        {!isBootstrapLoading &&
        !isBootstrapError &&
        submittedFilters !== null &&
        (availableSlotsQuery.isLoading || availableSlotsQuery.isFetching) ? (
          <SlotsLoadingState />
        ) : null}

        {!isBootstrapLoading &&
        !isBootstrapError &&
        submittedFilters !== null &&
        availableSlotsQuery.isError &&
        !availableSlotsQuery.isFetching ? (
          <SlotsErrorState
            message={resolveSlotsErrorMessage(availableSlotsQuery.error)}
            onRetry={handleRetry}
          />
        ) : null}

        {!isBootstrapLoading &&
        !isBootstrapError &&
        submittedFilters !== null &&
        !availableSlotsQuery.isLoading &&
        !availableSlotsQuery.isFetching &&
        !availableSlotsQuery.isError &&
        slots.length === 0 ? <SlotsEmptyState /> : null}

        {!isBootstrapLoading &&
        !isBootstrapError &&
        submittedFilters !== null &&
        !availableSlotsQuery.isLoading &&
        !availableSlotsQuery.isFetching &&
        !availableSlotsQuery.isError &&
        slots.length > 0 ? (
          <AvailableSlotsList
            slots={slots}
            tenantTimezone={activeTenantTimezone}
            selectedSlotStart={selectedSlotStart}
            onSelect={handleSelectSlot}
          />
        ) : null}
      </div>
    </>
  );
}
