export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, message: string, code: ApiErrorCode, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, message, "BAD_REQUEST", details);

export const unauthorized = (message = "Unauthorized") =>
  new ApiError(401, message, "UNAUTHORIZED");

export const forbidden = (message = "Forbidden") =>
  new ApiError(403, message, "FORBIDDEN");

export const notFound = (message = "Resource not found") =>
  new ApiError(404, message, "NOT_FOUND");

export const conflict = (message: string, details?: unknown) =>
  new ApiError(409, message, "CONFLICT", details);
