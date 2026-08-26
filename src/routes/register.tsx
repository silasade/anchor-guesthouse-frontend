import { useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerSchema,
  type RegisterSchemaType,
} from "@/global_components/-formSchemas";
import Logo from "@/global_components/Logo";
import ThemeToggle from "@/global_components/ThemeToggle";
import { useSession } from "@/hooks/useSession";
import { useRegister } from "@/services/mutations/Auth";

export const Route = createFileRoute("/register")({
  component: RegisterRoute,
});

function RegisterRoute() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { mutateAsync: registerUser, isPending } = useRegister();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "GUEST",
      studentId: "",
      phoneNumber: "",
    },
  });

  const role = form.watch("role");

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: RegisterSchemaType) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        studentId:
          values.role === "STUDENT" ? values.studentId?.trim() : undefined,
        phoneNumber: values.phoneNumber?.trim() || undefined,
      });
      navigate({ to: "/dashboard", replace: true });
    } catch {
      // The mutation surfaces the API message through a toast.
    }
  };

  const { errors } = form.formState;

  return (
    <div className="surface-grid flex min-h-dvh flex-col">
      <div className="flex items-center justify-between px-4 py-5 lg:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>
              Guests reserve single rooms; students reserve double or triple
              bedspaces.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="register-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  aria-invalid={!!errors.name}
                  {...form.register("name")}
                />
                {errors.name && (
                  <p className="text-destructive text-xs">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-type">I am a</Label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    form.setValue("role", value as RegisterSchemaType["role"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="account-type" className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GUEST">
                      Guest — single guest-house rooms
                    </SelectItem>
                    <SelectItem value="STUDENT">
                      Student — hostel bedspaces
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "STUDENT" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="STU/2026/0889"
                    aria-invalid={!!errors.studentId}
                    {...form.register("studentId")}
                  />
                  {errors.studentId && (
                    <p className="text-destructive text-xs">
                      {errors.studentId.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    {...form.register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone (optional)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 801 111 2222"
                    {...form.register("phoneNumber")}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    aria-invalid={!!errors.password}
                    {...form.register("password")}
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    aria-invalid={!!errors.confirmPassword}
                    {...form.register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Alert variant="info">
                <InfoIcon />
                <AlertDescription>
                  <p>
                    Receptionist and administrator accounts are provisioned
                    internally and cannot be created here.
                  </p>
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3">
            <Button type="submit" form="register-form" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Create account
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already registered?{" "}
              <Link
                to="/login"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
