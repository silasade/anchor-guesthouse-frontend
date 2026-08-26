import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, MenuIcon, UserRoundIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from "@/global_components/Sidebar";
import { RoleBadge } from "@/global_components/StatusBadge";
import ThemeToggle from "@/global_components/ThemeToggle";
import { useSession } from "@/hooks/useSession";
import { getInitials } from "@/lib/utils";
import { useLogout } from "@/services/mutations/Auth";

/** Sidebar + top bar chrome wrapped around every `/dashboard/*` screen. */
function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, role } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="bg-background flex min-h-dvh">
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/85 border-border sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-md lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </Button>

          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-muted-foreground truncate text-sm">
              Signed in as{" "}
              <span className="text-foreground font-medium">{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role && <RoleBadge role={role} className="hidden sm:inline-flex" />}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account menu"
                >
                  <Avatar>
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="space-y-1">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="text-muted-foreground truncate text-xs font-normal">
                    {user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <UserRoundIcon />
                    Dashboard overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
