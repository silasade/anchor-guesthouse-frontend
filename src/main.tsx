import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundaryPage from "@/global_components/ErrorBoundaryPage";
import LoadingPage from "@/global_components/LoadingPage";
import NotFoundPage from "@/global_components/NotFoundPage";
import { initializeTheme } from "@/hooks/useTheme";
import { APIError } from "@/services/api";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      // A 401 means the token is gone or expired and a 403 means the role is
      // wrong; neither improves on retry.
      retry: (failureCount, error) => {
        if (error instanceof APIError && [401, 403].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <LoadingPage />,
  defaultNotFoundComponent: () => <NotFoundPage />,
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorBoundaryPage error={error} reset={reset} />
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
