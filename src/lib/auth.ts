import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY, AUTH_TOKEN_TTL_DAYS } from "@/utils/constants";
import type { AuthUserPayload, User } from "@/utils/types/Auth.type";

export function getToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(AUTH_TOKEN_KEY, token, {
    expires: AUTH_TOKEN_TTL_DAYS,
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });
}

export function clearToken(): void {
  Cookies.remove(AUTH_TOKEN_KEY);
}

/**
 * `/auth/login` and `/auth/register` return the user keyed by `id`, while
 * `/auth/me` and the populated reservation payloads use `_id`. Normalising here
 * keeps a single `User` shape in the UI.
 */
export function normalizeAuthUser(payload: AuthUserPayload): User {
  const { id, ...rest } = payload;
  return { _id: id, ...rest };
}
