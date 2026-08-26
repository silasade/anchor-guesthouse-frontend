import { Outlet, createFileRoute } from "@tanstack/react-router";
import DashboardShell from "@/global_components/DashboardShell";
import ProtectedRoute from "@/global_components/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

/** Auth gate plus chrome for every `/dashboard/*` screen. */
function DashboardLayout() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </ProtectedRoute>
  );
}
