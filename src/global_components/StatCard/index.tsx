import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardTone = "default" | "primary" | "success" | "warning" | "destructive";

const TONE_CLASSES: Record<StatCardTone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatCardTone;
  isLoading?: boolean;
  className?: string;
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-0 py-5", className)}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="truncate text-2xl font-semibold tracking-tight">
              {value}
            </p>
          )}
          {hint && !isLoading && (
            <p className="text-muted-foreground text-xs">{hint}</p>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              TONE_CLASSES[tone],
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
