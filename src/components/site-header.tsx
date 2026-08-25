import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/membership", label: "Membership" },
  { to: "/workouts", label: "Workouts" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/dashboard", label: "Profile" },
] as const;

const SIMPLE_NAV = ["/", "/membership", "/workouts", "/dashboard"];

export function SiteHeader() {
  const { preferences, user } = useApp();
  const [open, setOpen] = useState(false);

  const items = preferences.simplifiedNavigation
    ? NAV.filter((i) => SIMPLE_NAV.includes(i.to))
    : NAV;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-1 py-1 text-lg font-bold text-foreground"
          aria-label="Outbound Fitness, go to home page"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            Outbound<span className="text-teal"> Fitness</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  activeProps={{
                    className:
                      "inline-flex min-h-11 items-center rounded-lg px-3 py-2 font-semibold bg-primary text-primary-foreground underline underline-offset-4",
                    "aria-current": "page",
                  }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <Link
              to="/signup"
              className="hidden min-h-11 items-center rounded-lg bg-gold px-4 py-2 font-semibold text-gold-foreground hover:opacity-90 sm:inline-flex"
            >
              Join Now
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border-2 border-border px-3 font-medium lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
            <span>Menu</span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main navigation"
        className={cn("border-t-2 border-border lg:hidden", open ? "block" : "hidden")}
      >
        <ul className="mx-auto max-w-6xl px-4 py-2">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-lg px-3 py-3 text-lg font-medium text-foreground hover:bg-accent"
                activeProps={{
                  className:
                    "flex min-h-12 items-center rounded-lg px-3 py-3 text-lg font-semibold bg-primary text-primary-foreground",
                  "aria-current": "page",
                }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {!user && (
            <li>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="mt-1 flex min-h-12 items-center rounded-lg bg-gold px-3 py-3 text-lg font-semibold text-gold-foreground"
              >
                Join Now
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <p className="font-semibold text-foreground">
          OUTBOUND FITNESS — Move Beyond Limits. Fitness for Everyone.
        </p>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Information produced by our AI features is clearly labelled and is general fitness
          information only. It does not replace advice from a qualified medical or fitness
          professional. Your details are stored on your own device and are never used to make
          discriminatory recommendations.
        </p>
      </div>
    </footer>
  );
}
