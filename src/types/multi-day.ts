/**
 * Multi-day service scheduling types.
 * These types extend the base booking types to support services that span multiple days.
 */

/**
 * A single day's portion of a multi-day service.
 */
export interface DaySegment {
  /** ISO civil date (e.g., "2026-04-18") */
  date: string;
  /** ISO UTC datetime for segment start */
  start: string;
  /** ISO UTC datetime for segment end */
  end: string;
  /** Duration in minutes for this specific day segment */
  durationMinutes: number;
}

/**
 * A multi-day slot extending the base PublicSlot with daysAffected information.
 */
export interface MultiDaySlot {
  start: string;
  end: string;
  /** Array of day segments showing how the service is distributed across days */
  daysAffected: DaySegment[];
  /** Total duration of the service in minutes */
  totalDurationMinutes: number;
}

/**
 * Estimated multi-day information for display purposes.
 */
export interface MultiDayInfo {
  /** Number of days the service spans */
  daysCount: number;
  /** Estimated days based on average working hours */
  estimatedDays?: number;
}

/**
 * Type guard to check if a slot is a multi-day slot.
 */
export function isMultiDaySlot(slot: { start: string; end: string }): slot is MultiDaySlot {
  return "daysAffected" in slot && Array.isArray((slot as MultiDaySlot).daysAffected);
}

/**
 * Day status for loading progress indicator.
 */
export type MultiDayDayStatus = "pending" | "checking" | "available" | "conflict";

/**
 * Day with status for loading progress.
 */
export interface DayWithStatus {
  date: string;
  status: MultiDayDayStatus;
}

/**
 * Multi-day conflict error details from API response.
 */
export interface MultiDayConflictDetails {
  conflictDay: string;
  conflictStart: string;
  conflictEnd: string;
}
