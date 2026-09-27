import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { getAppPlatform } from "./platform";

// Android's WebView has no speechSynthesis, so replies are spoken with the native TTS engine there.
const speaksNatively = () => getAppPlatform() === "android";

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  // Electron exposes the API but its Google speech backend isn't available, so it always fails.
  if (navigator.userAgent.includes("Electron")) return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createRecognition(opts: {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = opts.continuous ?? false;
  rec.interimResults = opts.interimResults ?? true;
  rec.lang = opts.lang ?? "en-US";
  rec.maxAlternatives = 1;
  return rec;
}

export function isSpeechSynthesisSupported(): boolean {
  if (speaksNatively()) return true;
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getVoices(): SpeechSynthesisVoice[] {
  if (speaksNatively() || !isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices;
}

export function speak(
  text: string,
  opts: { voiceURI?: string | null; rate?: number; pitch?: number; onEnd?: () => void; onStart?: () => void } = {}
) {
  if (!isSpeechSynthesisSupported() || !text) {
    opts.onEnd?.();
    return;
  }
  if (speaksNatively()) {
    opts.onStart?.();
    TextToSpeech.speak({ text, lang: "en-US", rate: opts.rate ?? 1.0, pitch: opts.pitch ?? 0.9 })
      .catch(() => {})
      .finally(() => opts.onEnd?.());
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = opts.rate ?? 1.02;
  utter.pitch = opts.pitch ?? 0.85;
  const voices = getVoices();
  const chosen = opts.voiceURI ? voices.find((v) => v.voiceURI === opts.voiceURI) : undefined;
  const fallback = voices.find((v) => /male|daniel|google uk english male|alex/i.test(v.name));
  utter.voice = chosen ?? fallback ?? voices[0] ?? null;
  utter.onstart = () => opts.onStart?.();
  utter.onend = () => opts.onEnd?.();
  utter.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (speaksNatively()) TextToSpeech.stop().catch(() => {});
  else if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
