import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Card } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { AvailableSlotsList } from "@/components/slots/available-slots-list";
import {
  BookingConfirmationPanel,
  type BookingConfirmationPanelState,
} from "@/components/slots/booking-confirmation-panel";
import { SlotSearchActions } from "@/components/slots/slot-search-actions";
import { SlotSearchFilters } from "@/components/slots/slot-search-filters";
import { SlotsEmptyState } from "@/components/slots/slots-empty-state";
import { SlotsErrorState } from "@/components/slots/slots-error-state";
import { TenantTimezoneInfo } from "@/components/slots/tenant-timezone-info";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useAvailableDatesQuery } from "@/hooks/use-available-dates-query";
import {
  getAvailableSlotsQueryKey,
  useAvailableSlotsQuery,
} from "@/hooks/use-available-slots-query";
import { useCreateBookingMutation } from "@/hooks/use-create-booking-mutation";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { ApiError, isBookingConflictApiError } from "@/types/api";
import type { CreateBookingResponse } from "@/types/booking";
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

function resolveBookingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const normalizedMessage = error.message.toLowerCase();
    const outsideBusinessHours =
      error.code === "INVALID_INPUT" &&
      (normalizedMessage.includes("horario de funcionamento") ||
        normalizedMessage.includes("horário de funcionamento"));

    if (outsideBusinessHours) {
      return "Este horário está fora do período de funcionamento do estabelecimento.";
    }
  }

  return "Nao foi possivel confirmar o agendamento agora. Tente novamente.";
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
  const [calendarMonth, setCalendarMonth] = useState(() => DateTime.now().startOf("month"));
  const [submittedFilters, setSubmittedFilters] = useState<ListAvailableSlotsInput | null>(null);
  const [selectedSlotStart, setSelectedSlotStart] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<CreateBookingResponse | null>(null);
  const availableSlotsQuery = useAvailableSlotsQuery(submittedFilters);

  const professionals = professionalsQuery.data?.professionals ?? [];
  const services = servicesQuery.data?.services ?? [];
  const hasCompleteFilters = Boolean(filters.professionalId && filters.serviceId && filters.date);
  const activeTenantTimezone =
    availableSlotsQuery.data?.tenantTimezone ?? auth.tenant?.timezone ?? "UTC";
  const calendarMonthInTimezone = useMemo(
    () => calendarMonth.setZone(activeTenantTimezone).startOf("month"),
    [calendarMonth, activeTenantTimezone]
  );
  const availabilityRange = useMemo(() => {
    if (!filters.professionalId || !filters.serviceId) {
      return null;
    }

    return {
      professionalId: filters.professionalId,
      serviceId: filters.serviceId,
      from: calendarMonthInTimezone.startOf("month").toISODate()!,
      to: calendarMonthInTimezone.endOf("month").toISODate()!,
    };
  }, [filters.professionalId, filters.serviceId, calendarMonthInTimezone]);
  const availableDatesQuery = useAvailableDatesQuery(availabilityRange);
  const availableDates = useMemo(
    () => new Set(availableDatesQuery.data?.availableDates ?? []),
    [availableDatesQuery.data?.availableDates]
  );
  const isSelectedDateAvailable = Boolean(filters.date && availableDates.has(filters.date));
  const isBootstrapLoading = professionalsQuery.isLoading || servicesQuery.isLoading;
  const isBootstrapError = professionalsQuery.isError || servicesQuery.isError;
  const slots = availableSlotsQuery.data?.slots ?? [];
  const slotsQueryKey = useMemo(() => getAvailableSlotsQueryKey(submittedFilters), [submittedFilters]);
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.start === selectedSlotStart) ?? null,
    [selectedSlotStart, slots]
  );
  const selectedProfessionalName = useMemo(
    () => professionals.find((professional) => professional.id === filters.professionalId)?.name,
    [filters.professionalId, professionals]
  );
  const selectedServiceName = useMemo(
    () => services.find((service) => service.id === filters.serviceId)?.name,
    [filters.serviceId, services]
  );
  const createBookingMutation = useCreateBookingMutation({
    slotsQueryKey,
    onConflict: () => {
      setSelectedSlotStart(null);
    },
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setSelectedSlotStart(null);
    },
  });
  const isBookingPending = createBookingMutation.isPending;

  const bootstrapErrorMessage = useMemo(() => {
    if (professionalsQuery.isError) {
      return "Nao foi possivel carregar os profissionais necessarios para a consulta.";
    }

    if (servicesQuery.isError) {
      return "Nao foi possivel carregar os servicos necessarios para a consulta.";
    }

    return "";
  }, [professionalsQuery.isError, servicesQuery.isError]);

  const availabilityErrorMessage = useMemo(() => {
    if (!availableDatesQuery.isError) {
      return null;
    }

    if (availableDatesQuery.error instanceof ApiError) {
      return availableDatesQuery.error.message;
    }

    return "Nao foi possivel carregar a disponibilidade do mes selecionado.";
  }, [availableDatesQuery.error, availableDatesQuery.isError]);

  function handleSearch() {
    if (!hasCompleteFilters || !isSelectedDateAvailable || isBookingPending) {
      return;
    }

    setSelectedSlotStart(null);
    setConfirmedBooking(null);
    createBookingMutation.reset();

    if (isSameSearch(submittedFilters, filters)) {
      void availableSlotsQuery.refetch();
      return;
    }

    setSubmittedFilters({ ...filters });
  }

  function handleRetry() {
    void availableSlotsQuery.refetch();
  }

  function handleFiltersChange(nextFilters: ListAvailableSlotsInput) {
    const professionalChanged = nextFilters.professionalId !== filters.professionalId;
    const serviceChanged = nextFilters.serviceId !== filters.serviceId;
    const shouldResetDate = professionalChanged || serviceChanged;
    const normalizedDate = nextFilters.date
      ? DateTime.fromISO(nextFilters.date, { zone: activeTenantTimezone })
      : null;

    if (normalizedDate?.isValid) {
      setCalendarMonth(normalizedDate.startOf("month"));
    }

    setFilters({
      ...nextFilters,
      date: shouldResetDate ? "" : nextFilters.date,
    });

    if (shouldResetDate) {
      setSubmittedFilters(null);
      setSelectedSlotStart(null);
      setConfirmedBooking(null);
      createBookingMutation.reset();
    }
  }

  function handleSelectSlot(slot: AvailableSlot) {
    if (isBookingPending) {
      return;
    }

    if (confirmedBooking) {
      setConfirmedBooking(null);
      createBookingMutation.reset();
    }

    setSelectedSlotStart(slot.start);
  }

  function handleConfirmBooking() {
    if (!submittedFilters || !selectedSlot || isBookingPending) {
      return;
    }

    setConfirmedBooking(null);
    createBookingMutation.mutate({
      professionalId: submittedFilters.professionalId,
      serviceId: submittedFilters.serviceId,
      start: selectedSlot.start,
    });
  }

  function handleRetryBooking() {
    handleConfirmBooking();
  }

  function handleRefreshSlots() {
    if (isBookingPending) {
      return;
    }

    setSelectedSlotStart(null);
    createBookingMutation.reset();
    void availableSlotsQuery.refetch();
  }

  function handleResetBookingSuccess() {
    setConfirmedBooking(null);
    createBookingMutation.reset();
  }

  const bookingPanelState: BookingConfirmationPanelState = (() => {
    if (confirmedBooking) {
      return "success";
    }

    if (createBookingMutation.isPending) {
      return "pending";
    }

    if (createBookingMutation.isError) {
      const error = createBookingMutation.error;

      if (isBookingConflictApiError(error)) {
        return "conflict";
      }

      return "error";
    }

    return "idle";
  })();
  const bookingErrorDescription =
    bookingPanelState === "error"
      ? resolveBookingErrorMessage(createBookingMutation.error)
      : undefined;

  const showBookingPanel =
    submittedFilters !== null &&
    !isBootstrapLoading &&
    !isBootstrapError &&
    !availableSlotsQuery.isLoading &&
    !availableSlotsQuery.isFetching &&
    !availableSlotsQuery.isError &&
    (slots.length > 0 || confirmedBooking !== null || createBookingMutation.isError);

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
            timezone={activeTenantTimezone}
            calendarMonth={calendarMonthInTimezone}
            availableDates={availableDates}
            canLoadAvailability={Boolean(filters.professionalId && filters.serviceId)}
            isAvailabilityLoading={availableDatesQuery.isLoading || availableDatesQuery.isFetching}
            availabilityErrorMessage={availabilityErrorMessage}
            disabled={isBootstrapLoading}
            onCalendarMonthChange={setCalendarMonth}
            onFiltersChange={handleFiltersChange}
          />

          <SlotSearchActions
            canSearch={hasCompleteFilters && isSelectedDateAvailable}
            isSearching={availableSlotsQuery.isLoading || availableSlotsQuery.isFetching}
            disabled={isBookingPending}
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

        {showBookingPanel ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <AvailableSlotsList
              slots={slots}
              tenantTimezone={activeTenantTimezone}
              selectedSlotStart={selectedSlotStart}
              disabled={isBookingPending || confirmedBooking !== null}
              onSelect={handleSelectSlot}
            />

            <BookingConfirmationPanel
              state={bookingPanelState}
              selectedSlot={selectedSlot}
              confirmedBooking={confirmedBooking}
              tenantTimezone={activeTenantTimezone}
              professionalName={selectedProfessionalName}
              serviceName={selectedServiceName}
              canConfirm={Boolean(selectedSlot) && !isBookingPending}
              onConfirm={handleConfirmBooking}
              onRetry={handleRetryBooking}
              onRefreshSlots={handleRefreshSlots}
              onResetSuccess={handleResetBookingSuccess}
              errorDescription={bookingErrorDescription}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
