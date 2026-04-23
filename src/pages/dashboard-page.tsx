import * as React from "react";
import { DateTime } from "luxon";
import { DashboardAgendaList } from "@/components/dashboard/dashboard-agenda-list";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardOccupancyCard } from "@/components/dashboard/dashboard-occupancy-card";
import { DashboardProfessionalOccupancy } from "@/components/dashboard/dashboard-professional-occupancy";
import { DashboardUpcomingList } from "@/components/dashboard/dashboard-upcoming-list";
import { DashboardBookingDetailsDialog } from "@/components/dashboard/dashboard-booking-details-dialog";
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { RescheduleBookingDialog } from "@/components/bookings/reschedule-booking-dialog";
import { useDashboardSummaryQuery } from "@/hooks/use-dashboard-summary-query";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { useBookingByIdQuery } from "@/hooks/use-booking-by-id-query";
import { useCancelBookingMutation } from "@/hooks/use-cancel-booking-mutation";
import { useRescheduleBookingMutation } from "@/hooks/use-reschedule-booking-mutation";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError, isBookingAlreadyResolvedApiError, isBookingConflictApiError } from "@/types/api";

function getInitialDashboardDate() {
  return DateTime.local().toISODate() ?? "";
}

type DashboardStatusFilter = "" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export function DashboardPage() {
  const [date, setDate] = React.useState(getInitialDashboardDate);
  const [professionalId, setProfessionalId] = React.useState("");
  const [serviceId, setServiceId] = React.useState("");
  const [status, setStatus] = React.useState<DashboardStatusFilter>("");
  const [customerQuery, setCustomerQuery] = React.useState("");
  const normalizedCustomerDigits = customerQuery.replace(/\D/g, "");
  const customerPhone = normalizedCustomerDigits.length >= 6 ? normalizedCustomerDigits : undefined;
  const customerName = customerPhone
    ? undefined
    : customerQuery.trim().length > 0
      ? customerQuery.trim()
      : undefined;
  const professionalsQuery = useProfessionalsQuery();
  const servicesQuery = useServicesQuery();
  const dashboardSummaryQuery = useDashboardSummaryQuery({
    date,
    professionalId: professionalId || undefined,
    serviceId: serviceId || undefined,
    status: status || undefined,
    customerName,
    customerPhone,
  });
  const cancelBookingMutation = useCancelBookingMutation();
  const rescheduleBookingMutation = useRescheduleBookingMutation();
  const [busyBookingId, setBusyBookingId] = React.useState<string | null>(null);
  const [cancelDialogBooking, setCancelDialogBooking] = React.useState<DashboardSummaryBookingItem | null>(
    null
  );
  const [rescheduleDialogBooking, setRescheduleDialogBooking] =
    React.useState<DashboardSummaryBookingItem | null>(null);
  const [detailsBookingId, setDetailsBookingId] = React.useState<string | null>(null);
  const [detailsBookingSummary, setDetailsBookingSummary] =
    React.useState<DashboardSummaryBookingItem | null>(null);
  const bookingDetailsQuery = useBookingByIdQuery(detailsBookingId);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = React.useState<string | null>(null);
  const isBootstrapLoading = professionalsQuery.isLoading || servicesQuery.isLoading;
  const isBootstrapError = professionalsQuery.isError || servicesQuery.isError;
  const professionals = professionalsQuery.data?.professionals ?? [];
  const services = servicesQuery.data?.services ?? [];

  const handleDateChange = React.useCallback((nextDate: string) => {
    if (!nextDate) {
      return;
    }

    setDate(nextDate);
  }, []);

  const handlePreviousDate = React.useCallback(() => {
    const previousDate = DateTime.fromISO(date).minus({ days: 1 }).toISODate();
    if (!previousDate) {
      return;
    }
    setDate(previousDate);
  }, [date]);

  const handleNextDate = React.useCallback(() => {
    const nextDate = DateTime.fromISO(date).plus({ days: 1 }).toISODate();
    if (!nextDate) {
      return;
    }
    setDate(nextDate);
  }, [date]);

  const handleToday = React.useCallback(() => {
    const today = DateTime.local().toISODate();
    if (!today) {
      return;
    }
    setDate(today);
  }, []);

  const handleTomorrow = React.useCallback(() => {
    const tomorrow = DateTime.local().plus({ days: 1 }).toISODate();
    if (!tomorrow) {
      return;
    }
    setDate(tomorrow);
  }, []);

  const handleClearFilters = React.useCallback(() => {
    setProfessionalId("");
    setServiceId("");
    setStatus("");
    setCustomerQuery("");
  }, []);

  const handleRequestCancelBooking = React.useCallback((booking: DashboardSummaryBookingItem) => {
    setFeedback(null);
    setCancelError(null);
    setCancelDialogBooking(booking);
  }, []);

  const handleRequestRescheduleBooking = React.useCallback((booking: DashboardSummaryBookingItem) => {
    setFeedback(null);
    setRescheduleError(null);
    setRescheduleDialogBooking(booking);
  }, []);

  const handleViewBookingDetails = React.useCallback((booking: DashboardSummaryBookingItem) => {
    setDetailsBookingId(booking.bookingId);
    setDetailsBookingSummary(booking);
  }, []);

  const handleConfirmCancelBooking = React.useCallback(
    async (input: { reason?: string }) => {
      if (!cancelDialogBooking) {
        return;
      }

      setCancelError(null);
      setBusyBookingId(cancelDialogBooking.bookingId);

      try {
        await cancelBookingMutation.mutateAsync({
          bookingId: cancelDialogBooking.bookingId,
          reason: input.reason,
        });
        setCancelDialogBooking(null);
        setFeedback("Agendamento cancelado com sucesso.");
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          setCancelError(
            "Este agendamento ja foi resolvido. Atualize a lista e tente novamente."
          );
          return;
        }

        setCancelError(
          error instanceof ApiError ? error.message : "Nao foi possivel cancelar agora. Tente novamente."
        );
      } finally {
        setBusyBookingId(null);
      }
    },
    [cancelBookingMutation, cancelDialogBooking]
  );

  const handleConfirmRescheduleBooking = React.useCallback(
    async (input: { start: string; reason?: string }) => {
      if (!rescheduleDialogBooking) {
        return;
      }

      setRescheduleError(null);
      setBusyBookingId(rescheduleDialogBooking.bookingId);

      try {
        await rescheduleBookingMutation.mutateAsync({
          bookingId: rescheduleDialogBooking.bookingId,
          start: input.start,
          reason: input.reason,
        });
        setRescheduleDialogBooking(null);
        setFeedback("Agendamento reagendado com sucesso.");
      } catch (error) {
        if (isBookingConflictApiError(error)) {
          setRescheduleError(
            "Este horario nao esta mais disponivel. Escolha outro horario e tente novamente."
          );
          return;
        }

        if (isBookingAlreadyResolvedApiError(error)) {
          setRescheduleError(
            "Este agendamento ja foi resolvido. Atualize a lista e tente novamente."
          );
          return;
        }

        setRescheduleError(
          error instanceof ApiError ? error.message : "Nao foi possivel reagendar agora. Tente novamente."
        );
      } finally {
        setBusyBookingId(null);
      }
    },
    [rescheduleBookingMutation, rescheduleDialogBooking]
  );

  if (isBootstrapLoading || dashboardSummaryQuery.isLoading) {
    return <DashboardLoadingState />;
  }

  if (isBootstrapError || dashboardSummaryQuery.isError) {
    return (
      <DashboardErrorState
        error={dashboardSummaryQuery.error}
        onRetry={() => {
          if (professionalsQuery.isError) {
            void professionalsQuery.refetch();
          }
          if (servicesQuery.isError) {
            void servicesQuery.refetch();
          }
          void dashboardSummaryQuery.refetch();
        }}
      />
    );
  }

  const summary = dashboardSummaryQuery.data;

  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-6">
      {feedback ? (
        <FeedbackBanner
          tone="info"
          title="Atualizacao registrada"
          description={feedback}
        />
      ) : null}

      <DashboardHeader
        date={summary.date}
        tenantTimezone={summary.tenantTimezone}
        professionalId={professionalId}
        serviceId={serviceId}
        status={status}
        customerQuery={customerQuery}
        professionals={professionals.map((item) => ({ id: item.id, name: item.name }))}
        services={services.map((item) => ({ id: item.id, name: item.name }))}
        onDateChange={handleDateChange}
        onPreviousDate={handlePreviousDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onTomorrow={handleTomorrow}
        onProfessionalChange={setProfessionalId}
        onServiceChange={setServiceId}
        onStatusChange={(nextStatus) => {
          if (
            nextStatus === "" ||
            nextStatus === "PENDING" ||
            nextStatus === "CONFIRMED" ||
            nextStatus === "CANCELLED" ||
            nextStatus === "COMPLETED"
          ) {
            setStatus(nextStatus);
          }
        }}
        onCustomerQueryChange={setCustomerQuery}
        onClearFilters={handleClearFilters}
      />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <DashboardOccupancyCard occupancy={summary.occupancy} />
        </div>
        <div className="xl:col-span-8">
          <DashboardKpiGrid summary={summary} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DashboardAgendaList
            bookings={summary.todayBookings}
            tenantTimezone={summary.tenantTimezone}
            busyBookingId={busyBookingId}
            onCancelBooking={handleRequestCancelBooking}
            onRescheduleBooking={handleRequestRescheduleBooking}
            onViewBookingDetails={handleViewBookingDetails}
          />
        </div>

        <div className="grid gap-6 xl:col-span-4">
          <DashboardUpcomingList
            bookings={summary.upcomingBookings}
            tenantTimezone={summary.tenantTimezone}
            busyBookingId={busyBookingId}
            onCancelBooking={handleRequestCancelBooking}
            onRescheduleBooking={handleRequestRescheduleBooking}
            onViewBookingDetails={handleViewBookingDetails}
          />
          <DashboardProfessionalOccupancy items={summary.professionalOccupancy} />
        </div>
      </div>

      <DashboardBookingDetailsDialog
        isOpen={Boolean(detailsBookingId)}
        booking={bookingDetailsQuery.data?.booking ?? null}
        fallbackBooking={detailsBookingSummary}
        tenantTimezone={summary.tenantTimezone}
        isLoading={bookingDetailsQuery.isLoading}
        errorMessage={
          bookingDetailsQuery.error instanceof ApiError
            ? bookingDetailsQuery.error.message
            : bookingDetailsQuery.isError
              ? "Nao foi possivel carregar os dados deste agendamento."
              : null
        }
        onRetry={() => {
          void bookingDetailsQuery.refetch();
        }}
        onClose={() => {
          setDetailsBookingId(null);
          setDetailsBookingSummary(null);
        }}
      />

      <CancelBookingDialog
        isOpen={Boolean(cancelDialogBooking)}
        context="dashboard"
        bookingSummary={{
          customerName: cancelDialogBooking?.customerName ?? null,
          customerPhone: cancelDialogBooking?.customerPhone ?? null,
          customerEmail: cancelDialogBooking?.customerEmail ?? null,
          professionalName: cancelDialogBooking?.professionalName ?? null,
          serviceName: cancelDialogBooking?.serviceName ?? null,
          start: cancelDialogBooking?.start ?? null,
          end: cancelDialogBooking?.end ?? null,
          status: cancelDialogBooking?.status ?? null,
        }}
        isSubmitting={cancelBookingMutation.isPending}
        errorMessage={cancelError}
        onClose={() => {
          if (cancelBookingMutation.isPending) {
            return;
          }
          setCancelDialogBooking(null);
          setCancelError(null);
        }}
        onConfirm={handleConfirmCancelBooking}
      />

      <RescheduleBookingDialog
        isOpen={Boolean(rescheduleDialogBooking)}
        bookingSummary={{
          bookingId: rescheduleDialogBooking?.bookingId ?? "",
          customerName: rescheduleDialogBooking?.customerName ?? null,
          professionalName: rescheduleDialogBooking?.professionalName ?? null,
          serviceName: rescheduleDialogBooking?.serviceName ?? null,
          start: rescheduleDialogBooking?.start ?? null,
          end: rescheduleDialogBooking?.end ?? null,
          tenantTimezone: summary.tenantTimezone,
        }}
        isSubmitting={rescheduleBookingMutation.isPending}
        errorMessage={rescheduleError}
        onClose={() => {
          if (rescheduleBookingMutation.isPending) {
            return;
          }
          setRescheduleDialogBooking(null);
          setRescheduleError(null);
        }}
        onConfirm={handleConfirmRescheduleBooking}
      />
    </div>
  );
}
