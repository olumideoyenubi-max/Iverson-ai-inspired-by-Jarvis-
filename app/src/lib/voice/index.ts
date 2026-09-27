import { getAppPlatform } from "../platform";
import { isSpeechRecognitionSupported } from "../speech";
import type { IversonSettings } from "../storage";
import { createCloudEngine } from "./cloudEngine";
import { nativeEngine } from "./nativeEngine";
import { webEngine } from "./webEngine";
import type { VoiceEngine } from "./types";

export { VoiceError } from "./types";
export type { VoiceEngine } from "./types";
export { hasCloudTranscriber } from "./cloudEngine";

/**
 * iOS/Android: the phone's own recognizer. Browsers with the Web Speech API: that.
 * Desktop app (and anything else with a microphone): record + Whisper transcription.
 */
export function pickVoiceEngine(getSettings: () => IversonSettings): VoiceEngine | null {
  const platform = getAppPlatform();
  if (platform === "ios" || platform === "android") return nativeEngine;
  if (platform === "web" && isSpeechRecognitionSupported()) return webEngine;
  if (typeof MediaRecorder !== "undefined" && "mediaDevices" in navigator) return createCloudEngine(getSettings);
  return null;
}
