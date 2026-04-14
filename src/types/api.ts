export interface ApiErrorResponse {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export const BOOKING_CONFLICT_ERROR_CODE = "BOOKING_CONFLICT";
export const MULTI_DAY_CONFLICT_ERROR_CODE = "MULTI_DAY_CONFLICT";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId: string,
    public readonly details?: unknown,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isBookingConflictApiError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    error.code === BOOKING_CONFLICT_ERROR_CODE
  );
}
