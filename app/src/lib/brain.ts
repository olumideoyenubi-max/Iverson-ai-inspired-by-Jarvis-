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

  // 2. If an API key is configured, escalate to the real LLM brain.
  if (settings.apiKey) {
    try {
      const res = await fetch(settings.apiBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
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
      const reply = data?.choices?.[0]?.message?.content?.trim();
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
