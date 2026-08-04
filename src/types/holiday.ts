export interface Holiday {
  id: string;
  tenantId: string;
  professionalId: string | null;
  date: string; // ISO datetime (UTC) returned by API
  name: string;
  description: string | null;
  isFullDay: boolean;
  startTimeUtc: string | null; // ISO datetime (UTC) returned by API (time-only storage on BE)
  endTimeUtc: string | null; // ISO datetime (UTC) returned by API (time-only storage on BE)
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayInput {
  professionalId?: string | null;
  date: string; // YYYY-MM-DD
  name: string;
  description?: string | null;
  isFullDay?: boolean;
  startTime?: string | null; // HH:MM
  endTime?: string | null; // HH:MM
}

export interface UpdateHolidayInput {
  professionalId?: string | null;
  date?: string; // YYYY-MM-DD
  name?: string;
  description?: string | null;
  isFullDay?: boolean;
  startTime?: string | null; // HH:MM
  endTime?: string | null; // HH:MM
}
