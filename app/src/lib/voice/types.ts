export type ListenOptions = {
  signal: AbortSignal;
  /** Give up if no speech starts within this many ms (0 = wait until aborted). */
  maxWaitMs: number;
};

export type VoiceEngine = {
  kind: "web" | "native" | "cloud";
  /** Resolves with what was said, or "" if nothing was heard. Rejects with a VoiceError. */
  listenOnce(opts: ListenOptions): Promise<string>;
};

export type VoiceErrorCode = "permission" | "no-key" | "unavailable" | "network";

export class VoiceError extends Error {
  code: VoiceErrorCode;
  constructor(code: VoiceErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
