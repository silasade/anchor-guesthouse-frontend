import { Link } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/global_components/Logo";

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        <CompassIcon className="size-6" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          This page checked out
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          The page you are looking for does not exist, or you may not have access
          to it with your current role.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
