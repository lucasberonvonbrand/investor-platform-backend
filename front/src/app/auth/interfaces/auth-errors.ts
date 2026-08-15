import { HttpErrorResponse } from "@angular/common/http";

export type AuthErrorCode =
  | "invalid_credentials"
  | "account_locked"
  | "password_expired"
  | "server_error"
  | "network_error"
  | "unknown";

export interface AuthError {
  code: AuthErrorCode;
  title: string;
  detail?: string;
  status?: number;
}

export function mapAuthError(err: unknown): AuthError {
  if (err instanceof HttpErrorResponse) {
    const status = err.status;
    const backendMsg: string | undefined =
      (err.error && (err.error.message || err.error?.error || err.error?.msg)) || err.message;

    if (status === 0) {
      return {
        code: "network_error",
        title: "Could not connect to the server.",
        detail: "Check your connection or try again.",
        status
      };
    }
    if (status === 401) {
      return {
        code: "invalid_credentials",
        title: "Invalid username or password.",
        detail: backendMsg,
        status
      };
    }
    if (status === 423) {
      return {
        code: "account_locked",
        title: "Your account is locked.",
        detail: backendMsg,
        status
      };
    }
    if (status === 403) {
      return {
        code: "password_expired",
        title: "Your password has expired.",
        detail: backendMsg,
        status
      };
    }
    return {
      code: "server_error",
      title: "An unexpected error occurred.",
      detail: backendMsg,
      status
    };
  }

  return {
    code: "unknown",
    title: "We couldn't process your request.",
  };
}
