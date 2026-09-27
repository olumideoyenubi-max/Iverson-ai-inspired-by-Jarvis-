export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
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
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
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
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
