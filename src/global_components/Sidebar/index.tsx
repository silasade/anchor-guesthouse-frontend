import { Link, useLocation } from "@tanstack/react-router";
import { ClockIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/global_components/Logo";
import { CHECKOUT_CUTOFF_LABEL } from "@/utils/constants";
import { navItemsForRole } from "@/utils/navigation";
import type { UserRole } from "@/utils/types/Auth.type";

type SidebarProps = {
  role: UserRole | null;
};

function AppSidebar({ role }: SidebarProps) {
  const items = navItemsForRole(role);
  const { isMobile, state, setOpenMobile } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed" && !isMobile;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" onClick={handleNavClick} className="flex items-center">
            <Logo markOnly={isCollapsed} />
          </Link>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpenMobile(false)}
              aria-label="Close navigation"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const targetPath = item.to ?? "";
                const isActive =
                  targetPath === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(targetPath);

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      size="lg"
                    >
                      <Link to={item.to} onClick={handleNavClick}>
                        <item.icon className="size-5 shrink-0" />
                        <span className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                          <span className="font-medium leading-none">{item.label}</span>
                          <span className="truncate text-[11px] font-normal opacity-70">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <ClockIcon className="size-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              Daily checkout cutoff: {CHECKOUT_CUTOFF_LABEL}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Daily checkout cutoff
              <span className="text-foreground block font-medium">
                {CHECKOUT_CUTOFF_LABEL}
              </span>
            </p>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  );
}

export default AppSidebar;
