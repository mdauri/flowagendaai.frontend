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
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { useDashboardSummaryQuery } from "@/hooks/use-dashboard-summary-query";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { useCancelBookingMutation } from "@/hooks/use-cancel-booking-mutation";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";

function getInitialDashboardDate() {
  return DateTime.local().toISODate() ?? "";
}

export function DashboardPage() {
  const [date, setDate] = React.useState(getInitialDashboardDate);
  const [professionalId, setProfessionalId] = React.useState("");
  const [serviceId, setServiceId] = React.useState("");
  const professionalsQuery = useProfessionalsQuery();
  const servicesQuery = useServicesQuery();
  const dashboardSummaryQuery = useDashboardSummaryQuery({
    date,
    professionalId: professionalId || undefined,
    serviceId: serviceId || undefined,
  });
  const cancelBookingMutation = useCancelBookingMutation();
  const [busyBookingId, setBusyBookingId] = React.useState<string | null>(null);
  const [cancelDialogBooking, setCancelDialogBooking] = React.useState<DashboardSummaryBookingItem | null>(
    null
  );
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [cancelError, setCancelError] = React.useState<string | null>(null);
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
  }, []);

  const handleRequestCancelBooking = React.useCallback((booking: DashboardSummaryBookingItem) => {
    setFeedback(null);
    setCancelError(null);
    setCancelDialogBooking(booking);
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
        professionals={professionals.map((item) => ({ id: item.id, name: item.name }))}
        services={services.map((item) => ({ id: item.id, name: item.name }))}
        onDateChange={handleDateChange}
        onPreviousDate={handlePreviousDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onTomorrow={handleTomorrow}
        onProfessionalChange={setProfessionalId}
        onServiceChange={setServiceId}
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
          />
        </div>

        <div className="grid gap-6 xl:col-span-4">
          <DashboardUpcomingList
            bookings={summary.upcomingBookings}
            tenantTimezone={summary.tenantTimezone}
            busyBookingId={busyBookingId}
            onCancelBooking={handleRequestCancelBooking}
          />
          <DashboardProfessionalOccupancy items={summary.professionalOccupancy} />
        </div>
      </div>

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
    </div>
  );
}
