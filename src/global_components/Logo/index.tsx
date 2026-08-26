import { BedDoubleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/utils/constants";

type LogoProps = {
  className?: string;
  /** Hides the wordmark, leaving only the mark — used in the collapsed sidebar. */
  markOnly?: boolean;
};

function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
        <BedDoubleIcon className="size-4.5" />
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">
            {APP_NAME}
          </span>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            Guest House &amp; Hostel
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
