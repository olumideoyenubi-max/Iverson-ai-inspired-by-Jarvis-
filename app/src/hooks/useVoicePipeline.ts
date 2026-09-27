import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { pickVoiceEngine, VoiceError } from "../lib/voice";
import type { IversonSettings } from "../lib/storage";

const WAKE_PATTERN = /\b(hey\s+)?iverson\b/i;
const COMMAND_WAIT_MS = 8000;

export type VoicePipelineOptions = {
  wakeWordEnabled: boolean;
  paused: boolean; // pause everything while assistant is speaking or busy
  getSettings: () => IversonSettings;
  onWakeTriggered?: () => void;
  onCommand: (text: string) => void;
  /** Something the user needs to know, e.g. a missing permission or key. */
  onNotice?: (message: string) => void;
};

export function useVoicePipeline(opts: VoicePipelineOptions) {
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });
  const [engine] = useState(() => pickVoiceEngine(() => optsRef.current.getSettings()));
  const supported = engine !== null;

  const [manualListening, setManualListening] = useState(false);
  const commandCtrlRef = useRef<AbortController | null>(null);

  const report = useCallback((err: unknown) => {
    if (err instanceof VoiceError) optsRef.current.onNotice?.(err.message);
  }, []);

  const stopAll = useCallback(() => {
    commandCtrlRef.current?.abort();
    commandCtrlRef.current = null;
    setManualListening(false);
  }, []);

  const startCommandListening = useCallback(() => {
    if (!engine) return;
    commandCtrlRef.current?.abort();
    const ctrl = new AbortController();
    commandCtrlRef.current = ctrl;
    setManualListening(true);
    engine
      .listenOnce({ signal: ctrl.signal, maxWaitMs: COMMAND_WAIT_MS })
      .then((text) => {
        if (text && !ctrl.signal.aborted) optsRef.current.onCommand(text);
      })
      .catch(report)
      .finally(() => {
        if (commandCtrlRef.current === ctrl) {
          commandCtrlRef.current = null;
          setManualListening(false);
        }
      });
  }, [engine, report]);

  // Wake-word loop: listen for one utterance at a time and check it for "Iverson".
  useEffect(() => {
    if (!engine || !opts.wakeWordEnabled || opts.paused || manualListening) return;
    const ctrl = new AbortController();
    (async () => {
      while (!ctrl.signal.aborted) {
        let text = "";
        try {
          text = await engine.listenOnce({ signal: ctrl.signal, maxWaitMs: 0 });
        } catch (err) {
          if (ctrl.signal.aborted) return;
          report(err);
          if (err instanceof VoiceError && err.code !== "network") return;
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        if (ctrl.signal.aborted) return;
        if (WAKE_PATTERN.test(text)) {
          const remainder = text.replace(WAKE_PATTERN, "").replace(/^[\s,.!?]+/, "").trim();
          optsRef.current.onWakeTriggered?.();
          if (remainder.length > 2) optsRef.current.onCommand(remainder);
          else startCommandListening();
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    })();
    return () => ctrl.abort();
  }, [engine, opts.wakeWordEnabled, opts.paused, manualListening, startCommandListening, report]);

  useEffect(() => () => commandCtrlRef.current?.abort(), []);

  return {
    supported,
    engineKind: engine?.kind ?? null,
    manualListening,
    startCommandListening,
    stopAll,
  };
}
