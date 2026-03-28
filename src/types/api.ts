export interface ApiErrorResponse {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
