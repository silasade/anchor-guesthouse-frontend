import { Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/global_components/Logo";
import { cn } from "@/lib/utils";
import { CHECKOUT_CUTOFF_LABEL } from "@/utils/constants";
import { navItemsForRole } from "@/utils/navigation";
import type { UserRole } from "@/utils/types/Auth.type";

type SidebarProps = {
  role: UserRole | null;
  /** Mobile drawer state; on `lg` and up the rail is always visible. */
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const items = navItemsForRole(role);

  return (
    <>
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Link to="/dashboard" onClick={onClose}>
            <Logo />
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <XIcon />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              activeOptions={{ exact: item.to === "/dashboard" }}
              activeProps={{
                className:
                  "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
              }}
              inactiveProps={{
                className:
                  "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              }}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <item.icon className="mt-0.5 size-4 shrink-0" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span>{item.label}</span>
                <span className="truncate text-[11px] font-normal opacity-70">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-sidebar-border shrink-0 border-t p-4">
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Daily checkout cutoff
            <span className="text-foreground block font-medium">
              {CHECKOUT_CUTOFF_LABEL}
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
