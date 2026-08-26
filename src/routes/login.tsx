import { useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  type LoginSchemaType,
} from "@/global_components/-formSchemas";
import Logo from "@/global_components/Logo";
import ThemeToggle from "@/global_components/ThemeToggle";
import { useSession } from "@/hooks/useSession";
import { useLogin } from "@/services/mutations/Auth";

type LoginSearch = {
  /** Set by `ProtectedRoute` so users land back where they were headed. */
  redirect?: string;
};

/**
 * Only same-origin relative paths are accepted, and never `/login` itself —
 * otherwise a crafted link could bounce a signed-in user off-site, or the guard
 * could redirect back onto this page in a loop.
 */
function sanitizeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value === "/login" || value.startsWith("/login?")) return undefined;
  return value;
}

export const Route = createFileRoute("/login")({
  // Omit the key entirely when there is no redirect. Returning
  // `{ redirect: undefined }` hands the router a new object on every parse,
  // which it reads as a changed search and re-renders until React bails out
  // with "Maximum update depth exceeded".
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirect = sanitizeRedirect(search.redirect);
    return redirect ? { redirect } : {};
  },
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { isAuthenticated } = useSession();
  const { mutateAsync: login, isPending } = useLogin();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginSchemaType) => {
    try {
      await login(values);
      if (redirect) {
        navigate({ href: redirect, replace: true });
        return;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch {
      // The mutation surfaces the API message through a toast.
    }
  };

  return (
    <div className="surface-grid flex min-h-dvh flex-col">
      <div className="flex items-center justify-between px-4 py-5 lg:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Use the account issued to you as a guest, student, receptionist or
              administrator.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="login-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3">
            <Button type="submit" form="login-form" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Sign in
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              No account yet?{" "}
              <Link
                to="/register"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
