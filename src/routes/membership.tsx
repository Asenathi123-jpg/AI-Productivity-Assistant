import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  PLANS,
  formatRand,
  type AccessibilityCategory,
  CATEGORY_LABELS,
  planGroupFor,
} from "@/lib/app-state";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Plans — Outbound Fitness" },
      {
        name: "description",
        content:
          "Choose your category, then compare Basic and Premium membership plans and monthly prices at Outbound Fitness.",
      },
      { property: "og:title", content: "Membership Plans — Outbound Fitness" },
      {
        property: "og:description",
        content: "Accessible Basic and Premium gym memberships with clear monthly pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Membership,
});

const CATEGORY_OPTIONS: AccessibilityCategory[] = [
  "visually-impaired",
  "not-visually-impaired",
  "additional-assistance",
];

function Membership() {
  const [category, setCategory] = useState<AccessibilityCategory | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Membership Plans</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
        First choose the option that describes how you will use the gym. We will then show the
        plans and prices for that category.
      </p>

      <fieldset className="mt-8 rounded-2xl border-2 border-border bg-card p-6">
        <legend className="px-2 text-xl font-semibold text-foreground">
          How would you like to use the gym?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CATEGORY_OPTIONS.map((option) => {
            const selected = category === option;
            return (
              <label
                key={option}
                className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-base font-medium ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={option}
                  checked={selected}
                  onChange={() => setCategory(option)}
                  className="size-5 accent-current"
                />
                <span>{CATEGORY_LABELS[option]}</span>
                {selected && <Check className="ml-auto size-5" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      {category ? (
        <PlanList category={category} />
      ) : (
        <p className="mt-8 rounded-xl border-2 border-dashed border-border bg-card p-6 text-lg text-muted-foreground">
          Select a category above to see the plans and prices.
        </p>
      )}
    </div>
  );
}

function PlanList({ category }: { category: AccessibilityCategory }) {
  const group = planGroupFor(category);
  const plans = PLANS[group];
  const basic = plans[0]!;
  const premium = plans[1]!;

  return (
    <section className="mt-10" aria-live="polite">
      <h2 className="text-2xl font-bold text-foreground">
        Plans for: {CATEGORY_LABELS[category]}
      </h2>
      {category === "additional-assistance" && (
        <p className="mt-2 rounded-lg border-2 border-border bg-card p-4 text-muted-foreground">
          Members who require additional assistance use the standard price list. Staff assistance is
          arranged with you at no extra cost.
        </p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.tier}
            className="flex flex-col rounded-2xl border-2 border-border bg-card p-6"
          >
            <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
            <p className="mt-1 text-3xl font-bold text-teal">
              {formatRand(plan.price)}
              <span className="text-base font-medium text-muted-foreground"> per month</span>
            </p>
            {plan.tier === "premium" && (
              <p className="mt-3 font-semibold text-foreground">Everything in Basic, plus:</p>
            )}
            <ul className="mt-3 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-foreground">
                  <Check className="mt-1 size-5 shrink-0 text-teal" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-6 inline-flex min-h-13 items-center justify-center rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90"
            >
              Join with {plan.name}
            </Link>
          </article>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold text-foreground">Basic compared with Premium</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-border bg-card">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparison of Basic and Premium membership for {CATEGORY_LABELS[category]}
          </caption>
          <thead>
            <tr className="bg-surface">
              <th scope="col" className="p-4 font-semibold">
                What you get
              </th>
              <th scope="col" className="p-4 font-semibold">
                Basic — {formatRand(basic.price)}
              </th>
              <th scope="col" className="p-4 font-semibold">
                Premium — {formatRand(premium.price)}
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Full gym access", "Yes", "Yes"],
              ["AI Fitness Assistant", "Yes", "Yes"],
              ["Workout plans", "Standard plans", "Personalised workouts"],
              ["Progress tracking", "Basic", "Enhanced"],
              [
                "Staff support",
                group === "visually-impaired" ? "Basic assistance" : "General guidance",
                group === "visually-impaired"
                  ? "Priority and one-on-one support"
                  : "Additional guidance and priority services",
              ],
              [
                "Audio guidance",
                group === "visually-impaired" ? "Accessible instructions" : "Available on request",
                group === "visually-impaired" ? "Advanced audio guidance" : "Available on request",
              ],
            ].map(([label, b, p]) => (
              <tr key={label} className="border-t-2 border-border">
                <th scope="row" className="p-4 font-medium">
                  {label}
                </th>
                <td className="p-4">{b}</td>
                <td className="p-4">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        In short: Basic gives you essential gym access and the accessibility support you need.
        Premium adds personalised support and advanced features.
      </p>
    </section>
  );
}
