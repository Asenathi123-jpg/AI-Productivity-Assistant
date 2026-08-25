import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  Bot,
  HeartPulse,
  LineChart,
  Sparkles,
  Users,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Outbound Fitness — Move Beyond Limits. Fitness for Everyone." },
      {
        name: "description",
        content:
          "An inclusive gym where everyone can exercise, receive support and achieve their fitness goals. Accessible memberships, AI fitness assistance and personalised workouts.",
      },
      { property: "og:title", content: "Outbound Fitness — Fitness for Everyone" },
      {
        property: "og:description",
        content:
          "An inclusive, accessible gym with AI fitness assistance, personalised workouts and supportive staff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const BENEFITS = [
  {
    icon: Users,
    title: "Inclusive gym environment",
    text: "Everyone trains together in a space built for all abilities.",
  },
  {
    icon: Accessibility,
    title: "Accessible fitness support",
    text: "Audio instructions, tactile guidance and accessible equipment.",
  },
  {
    icon: HeartPulse,
    title: "Personalised workouts",
    text: "Plans that match your goal, experience and access needs.",
  },
  {
    icon: Bot,
    title: "AI fitness assistance",
    text: "Ask questions any time and get clear, step-by-step answers.",
  },
  {
    icon: UserCheck,
    title: "Supportive staff",
    text: "Trained team members ready to assist whenever you ask.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    text: "Log your sessions and see how far you have moved.",
  },
];

const ACTIONS = [
  { to: "/signup", label: "Join Now", primary: true },
  { to: "/membership", label: "Membership Plans", primary: false },
  { to: "/ai-assistant", label: "AI Fitness Assistant", primary: false },
  { to: "/accessibility", label: "Accessibility", primary: false },
  { to: "/signin", label: "Sign In", primary: false },
] as const;

function Home() {
  return (
    <div>
      <section className="border-b-2 border-border bg-primary px-4 py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-gold-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
            Inclusive gym · Cape Town
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">OUTBOUND FITNESS</h1>
          <p className="mt-4 text-xl font-semibold sm:text-2xl">
            “Move Beyond Limits. Fitness for Everyone.”
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg">
            An inclusive gym where everyone can exercise, receive support and achieve their fitness
            goals.
          </p>

          <ul className="mt-9 flex flex-wrap justify-center gap-3">
            {ACTIONS.map((a) => (
              <li key={a.to}>
                <Link
                  to={a.to}
                  className={
                    a.primary
                      ? "inline-flex min-h-14 items-center rounded-xl bg-gold px-7 text-lg font-bold text-gold-foreground hover:opacity-90"
                      : "inline-flex min-h-14 items-center rounded-xl border-2 border-primary-foreground bg-card px-6 text-lg font-semibold text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="text-3xl font-bold text-foreground">
          What you get at Outbound Fitness
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Six things every member receives, whatever your ability or experience level.
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="rounded-2xl border-2 border-border bg-card p-6 text-card-foreground"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-teal text-teal-foreground">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6" aria-labelledby="start-heading">
        <div className="rounded-2xl border-2 border-border bg-card p-7">
          <h2 id="start-heading" className="text-2xl font-bold text-foreground">
            Ready to start?
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Registration takes five short steps. Tell us how you would like to use the gym and we
            will set the app up to suit you.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex min-h-13 items-center rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90"
            >
              Start registration
            </Link>
            <Link
              to="/workouts"
              className="inline-flex min-h-13 items-center rounded-xl border-2 border-border px-6 py-3 text-lg font-semibold text-foreground hover:bg-accent"
            >
              Try the AI Workout Planner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
