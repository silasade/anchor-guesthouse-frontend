import { Outlet, createRootRoute } from "@tanstack/react-router";
import ErrorBoundaryPage from "@/global_components/ErrorBoundaryPage";
import NotFoundPage from "@/global_components/NotFoundPage";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error, reset }) => (
    <ErrorBoundaryPage error={error} reset={reset} />
  ),
});

/**
 * Deliberately chrome-free: the public shell and the dashboard shell each own
 * their own header, so the root only provides the outlet.
 */
function RootComponent() {
  return <Outlet />;
}
