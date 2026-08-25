import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  LayoutList,
  ListTodo,
  Moon,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BlueTask — Calm Task Management" },
      { name: "description", content: "A minimal, calming blue task manager for organizing daily work." },
      { property: "og:title", content: "BlueTask — Calm Task Management" },
      { property: "og:description", content: "A minimal, calming blue task manager for organizing daily work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORIES = ["Personal", "Work", "Shopping", "Health"] as const;
type Category = (typeof CATEGORIES)[number];

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  createdAt: number;
}

type Filter = "all" | Category | "completed";

const STORAGE_KEY = "bluetask-tasks";
const THEME_KEY = "bluetask-theme";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function useTheme() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(THEME_KEY) : null;
    const prefersDark =
      stored === null && typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return { dark, toggle, mounted };
}

function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        setTasks(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  const addTask = (title: string, category: Category) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: generateId(), title: trimmed, category, completed: false, createdAt: Date.now() },
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, addTask, toggleTask, deleteTask, loaded };
}

function categoryBadgeColor(category: Category) {
  switch (category) {
    case "Personal":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200";
    case "Work":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200";
    case "Shopping":
      return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200";
    case "Health":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function Index() {
  const { tasks, addTask, toggleTask, deleteTask, loaded } = useTasks();
  const { dark, toggle: toggleTheme, mounted } = useTheme();
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks.filter((t) => t.category === filter);
  }, [tasks, filter]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(newTask, category);
    setNewTask("");
  };

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      Personal: tasks.filter((t) => t.category === "Personal").length,
      Work: tasks.filter((t) => t.category === "Work").length,
      Shopping: tasks.filter((t) => t.category === "Shopping").length,
      Health: tasks.filter((t) => t.category === "Health").length,
    };
    return c;
  }, [tasks]);

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    ...CATEGORIES.map((c) => ({ label: c, value: c as Filter })),
    { label: "Completed", value: "completed" },
  ];

  // Prevent hydration mismatch by rendering a stable shell before mount.
  if (!mounted || !loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListTodo className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                BlueTask
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Stay organized, one calm step at a time.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="hidden sm:inline">{dark ? "Dark" : "Light"}</span>
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Switch
              checked={dark}
              onCheckedChange={toggleTheme}
              className="ml-1 data-[state=unchecked]:bg-input"
            />
          </button>
        </header>

        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Progress
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {completedCount}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {tasks.length} completed
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-primary">{progress}%</p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <form
          onSubmit={handleAdd}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <Input
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="h-11 flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
          <div className="flex items-center gap-3">
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              <SelectTrigger className="h-11 w-full border-border bg-background sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="h-11 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!newTask.trim()}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-14 text-center shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {filter === "completed" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <LayoutList className="h-6 w-6" />
                )}
              </div>
              <p className="text-base font-medium text-foreground">
                {filter === "completed"
                  ? "No completed tasks yet"
                  : filter === "all"
                    ? "No tasks yet"
                    : `No ${filter} tasks`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === "completed"
                  ? "Finish a task and it will appear here."
                  : "Add your first task above to get started."}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md",
                  task.completed && "opacity-70",
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium text-foreground transition-all",
                      task.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        categoryBadgeColor(task.category),
                      )}
                    >
                      {task.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <p>BlueTask — your calm, organized day starts here.</p>
        </footer>
      </div>
    </div>
  );
}
