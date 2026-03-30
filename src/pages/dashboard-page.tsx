import { DateTime } from "luxon";
import { DashboardAgendaList } from "@/components/dashboard/dashboard-agenda-list";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardOccupancyCard } from "@/components/dashboard/dashboard-occupancy-card";
import { DashboardProfessionalOccupancy } from "@/components/dashboard/dashboard-professional-occupancy";
import { DashboardUpcomingList } from "@/components/dashboard/dashboard-upcoming-list";
import { useDashboardSummaryQuery } from "@/hooks/use-dashboard-summary-query";

function getInitialDashboardDate() {
  return DateTime.local().toISODate() ?? "";
}

export function DashboardPage() {
  const date = getInitialDashboardDate();
  const dashboardSummaryQuery = useDashboardSummaryQuery(date);

  if (dashboardSummaryQuery.isLoading) {
    return <DashboardLoadingState />;
  }

  if (dashboardSummaryQuery.isError) {
    return (
      <DashboardErrorState
        error={dashboardSummaryQuery.error}
        onRetry={() => {
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
      <DashboardHeader date={summary.date} tenantTimezone={summary.tenantTimezone} />

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
          />
        </div>

        <div className="grid gap-6 xl:col-span-4">
          <DashboardUpcomingList
            bookings={summary.upcomingBookings}
            tenantTimezone={summary.tenantTimezone}
          />
          <DashboardProfessionalOccupancy items={summary.professionalOccupancy} />
        </div>
      </div>
    </div>
  );
}
