import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — Outbound Fitness" },
      {
        name: "description",
        content: "Sign in to your Outbound Fitness account to see your plan, workouts and progress.",
      },
      { property: "og:title", content: "Sign In — Outbound Fitness" },
      {
        property: "og:description",
        content: "Access your inclusive gym dashboard, workouts and accessibility settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { signIn, user, announce } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signIn(email)) {
      announce("Signed in successfully.");
      navigate({ to: "/dashboard" });
      return;
    }
    setError(
      user
        ? "That email does not match the account on this device."
        : "No account found on this device yet. Please register first.",
    );
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Sign in</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Enter the email address you registered with.
      </p>

      <form onSubmit={submit} className="mt-6 rounded-2xl border-2 border-border bg-card p-6">
        <label htmlFor="signin-email" className="block text-lg font-semibold text-foreground">
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={error ? "signin-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="mt-2 h-13 w-full rounded-xl border-2 border-input bg-background px-4 text-lg text-foreground"
        />
        {error && (
          <p id="signin-error" role="alert" className="mt-3 font-semibold text-destructive">
            Error: {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-6 inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-muted-foreground">
        Not a member yet?{" "}
        <Link to="/signup" className="font-semibold text-teal underline underline-offset-4">
          Join Outbound Fitness
        </Link>
        .
      </p>
    </div>
  );
}
