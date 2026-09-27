export type ProviderId = "openai" | "anthropic" | "groq" | "gemini" | "custom";

export type ProviderInfo = {
  label: string;
  /** OpenAI-compatible chat completions endpoint; unused for Anthropic (SDK). */
  endpoint: string;
  defaultModel: string;
  keyPlaceholder: string;
  keyUrl: string;
  note: string;
};

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  openai: {
    label: "ChatGPT (OpenAI)",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o-mini",
    keyPlaceholder: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys",
    note: "Paid per use. Needs billing set up on your OpenAI account.",
  },
  anthropic: {
    label: "Claude (Anthropic)",
    endpoint: "",
    defaultModel: "claude-opus-5",
    keyPlaceholder: "sk-ant-…",
    keyUrl: "https://console.anthropic.com/settings/keys",
    note: "Paid per use. Needs credits on your Anthropic Console account.",
  },
  groq: {
    label: "Groq — free tier",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    keyPlaceholder: "gsk_…",
    keyUrl: "https://console.groq.com/keys",
    note: "Free key, no card needed. Rate limited.",
  },
  gemini: {
    label: "Google Gemini — free tier",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    defaultModel: "gemini-2.5-flash",
    keyPlaceholder: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey",
    note: "Free key, no card needed. Rate limited.",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    endpoint: "",
    defaultModel: "",
    keyPlaceholder: "API key",
    keyUrl: "",
    note: "Any service with an OpenAI-style /chat/completions endpoint. Paste its endpoint URL and model name below.",
  },
};
