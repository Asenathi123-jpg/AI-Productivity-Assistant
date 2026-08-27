import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Volume2, Square } from "lucide-react";
import { generateWorkout } from "@/lib/ai.functions";
import { AI_DISCLAIMER } from "@/lib/ai-prompts";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "AI Workout Planner — Outbound Fitness" },
      {
        name: "description",
        content:
          "Create a simple personalised workout with exercises, repetitions, rest periods, safety and accessibility guidance.",
      },
      { property: "og:title", content: "AI Workout Planner — Outbound Fitness" },
      {
        property: "og:description",
        content: "Personalised, accessible beginner-friendly workout plans generated for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workouts,
});

const GOALS = [
  "Build strength",
  "Improve fitness",
  "Weight management",
  "Improve mobility",
  "General health",
];
const LEVELS = ["Beginner", "Some experience", "Experienced"];
const DURATIONS = ["15 minutes", "20 minutes", "30 minutes", "45 minutes"];

function Workouts() {
  const { user, preferences, speak, announce, addProgress } = useApp();
  const run = useServerFn(generateWorkout);

  const visuallyImpaired =
    user?.category === "visually-impaired" || preferences.audioInstructions;

  const [goal, setGoal] = useState(user?.goals?.[0] ?? GOALS[0]!);
  const [level, setLevel] = useState(LEVELS[0]!);
  const [duration, setDuration] = useState(DURATIONS[1]!);
  const [equipment, setEquipment] = useState("Bodyweight only");
  const [accessibility, setAccessibility] = useState(
    user?.category === "visually-impaired" ? "Blind or visually impaired — audio guidance needed" : "",
  );
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan("");
    announce("Generating your workout. Please wait.");
    try {
      const result = await run({
        data: { goal, level, duration, equipment, accessibility, visuallyImpaired },
      });
      if (result.error) setError(result.error);
      else {
        setPlan(result.plan);
        announce("Your workout plan is ready below.");
        speak(result.plan);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">AI Workout Planner</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
        Tell us a few details and we will build a simple, safe workout for you.
      </p>
      <p className="mt-4 rounded-xl border-2 border-gold bg-card p-4 text-foreground">
        <strong>AI-generated content.</strong> {AI_DISCLAIMER}
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border-2 border-border bg-card p-6 sm:grid-cols-2">
        <SelectField id="goal" label="Fitness goal" value={goal} onChange={setGoal} options={GOALS} />
        <SelectField id="level" label="Experience level" value={level} onChange={setLevel} options={LEVELS} />
        <SelectField id="duration" label="Workout duration" value={duration} onChange={setDuration} options={DURATIONS} />
        <SelectField
          id="equipment"
          label="Available equipment"
          value={equipment}
          onChange={setEquipment}
          options={[
            "Bodyweight only",
            "Resistance bands",
            "Dumbbells",
            "Full gym equipment",
            "Seated or chair-based",
          ]}
        />
        <div className="sm:col-span-2">
          <label htmlFor="access" className="block text-lg font-semibold text-foreground">
            Accessibility requirements (optional)
          </label>
          <textarea
            id="access"
            rows={3}
            maxLength={300}
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            placeholder="For example: blind, needs audio guidance; limited shoulder mobility"
            className="mt-2 w-full rounded-xl border-2 border-input bg-background p-4 text-lg text-foreground"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-13 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
            {loading ? "Creating your workout…" : "Create my workout"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border-2 border-destructive bg-card p-4 font-semibold text-destructive">
          Error: {error}
        </p>
      )}

      {plan && (
        <section className="mt-8 rounded-2xl border-2 border-border bg-card p-6" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              Your workout{" "}
              <span className="rounded-md bg-gold px-2 py-0.5 text-sm font-semibold text-gold-foreground">
                AI-generated
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  const u = new SpeechSynthesisUtterance(plan);
                  u.rate = 0.95;
                  window.speechSynthesis?.speak(u);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-border px-4 font-semibold text-foreground hover:bg-accent"
              >
                <Volume2 className="size-5" aria-hidden="true" />
                Read aloud
              </button>
              <button
                type="button"
                onClick={() => window.speechSynthesis?.cancel()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-border px-4 font-semibold text-foreground hover:bg-accent"
              >
                <Square className="size-5" aria-hidden="true" />
                Stop
              </button>
            </div>
          </div>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-lg leading-relaxed text-foreground">
            {plan}
          </pre>
          <button
            type="button"
            onClick={() => {
              addProgress({
                date: new Date().toISOString(),
                label: `${goal} workout (${duration})`,
                minutes: parseInt(duration, 10) || 20,
              });
              announce("Workout saved to your progress.");
            }}
            className="mt-6 inline-flex min-h-13 items-center rounded-xl bg-teal px-6 py-3 text-lg font-semibold text-teal-foreground hover:opacity-90"
          >
            Mark this workout as completed
          </button>
          <p className="mt-4 text-muted-foreground">
            Stop immediately if anything hurts, and speak to a qualified professional before
            starting a new programme.
          </p>
        </section>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-13 w-full rounded-xl border-2 border-input bg-background px-3 text-lg text-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
