import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

function LoadingPage({
  message = "Loading…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2Icon className="text-primary size-6 animate-spin" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export default LoadingPage;
