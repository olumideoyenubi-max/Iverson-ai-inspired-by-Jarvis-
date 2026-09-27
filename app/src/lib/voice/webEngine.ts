import { createRecognition } from "../speech";
import { VoiceError } from "./types";
import type { ListenOptions, VoiceEngine } from "./types";

/** Browser Web Speech API (Chrome, Edge, Safari). */
export const webEngine: VoiceEngine = {
  kind: "web",
  listenOnce({ signal, maxWaitMs }: ListenOptions) {
    return new Promise((resolve, reject) => {
      const rec = createRecognition({ continuous: false, interimResults: false, lang: "en-US" });
      if (!rec) return reject(new VoiceError("unavailable", "Speech recognition isn't available here."));
      let transcript = "";
      let failed: VoiceError | null = null;
      const timer = maxWaitMs ? setTimeout(() => rec.abort(), maxWaitMs) : undefined;
      const onAbort = () => rec.abort();
      signal.addEventListener("abort", onAbort, { once: true });

      rec.onresult = (ev) => {
        transcript = ev.results[ev.results.length - 1]?.[0]?.transcript?.trim() ?? "";
      };
      rec.onerror = (ev) => {
        if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
          failed = new VoiceError("permission", "Microphone access was denied.");
        } else if (ev.error === "network") {
          failed = new VoiceError("network", "Speech recognition needs an internet connection.");
        }
      };
      rec.onend = () => {
        clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
        if (failed) reject(failed);
        else resolve(transcript);
      };
      try {
        rec.start();
      } catch {
        resolve("");
      }
    });
  },
};
