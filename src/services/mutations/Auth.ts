import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import { clearToken, normalizeAuthUser, setToken } from "@/lib/auth";
import { generateToast } from "@/lib/generateToast";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/utils/types/Auth.type";

/**
 * Signs in and primes the session cache with the user the API returned, so the
 * dashboard renders without waiting on a follow-up `/auth/me` round trip.
 */
const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginPayload) =>
      requests<AuthResponse>("auth/login", {
        method: "POST",
        body,
        authenticated: false,
      }),
    onSuccess: (response) => {
      setToken(response.data.token);
      queryClient.setQueryData(queryKeys.session, {
        success: true,
        data: { user: normalizeAuthUser(response.data.user) },
      });
      generateToast("success", `Welcome back, ${response.data.user.name}.`);
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterPayload) =>
      requests<AuthResponse>("auth/register", {
        method: "POST",
        body,
        authenticated: false,
      }),
    onSuccess: (response) => {
      setToken(response.data.token);
      queryClient.setQueryData(queryKeys.session, {
        success: true,
        data: { user: normalizeAuthUser(response.data.user) },
      });
      generateToast("success", "Account created. You are now signed in.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

/**
 * The API issues stateless JWTs with no revocation endpoint, so signing out is
 * purely a client concern: drop the cookie and empty the cache.
 */
const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    generateToast("success", "You have been signed out.");
  };
};

export { useLogin, useLogout, useRegister };
