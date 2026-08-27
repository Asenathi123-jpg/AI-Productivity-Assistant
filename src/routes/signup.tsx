import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CATEGORY_LABELS,
  FITNESS_GOALS,
  PLANS,
  formatRand,
  getPlan,
  planGroupFor,
  useApp,
  type AccessibilityCategory,
  type PlanTier,
} from "@/lib/app-state";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Join Outbound Fitness — 5 Step Registration" },
      {
        name: "description",
        content:
          "Register in five simple steps: your details, accessibility needs, fitness goals, membership plan and confirmation.",
      },
      { property: "og:title", content: "Join Outbound Fitness" },
      {
        property: "og:description",
        content: "A simple, accessible five-step gym registration for everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUp,
});

const personalSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20)
    .regex(/^[0-9+ ()-]+$/, "Phone numbers may only contain digits and + ( ) -"),
});

const STEPS = [
  "Personal information",
  "Accessibility",
  "Fitness goals",
  "Membership",
  "Confirmation",
];

function SignUp() {
  const navigate = useNavigate();
  const { signUp, announce, speak } = useApp();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<AccessibilityCategory | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [tier, setTier] = useState<PlanTier | null>(null);

  const goTo = (next: number) => {
    setStep(next);
    announce(`Step ${next + 1} of 5: ${STEPS[next]}`);
    speak(`Step ${next + 1} of 5. ${STEPS[next]}`);
  };

  const next = () => {
    if (step === 0) {
      const result = personalSchema.safeParse({ name, email, phone });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
        setErrors(fieldErrors);
        announce("There are problems with the form. Please check the messages below each field.");
        return;
      }
      setErrors({});
    }
    if (step === 1 && !category) {
      setErrors({ category: "Please choose how you would like to use the gym." });
      return;
    }
    if (step === 2 && goals.length === 0) {
      setErrors({ goals: "Please choose at least one fitness goal." });
      return;
    }
    if (step === 3 && !tier) {
      setErrors({ tier: "Please choose a membership plan." });
      return;
    }
    setErrors({});
    goTo(Math.min(step + 1, 4));
  };

  const finish = () => {
    if (!category || !tier) return;
    signUp({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      goals,
      plan: tier,
      joinedAt: new Date().toISOString(),
    });
    speak("Welcome to Outbound Fitness. Your journey starts here.");
    navigate({ to: "/dashboard", search: { welcome: true } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Join Outbound Fitness</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Five short steps. You can go back at any time.
      </p>

      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Registration progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : i < step
                  ? "border-teal bg-card text-teal"
                  : "border-border bg-card text-muted-foreground"
            }`}
          >
            {i < step ? "Done: " : `Step ${i + 1}: `}
            {label}
          </li>
        ))}
      </ol>

      <section
        className="mt-6 rounded-2xl border-2 border-border bg-card p-6"
        aria-labelledby="step-heading"
      >
        <h2 id="step-heading" className="text-2xl font-bold text-foreground">
          Step {step + 1} of 5: {STEPS[step]}
        </h2>

        {step === 0 && (
          <div className="mt-5 space-y-5">
            <Field
              id="name"
              label="Full name"
              value={name}
              onChange={setName}
              error={errors["name"]}
              autoComplete="name"
            />
            <Field
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors["email"]}
              autoComplete="email"
            />
            <Field
              id="phone"
              label="Phone number"
              type="tel"
              value={phone}
              onChange={setPhone}
              error={errors["phone"]}
              autoComplete="tel"
            />
          </div>
        )}

        {step === 1 && (
          <fieldset className="mt-5">
            <legend className="text-lg font-semibold text-foreground">
              How would you like to use the gym?
            </legend>
            <p className="mt-1 text-muted-foreground">
              This lets us set text size, contrast and audio support for you. You can change it
              later in Accessibility settings.
            </p>
            <div className="mt-4 space-y-3">
              {(Object.keys(CATEGORY_LABELS) as AccessibilityCategory[]).map((option) => (
                <Choice
                  key={option}
                  type="radio"
                  name="accessibility"
                  label={CATEGORY_LABELS[option]}
                  checked={category === option}
                  onChange={() => setCategory(option)}
                />
              ))}
            </div>
            {errors["category"] && <ErrorText>{errors["category"]}</ErrorText>}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="mt-5">
            <legend className="text-lg font-semibold text-foreground">
              What are your fitness goals?
            </legend>
            <p className="mt-1 text-muted-foreground">Choose one or more.</p>
            <div className="mt-4 space-y-3">
              {FITNESS_GOALS.map((goal) => (
                <Choice
                  key={goal}
                  type="checkbox"
                  name="goals"
                  label={goal}
                  checked={goals.includes(goal)}
                  onChange={() =>
                    setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]))
                  }
                />
              ))}
            </div>
            {errors["goals"] && <ErrorText>{errors["goals"]}</ErrorText>}
          </fieldset>
        )}

        {step === 3 && category && (
          <fieldset className="mt-5">
            <legend className="text-lg font-semibold text-foreground">
              Choose your membership — {CATEGORY_LABELS[category]}
            </legend>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {PLANS[planGroupFor(category)].map((plan) => {
                const selected = tier === plan.tier;
                return (
                  <label
                    key={plan.tier}
                    className={`block cursor-pointer rounded-xl border-2 p-5 ${
                      selected ? "border-primary bg-accent" : "border-border bg-background"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        className="size-5"
                        checked={selected}
                        onChange={() => setTier(plan.tier)}
                      />
                      <span className="text-xl font-bold text-foreground">{plan.name}</span>
                      <span className="ml-auto text-xl font-bold text-teal">
                        {formatRand(plan.price)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">per month</span>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2 text-foreground">
                          <Check className="mt-1 size-4 shrink-0 text-teal" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
            {errors["tier"] && <ErrorText>{errors["tier"]}</ErrorText>}
          </fieldset>
        )}

        {step === 4 && category && tier && (
          <div className="mt-5 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Please confirm your details</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail term="Name" value={name} />
              <Detail term="Email" value={email} />
              <Detail term="Phone" value={phone} />
              <Detail term="Accessibility" value={CATEGORY_LABELS[category]} />
              <Detail term="Fitness goals" value={goals.join(", ")} />
              <Detail
                term="Membership"
                value={`${getPlan(category, tier).name} — ${formatRand(getPlan(category, tier).price)} per month`}
              />
            </dl>
            <div>
              <h3 className="text-lg font-semibold text-foreground">What is included</h3>
              <ul className="mt-2 space-y-1.5">
                {getPlan(category, tier).features.map((f) => (
                  <li key={f} className="flex gap-2 text-foreground">
                    <Check className="mt-1 size-4 shrink-0 text-teal" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="rounded-lg border-2 border-border bg-surface p-4 text-muted-foreground">
              Your information is stored on this device only and is used to personalise your
              workouts and accessibility settings.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="inline-flex min-h-13 items-center gap-2 rounded-xl border-2 border-border px-6 py-3 text-lg font-semibold text-foreground hover:bg-accent"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-13 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90"
            >
              Continue
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="inline-flex min-h-13 items-center gap-2 rounded-xl bg-gold px-6 py-3 text-lg font-bold text-gold-foreground hover:opacity-90"
            >
              Confirm and join
            </button>
          )}
        </div>
      </section>

      <p className="mt-6 text-muted-foreground">
        Already a member?{" "}
        <Link to="/signin" className="font-semibold text-teal underline underline-offset-4">
          Sign in here
        </Link>
        .
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 h-13 w-full rounded-xl border-2 border-input bg-background px-4 text-lg text-foreground"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 font-semibold text-destructive">
          Error: {error}
        </p>
      )}
    </div>
  );
}

function Choice({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-lg ${
        checked ? "border-primary bg-accent font-semibold" : "border-border bg-background"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-5" />
      <span className="text-foreground">{label}</span>
      {checked && <Check className="ml-auto size-5 text-teal" aria-hidden="true" />}
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-3 font-semibold text-destructive">
      Error: {children}
    </p>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-border bg-surface p-4">
      <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {term}
      </dt>
      <dd className="mt-1 text-lg text-foreground">{value}</dd>
    </div>
  );
}
