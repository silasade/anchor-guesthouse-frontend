import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import Logo from "@/global_components/Logo";
import ThemeToggle from "@/global_components/ThemeToggle";
import { useSession } from "@/hooks/useSession";

/** Marketing header for the public shell. The dashboard uses its own chrome. */
function Header() {
  const { isAuthenticated } = useSession();

  return (
    <header className="bg-background/85 border-border sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link to="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
