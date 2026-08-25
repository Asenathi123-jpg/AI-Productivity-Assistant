import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assistantSystemPrompt, workoutSystemPrompt } from "./ai-prompts";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
  visuallyImpaired: z.boolean().default(false),
  name: z.string().trim().max(80).optional(),
  plan: z.string().trim().max(80).optional(),
  goals: z.array(z.string().max(60)).max(6).optional(),
});

const workoutSchema = z.object({
  goal: z.string().trim().min(1).max(80),
  level: z.string().trim().min(1).max(40),
  duration: z.string().trim().min(1).max(40),
  equipment: z.string().trim().min(1).max(300),
  accessibility: z.string().trim().max(300).default(""),
  visuallyImpaired: z.boolean().default(false),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { reply: "", error: "AI is not configured yet." };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: assistantSystemPrompt({
              visuallyImpaired: data.visuallyImpaired,
              name: data.name,
              plan: data.plan,
              goals: data.goals,
            }),
          },
          ...data.messages,
        ],
      }),
    });

    if (response.status === 429)
      return { reply: "", error: "The assistant is busy right now. Please try again in a moment." };
    if (!response.ok)
      return { reply: "", error: "The assistant could not answer right now. Please try again." };

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { reply: json.choices?.[0]?.message?.content?.trim() ?? "", error: "" };
  });

export const generateWorkout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => workoutSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { plan: "", error: "AI is not configured yet." };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: workoutSystemPrompt(data.visuallyImpaired) },
          {
            role: "user",
            content: `Fitness goal: ${data.goal}\nExperience level: ${data.level}\nWorkout duration: ${data.duration}\nAvailable equipment: ${data.equipment}\nAccessibility requirements: ${data.accessibility || "none stated"}`,
          },
        ],
      }),
    });

    if (response.status === 429)
      return { plan: "", error: "The planner is busy right now. Please try again in a moment." };
    if (!response.ok)
      return { plan: "", error: "The workout could not be generated. Please try again." };

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { plan: json.choices?.[0]?.message?.content?.trim() ?? "", error: "" };
  });
