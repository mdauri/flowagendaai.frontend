export interface DashboardSummaryTotals {
  totalBookings: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

export interface DashboardSummaryOccupancy {
  availableMinutes: number;
  bookedMinutes: number;
  percentage: number;
}

export interface DashboardSummaryBookingItem {
  bookingId: string;
  start: string;
  end: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
}

export interface DashboardProfessionalOccupancyItem {
  professionalId: string;
  professionalName: string;
  availableMinutes: number;
  bookedMinutes: number;
  percentage: number;
  totalBookings: number;
}

export interface DashboardSummaryResponse {
  date: string;
  tenantTimezone: string;
  generatedAt: string;
  totals: DashboardSummaryTotals;
  occupancy: DashboardSummaryOccupancy;
  todayBookings: DashboardSummaryBookingItem[];
  upcomingBookings: DashboardSummaryBookingItem[];
  professionalOccupancy: DashboardProfessionalOccupancyItem[];
}

export interface DashboardSummaryQueryParams {
  date: string;
  professionalId?: string;
  serviceId?: string;
}
