import { Link } from "@tanstack/react-router";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryPageProps = {
  error?: Error;
  reset?: () => void;
};

function ErrorBoundaryPage({ error, reset }: ErrorBoundaryPageProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
        <TriangleAlertIcon className="size-6" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          {error?.message ??
            "An unexpected error interrupted this screen. Retrying usually clears it."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {reset && (
          <Button onClick={reset}>
            <RotateCcwIcon />
            Try again
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundaryPage;
