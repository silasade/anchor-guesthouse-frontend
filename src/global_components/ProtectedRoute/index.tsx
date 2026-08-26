import { useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingPage from "@/global_components/LoadingPage";
import { useSession } from "@/hooks/useSession";
import { ROLE_LABELS } from "@/utils/constants";
import type { UserRole } from "@/utils/types/Auth.type";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** When set, the signed-in user must hold one of these roles. */
  roles?: UserRole[];
};

/**
 * Client-side mirror of the API's `authenticate` + `authorize` middlewares.
 * The server remains the authority — this only spares users a guaranteed 401
 * or 403 and keeps them oriented.
 */
function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, role } = useSession();
  const location = useRouterState({ select: (state) => state.location });

  // The location keeps changing as the redirect lands, so the target is
  // captured once on mount and the navigation fires at most once. Reading it
  // live instead produced a `/login?redirect=/login?redirect=…` loop.
  const redirectTarget = useRef(`${location.pathname}${location.searchStr}`);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || hasRedirected.current) return;
    hasRedirected.current = true;
    navigate({
      to: "/login",
      search: { redirect: redirectTarget.current },
      replace: true,
    });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <LoadingPage message="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return <LoadingPage message="Redirecting to sign in…" />;
  }

  if (roles && role && !roles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
          <ShieldAlertIcon className="size-6" />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            You do not have access to this area
          </h2>
          <p className="text-muted-foreground max-w-md text-sm">
            This screen is limited to{" "}
            {roles.map((item) => ROLE_LABELS[item]).join(" and ")} accounts. You
            are signed in as a {ROLE_LABELS[role]}.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Back to overview
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
