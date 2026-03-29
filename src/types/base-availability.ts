export type AvailabilityDayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface AvailabilityBaseItem {
  id: string;
  professionalId: string;
  dayOfWeek: AvailabilityDayOfWeek;
  startTimeUtc: string;
  endTimeUtc: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListAvailabilityBaseResponse {
  availability: AvailabilityBaseItem[];
}

export interface AvailabilityBaseResponse {
  availability: AvailabilityBaseItem;
}

export interface CreateAvailabilityBaseInput {
  dayOfWeek: AvailabilityDayOfWeek;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilityBaseInput extends CreateAvailabilityBaseInput {
  id: string;
}
