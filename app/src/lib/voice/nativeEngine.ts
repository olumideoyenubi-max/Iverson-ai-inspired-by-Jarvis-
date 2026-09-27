import { SpeechRecognition } from "@capgo/capacitor-speech-recognition";
import { VoiceError } from "./types";
import type { ListenOptions, VoiceEngine } from "./types";

// Treat the utterance as finished after this much quiet following the last word.
const END_OF_SPEECH_MS = 1300;

let permissionGranted = false;

async function ensurePermission() {
  if (permissionGranted) return;
  const { available } = await SpeechRecognition.available();
  if (!available) throw new VoiceError("unavailable", "Speech recognition isn't available on this device.");
  let status = await SpeechRecognition.checkPermissions();
  if (status.speechRecognition !== "granted") status = await SpeechRecognition.requestPermissions();
  if (status.speechRecognition !== "granted") {
    throw new VoiceError("permission", "Microphone or speech recognition permission was denied.");
  }
  permissionGranted = true;
}

/** The phone's built-in recognizer (Android SpeechRecognizer / iOS Speech framework). */
export const nativeEngine: VoiceEngine = {
  kind: "native",
  async listenOnce({ signal, maxWaitMs }: ListenOptions) {
    await ensurePermission();
    if (signal.aborted) return "";

    return new Promise<string>((resolve) => {
      let latest = "";
      let done = false;
      // A late "stopped" from the previous session must not end this one.
      let started = false;
      let quietTimer: ReturnType<typeof setTimeout> | undefined;
      const handles: Promise<{ remove: () => Promise<void> }>[] = [];

      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(quietTimer);
        clearTimeout(waitTimer);
        signal.removeEventListener("abort", finish);
        handles.forEach((h) => h.then((x) => x.remove()).catch(() => {}));
        SpeechRecognition.stop().catch(() => {});
        resolve(latest.trim());
      };

      const waitTimer = maxWaitMs ? setTimeout(() => !latest && finish(), maxWaitMs) : undefined;
      signal.addEventListener("abort", finish, { once: true });

      handles.push(
        SpeechRecognition.addListener("partialResults", (ev) => {
          const text = ev.matches?.[0] ?? ev.accumulatedText ?? "";
          if (!text) return;
          latest = text;
          clearTimeout(quietTimer);
          quietTimer = setTimeout(finish, END_OF_SPEECH_MS);
        })
      );
      handles.push(
        SpeechRecognition.addListener("listeningState", (ev) => {
          const state = ev.state ?? ev.status;
          if (state === "started" || state === "startingListening") started = true;
          else if (state === "stopped" && started) finish();
        })
      );

      SpeechRecognition.start({
        language: "en-US",
        maxResults: 1,
        partialResults: true,
        popup: false,
        muteRecognizerBeep: true,
      }).catch(finish);
    });
  },
};
