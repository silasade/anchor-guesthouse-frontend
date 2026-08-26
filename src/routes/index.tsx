import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BedDoubleIcon,
  BedSingleIcon,
  ChartColumnIcon,
  ClockIcon,
  ConciergeBellIcon,
  ShieldCheckIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Footer from "@/global_components/Footer";
import Header from "@/global_components/Header";
import { useSession } from "@/hooks/useSession";
import { APP_NAME, CHECKOUT_CUTOFF_LABEL } from "@/utils/constants";

export const Route = createFileRoute("/")({
  component: LandingRoute,
});

const FEATURES = [
  {
    icon: BedSingleIcon,
    title: "Guest single rooms",
    body: "Short-stay visitors reserve single guest-house rooms with per-night pricing set by the administrator.",
  },
  {
    icon: UsersIcon,
    title: "Student bedspaces",
    body: "Students reserve double or triple bedspaces in the hostel wing, kept separate from guest inventory.",
  },
  {
    icon: WalletIcon,
    title: "Cashless, in person",
    body: "No payment gateway. Reserve online, then settle at the front desk when you arrive.",
  },
  {
    icon: ConciergeBellIcon,
    title: "Front-desk workflow",
    body: "Receptionists check arrivals in and departures out, and room status follows automatically.",
  },
  {
    icon: ClockIcon,
    title: "Noon checkout cycle",
    body: `Stays are counted on a ${CHECKOUT_CUTOFF_LABEL} cutoff, so nightly totals never drift.`,
  },
  {
    icon: ChartColumnIcon,
    title: "Period analytics",
    body: "Administrators pull occupancy and revenue reports by day, week, month, year or a custom range.",
  },
];

const ROLES = [
  {
    role: "Guests",
    body: "Browse available single rooms, reserve a stay, and track its status through to checkout.",
  },
  {
    role: "Students",
    body: "Reserve a bedspace in a double or triple hostel room for the length of your stay.",
  },
  {
    role: "Receptionists",
    body: "Work the full reservation ledger: check in arrivals, check out departures, release rooms.",
  },
  {
    role: "Administrators",
    body: "Generate and price rooms in bulk, oversee every reservation, and run period reports.",
  },
];

function LandingRoute() {
  const { isAuthenticated } = useSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex-1">
        <section className="surface-grid border-border border-b">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 lg:px-6 lg:py-28">
            <Badge variant="soft">
              <ShieldCheckIcon />
              Role-based reservation management
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Guest house and student hostel reservations, run from one desk.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base text-pretty">
              {APP_NAME} handles the whole stay: guests and students reserve
              online, receptionists check them in and out at the front desk, and
              administrators see occupancy and revenue across any period.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Open dashboard" : "Create an account"}
                  <ArrowRightIcon />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              What the system covers
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm">
              Every capability below maps directly onto the reservation API — no
              simulated data and no placeholder screens.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="gap-3 py-5">
                <CardHeader>
                  <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <feature.icon className="size-4.5" />
                  </span>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-muted-foreground text-sm">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-border bg-muted/40 border-y">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Four roles, one workflow
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm">
                Access is enforced by the API and mirrored in the interface, so
                each role only sees the screens it can act on.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ROLES.map((item) => (
                <Card key={item.role} className="gap-2 py-5">
                  <CardHeader>
                    <p className="font-medium">{item.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
          <Card className="items-center gap-4 py-10 text-center">
            <CardHeader className="justify-items-center">
              <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                <BedDoubleIcon className="size-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Ready to reserve a room or a bedspace?
              </h2>
              <p className="text-muted-foreground mx-auto max-w-lg text-sm">
                Create a guest or student account and the catalogue filters
                itself down to the inventory you are allowed to book.
              </p>
            </CardContent>
            <Button asChild>
              <Link to={isAuthenticated ? "/dashboard/rooms" : "/register"}>
                {isAuthenticated ? "Browse rooms" : "Get started"}
                <ArrowRightIcon />
              </Link>
            </Button>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
