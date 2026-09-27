import { VoiceError } from "./types";
import type { ListenOptions, VoiceEngine } from "./types";
import type { IversonSettings } from "../storage";

// Records one utterance from the microphone (using a simple loudness-based
// voice detector) and transcribes it with Whisper via Groq (free) or OpenAI.

const END_OF_SPEECH_MS = 1200;
const MAX_UTTERANCE_MS = 15000;

type Transcriber = { url: string; model: string; key: string };

function pickTranscriber(settings: IversonSettings): Transcriber | null {
  const { groq, openai } = settings.apiKeys;
  if (groq) return { url: "https://api.groq.com/openai/v1/audio/transcriptions", model: "whisper-large-v3-turbo", key: groq };
  if (openai) return { url: "https://api.openai.com/v1/audio/transcriptions", model: "whisper-1", key: openai };
  return null;
}

export function hasCloudTranscriber(settings: IversonSettings) {
  return pickTranscriber(settings) !== null;
}

async function recordUtterance(signal: AbortSignal, maxWaitMs: number): Promise<Blob | null> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    throw new VoiceError("permission", "Microphone access was denied.");
  }

  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  const level = () => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const s of samples) sum += s * s;
    return Math.sqrt(sum / samples.length);
  };

  const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.start(250);

  const cleanup = () => {
    stream.getTracks().forEach((t) => t.stop());
    ctx.close().catch(() => {});
  };

  return new Promise((resolve) => {
    const started = performance.now();
    let noiseFloor = 0.01;
    let speechAt = 0;
    let lastLoud = 0;

    const stop = (keep: boolean) => {
      clearInterval(poll);
      signal.removeEventListener("abort", onAbort);
      recorder.onstop = () => {
        cleanup();
        resolve(keep ? new Blob(chunks, { type: recorder.mimeType }) : null);
      };
      recorder.stop();
    };
    const onAbort = () => stop(false);
    signal.addEventListener("abort", onAbort, { once: true });

    const poll = setInterval(() => {
      const now = performance.now();
      const rms = level();
      // Learn the room's background level for the first half second.
      if (now - started < 500) {
        noiseFloor = Math.max(noiseFloor, rms);
        return;
      }
      const loud = rms > Math.max(0.02, noiseFloor * 2.5);
      if (loud) {
        lastLoud = now;
        if (!speechAt) speechAt = now;
      }
      if (!speechAt) {
        if (maxWaitMs && now - started > maxWaitMs) stop(false);
        return;
      }
      if (now - lastLoud > END_OF_SPEECH_MS || now - speechAt > MAX_UTTERANCE_MS) stop(true);
    }, 50);
  });
}

async function transcribe(audio: Blob, t: Transcriber): Promise<string> {
  const ext = audio.type.includes("mp4") ? "m4a" : "webm";
  const form = new FormData();
  form.append("file", audio, `speech.${ext}`);
  form.append("model", t.model);
  form.append("language", "en");
  let res: Response;
  try {
    res = await fetch(t.url, { method: "POST", headers: { Authorization: `Bearer ${t.key}` }, body: form });
  } catch {
    throw new VoiceError("network", "Couldn't reach the transcription service.");
  }
  if (!res.ok) throw new VoiceError("network", `Transcription failed (error ${res.status}).`);
  const data = await res.json();
  return String(data.text ?? "").trim();
}

export function createCloudEngine(getSettings: () => IversonSettings): VoiceEngine {
  return {
    kind: "cloud",
    async listenOnce({ signal, maxWaitMs }: ListenOptions) {
      const transcriber = pickTranscriber(getSettings());
      if (!transcriber) {
        throw new VoiceError(
          "no-key",
          "To talk to me here, add a free Groq key (or an OpenAI key) in Settings → Language model. I use it to turn your voice into text."
        );
      }
      const audio = await recordUtterance(signal, maxWaitMs);
      if (!audio || signal.aborted) return "";
      return transcribe(audio, transcriber);
    },
  };
}
