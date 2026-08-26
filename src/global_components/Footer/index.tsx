import { Link } from "@tanstack/react-router";
import Logo from "@/global_components/Logo";
import { APP_NAME, CHECKOUT_CUTOFF_LABEL } from "@/utils/constants";

function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="text-xs">
            Cashless in-person reservations · Checkout cutoff{" "}
            {CHECKOUT_CUTOFF_LABEL}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/login" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="hover:text-foreground transition-colors"
          >
            Create account
          </Link>
          <span>
            © {new Date().getFullYear()} {APP_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
