import Anthropic from "@anthropic-ai/sdk";
import { runLocalCommand } from "./commands";
import type { CommandContext } from "./commands";
import type { IversonSettings } from "./storage";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Iverson, a highly capable personal AI agent inspired by J.A.R.V.I.S. from Iron Man.
You are witty, calm, extremely competent, concise, and refer to the user respectfully. Keep replies short
(1-4 sentences) unless asked for detail, since replies may be spoken aloud by text-to-speech.`;

export async function think(
  userText: string,
  history: ChatTurn[],
  settings: IversonSettings,
  ctx: CommandContext
): Promise<string> {
  // 1. Try local deterministic commands first (fast, offline, free).
  const local = await runLocalCommand(userText, ctx);
  if (local.handled) return local.reply;

  // 2. If an API key is configured for the chosen provider, escalate to the real LLM brain.
  const apiKey = settings.apiKeys[settings.provider];
  if (apiKey) {
    try {
      const reply =
        settings.provider === "anthropic"
          ? await askClaude(userText, history, apiKey, settings.model)
          : await askOpenAICompatible(userText, history, apiKey, settings);
      if (reply) return reply;
      throw new Error("Empty response");
    } catch (err) {
      return `I couldn't reach the language model (${(err as Error).message}). Falling back to local reasoning: I heard "${userText}", but I don't have a scripted answer for that yet.`;
    }
  }

  // 3. Pluggable fallback: no key configured, demo-mode generic reply.
  return pickFallback(userText);
}

const GENERIC_FALLBACKS = [
  "I don't have a scripted response for that yet, and no language model is connected. Add an API key in Settings to unlock full reasoning.",
  "That's outside my offline command set. Plug in an API key in Settings and I'll be able to answer virtually anything.",
  "Running in offline demo mode, so my answers are limited to built-in commands right now. Try 'what time is it', 'tell me a joke', or connect an API key for full intelligence.",
];

function pickFallback(_userText: string): string {
  return GENERIC_FALLBACKS[Math.floor(Math.random() * GENERIC_FALLBACKS.length)];
}

async function askOpenAICompatible(
  userText: string,
  history: ChatTurn[],
  apiKey: string,
  settings: IversonSettings
): Promise<string | undefined> {
  const res = await fetch(settings.apiBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: userText },
      ],
      temperature: 0.6,
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim();
}

let claudeClient: { key: string; client: Anthropic } | null = null;

function getClaudeClient(apiKey: string): Anthropic {
  if (claudeClient?.key !== apiKey) {
    // The key is the user's own, entered in Settings and kept on this device,
    // so calling the API straight from the app is intended here.
    claudeClient = { key: apiKey, client: new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) };
  }
  return claudeClient.client;
}

async function askClaude(
  userText: string,
  history: ChatTurn[],
  apiKey: string,
  model: string
): Promise<string | undefined> {
  const client = getClaudeClient(apiKey);
  // Haiku 4.5 rejects `effort`; server-side fallbacks apply to Opus 5 / Fable-tier models.
  const supportsEffort = !model.includes("haiku");
  const supportsFallbacks = model.startsWith("claude-opus-5") || model.startsWith("claude-fable");

  const response = await client.beta.messages.create({
    model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: userText },
    ],
    // Short spoken replies: low effort keeps answers quick.
    ...(supportsEffort ? { output_config: { effort: "low" as const } } : {}),
    ...(supportsFallbacks
      ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
      : {}),
  });

  if (response.stop_reason === "refusal") {
    return "I'm afraid I can't help with that one.";
  }
  return response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
}
