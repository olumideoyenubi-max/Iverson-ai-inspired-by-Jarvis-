import { useCallback, useEffect, useRef, useState } from "react";
import { createRecognition, isSpeechRecognitionSupported } from "../lib/speech";

const WAKE_PATTERN = /\b(hey\s+)?iverson\b/i;

export type VoicePipelineOptions = {
  wakeWordEnabled: boolean;
  paused: boolean; // pause everything while assistant is speaking or busy
  onWakeTriggered?: () => void;
  onCommand: (text: string) => void;
};

export function useVoicePipeline(opts: VoicePipelineOptions) {
  const supported = isSpeechRecognitionSupported();
  const [manualListening, setManualListening] = useState(false);
  const commandRecRef = useRef<SpeechRecognition | null>(null);
  const wakeRecRef = useRef<SpeechRecognition | null>(null);
  const modeRef = useRef<"idle" | "wake" | "command">("idle");
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const stopAll = useCallback(() => {
    commandRecRef.current?.abort();
    wakeRecRef.current?.abort();
    modeRef.current = "idle";
    setManualListening(false);
  }, []);

  const startCommandListening = useCallback(() => {
    if (!supported) return;
    wakeRecRef.current?.abort();
    const rec = createRecognition({ continuous: false, interimResults: false, lang: "en-US" });
    if (!rec) return;
    commandRecRef.current = rec;
    modeRef.current = "command";
    setManualListening(true);
    rec.onresult = (ev) => {
      const result = ev.results[ev.results.length - 1];
      const transcript = result?.[0]?.transcript?.trim();
      if (transcript) optsRef.current.onCommand(transcript);
    };
    rec.onerror = () => {
      setManualListening(false);
      modeRef.current = "idle";
    };
    rec.onend = () => {
      setManualListening(false);
      modeRef.current = "idle";
    };
    try {
      rec.start();
    } catch {
      /* ignore double-start errors */
    }
  }, [supported]);

  const startWakeListening = useCallback(() => {
    if (!supported) return;
    const rec = createRecognition({ continuous: true, interimResults: false, lang: "en-US" });
    if (!rec) return;
    wakeRecRef.current = rec;
    modeRef.current = "wake";
    rec.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const transcript = ev.results[i]?.[0]?.transcript ?? "";
        if (WAKE_PATTERN.test(transcript)) {
          const remainder = transcript.replace(WAKE_PATTERN, "").trim();
          optsRef.current.onWakeTriggered?.();
          wakeRecRef.current?.abort();
          if (remainder.length > 2) {
            optsRef.current.onCommand(remainder);
          } else {
            startCommandListening();
          }
          return;
        }
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        modeRef.current = "idle";
        return;
      }
      // auto-restart on transient errors
    };
    rec.onend = () => {
      if (modeRef.current === "wake" && optsRef.current.wakeWordEnabled && !optsRef.current.paused) {
        try {
          rec.start();
        } catch {
          /* noop */
        }
      }
    };
    try {
      rec.start();
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, startCommandListening]);

  useEffect(() => {
    if (!supported) return;
    if (opts.wakeWordEnabled && !opts.paused && modeRef.current === "idle") {
      startWakeListening();
    }
    if ((!opts.wakeWordEnabled || opts.paused) && modeRef.current === "wake") {
      wakeRecRef.current?.abort();
      modeRef.current = "idle";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.wakeWordEnabled, opts.paused, supported]);

  useEffect(() => {
    return () => {
      commandRecRef.current?.abort();
      wakeRecRef.current?.abort();
    };
  }, []);

  return {
    supported,
    manualListening,
    startCommandListening,
    stopAll,
  };
}
