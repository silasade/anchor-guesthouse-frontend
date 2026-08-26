import { clearToken, getToken } from "@/lib/auth";
import { generateToast } from "@/lib/generateToast";
import type { APIResponse, APIValidationError } from "@/utils/types/common";

const baseUrl = import.meta.env.VITE_APP_BASE_URL || "http://localhost:8000/";

/** Version prefix shared by every route mounted in the backend's `app.ts`. */
const API_PREFIX = "api/v1";

export class APIError extends Error {
  status: number;
  fieldErrors?: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  /** Serialised to JSON automatically; set `Content-Type` for you. */
  body?: unknown;
  /** Appended as a query string, skipping `undefined`, `null` and `"ALL"`. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Overrides the cookie token — used by the login/register flows. */
  token?: string;
  /** Set to `false` on public endpoints so no Authorization header is sent. */
  authenticated?: boolean;
};

function buildQueryString(
  query?: RequestOptions["query"],
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "" || value === "ALL") {
      continue;
    }
    params.append(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Thin wrapper over `fetch` that unwraps the API's `{ success, message, data }`
 * envelope and raises an `APIError` for anything the UI should surface.
 */
export async function requests<T>(
  path: string,
  options: RequestOptions = {},
): Promise<APIResponse<T>> {
  const { body, query, token, authenticated = true, headers, ...init } = options;
  const bearer = token ?? (authenticated ? getToken() : undefined);

  const res = await fetch(
    `${baseUrl}${API_PREFIX}/${path}${buildQueryString(query)}`,
    {
      ...init,
      method: init.method ?? "GET",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
        ...(bearer && { Authorization: `Bearer ${bearer}` }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    },
  );

  if (res.status === 401) {
    clearToken();
    generateToast("error", "Your session has expired. Please sign in again.");
    throw new APIError("Unauthorized", 401);
  }

  let result: APIResponse<T> & Partial<APIValidationError>;
  try {
    result = await res.json();
  } catch {
    throw new APIError(res.statusText || "Unexpected server response", res.status);
  }

  if (!res.ok || !result.success) {
    throw new APIError(
      result.message || res.statusText || "Request failed",
      res.status,
      result.errors,
    );
  }

  return result;
}

/** Unauthenticated liveness probe served outside the `/api/v1` prefix. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}health`);
    return res.ok;
  } catch {
    return false;
  }
}
