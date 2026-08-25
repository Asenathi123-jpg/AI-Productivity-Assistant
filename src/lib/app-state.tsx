import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AccessibilityCategory =
  | "visually-impaired"
  | "not-visually-impaired"
  | "additional-assistance";

export type PlanTier = "basic" | "premium";

export interface Preferences {
  textSize: number; // percent, 100 = default
  highContrast: boolean;
  darkMode: boolean;
  screenReaderSupport: boolean;
  audioInstructions: boolean;
  textToSpeech: boolean;
  reducedMotion: boolean;
  simplifiedNavigation: boolean;
  assistancePreference: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  label: string;
  minutes: number;
}

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  category: AccessibilityCategory;
  goals: string[];
  plan: PlanTier;
  joinedAt: string;
}

export interface AppData {
  user: UserAccount | null;
  preferences: Preferences;
  progress: ProgressEntry[];
}

export const DEFAULT_PREFERENCES: Preferences = {
  textSize: 100,
  highContrast: false,
  darkMode: false,
  screenReaderSupport: false,
  audioInstructions: false,
  textToSpeech: false,
  reducedMotion: false,
  simplifiedNavigation: false,
  assistancePreference: "none",
};

const STORAGE_KEY = "outbound-fitness-v1";

export const CATEGORY_LABELS: Record<AccessibilityCategory, string> = {
  "visually-impaired": "Blind / Visually Impaired",
  "not-visually-impaired": "Not Visually Impaired",
  "additional-assistance": "I Require Additional Assistance",
};

export const FITNESS_GOALS = [
  "Build strength",
  "Improve fitness",
  "Weight management",
  "Improve mobility",
  "General health",
] as const;

interface PlanDefinition {
  tier: PlanTier;
  name: string;
  price: number;
  features: string[];
}

export const PLANS: Record<
  "visually-impaired" | "not-visually-impaired",
  PlanDefinition[]
> = {
  "visually-impaired": [
    {
      tier: "basic",
      name: "Basic",
      price: 1500,
      features: [
        "Full gym access",
        "Accessible equipment",
        "Accessible exercise instructions",
        "Basic staff assistance",
        "Gym orientation",
        "Beginner workouts",
        "AI Fitness Assistant",
      ],
    },
    {
      tier: "premium",
      name: "Premium",
      price: 2000,
      features: [
        "Personalised workouts",
        "Additional one-on-one support",
        "Priority staff assistance",
        "Advanced audio guidance",
        "Enhanced progress tracking",
        "Personalised fitness recommendations",
      ],
    },
  ],
  "not-visually-impaired": [
    {
      tier: "basic",
      name: "Basic",
      price: 1000,
      features: [
        "Full gym access",
        "Standard equipment",
        "Basic workout plans",
        "AI Fitness Assistant",
        "General fitness guidance",
        "Basic progress tracking",
      ],
    },
    {
      tier: "premium",
      name: "Premium",
      price: 200,
      features: [
        "Personalised workouts",
        "Additional fitness guidance",
        "Personalised recommendations",
        "Enhanced progress tracking",
        "Priority on selected services",
      ],
    },
  ],
};

export function planGroupFor(category: AccessibilityCategory) {
  return category === "visually-impaired"
    ? ("visually-impaired" as const)
    : ("not-visually-impaired" as const);
}

export function getPlan(category: AccessibilityCategory, tier: PlanTier) {
  return PLANS[planGroupFor(category)].find((p) => p.tier === tier)!;
}

export function formatRand(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

interface AppContextValue extends AppData {
  ready: boolean;
  signUp: (user: UserAccount) => void;
  signIn: (email: string) => boolean;
  signOut: () => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetPreferences: () => void;
  addProgress: (entry: Omit<ProgressEntry, "id">) => void;
  speak: (text: string) => void;
  announce: (text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    user: null,
    preferences: DEFAULT_PREFERENCES,
    progress: [],
  });
  const [ready, setReady] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppData>;
        setData({
          user: parsed.user ?? null,
          preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
          progress: parsed.progress ?? [],
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  // Apply visual preferences to the document.
  useEffect(() => {
    if (!ready) return;
    const p = data.preferences;
    const root = document.documentElement;
    root.style.fontSize = `${p.textSize}%`;
    root.classList.toggle("contrast-high", p.highContrast);
    root.classList.toggle("dark", p.darkMode);
    root.classList.toggle("reduce-motion", p.reducedMotion);
  }, [data.preferences, ready]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (!data.preferences.textToSpeech && !data.preferences.audioInstructions) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [data.preferences.textToSpeech, data.preferences.audioInstructions],
  );

  const announce = useCallback((text: string) => {
    setLiveMessage("");
    window.setTimeout(() => setLiveMessage(text), 60);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...data,
      ready,
      signUp: (user) =>
        setData((d) => ({
          ...d,
          user,
          preferences: {
            ...d.preferences,
            ...(user.category === "visually-impaired"
              ? {
                  textSize: Math.max(d.preferences.textSize, 115),
                  screenReaderSupport: true,
                  audioInstructions: true,
                  textToSpeech: true,
                  highContrast: true,
                  reducedMotion: true,
                }
              : {}),
            assistancePreference:
              user.category === "additional-assistance"
                ? "staff-assistance"
                : d.preferences.assistancePreference,
          },
        })),
      signIn: (email) => {
        if (data.user && data.user.email.toLowerCase() === email.trim().toLowerCase()) {
          return true;
        }
        return false;
      },
      signOut: () => setData((d) => ({ ...d, user: null })),
      updatePreferences: (patch) =>
        setData((d) => ({ ...d, preferences: { ...d.preferences, ...patch } })),
      resetPreferences: () => setData((d) => ({ ...d, preferences: DEFAULT_PREFERENCES })),
      addProgress: (entry) =>
        setData((d) => ({
          ...d,
          progress: [{ ...entry, id: `${Date.now()}` }, ...d.progress].slice(0, 50),
        })),
      speak,
      announce,
    }),
    [data, ready, speak, announce],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
