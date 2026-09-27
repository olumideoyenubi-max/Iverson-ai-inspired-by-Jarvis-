import { Capacitor } from "@capacitor/core";

export type AppPlatform = "ios" | "android" | "desktop" | "web";

/** Where Iverson is running: the iOS/Android shells, the Electron desktop app, or a browser. */
export function getAppPlatform(): AppPlatform {
  const native = Capacitor.getPlatform();
  if (native === "ios" || native === "android") return native;
  if (typeof navigator !== "undefined" && navigator.userAgent.includes("Electron")) return "desktop";
  return "web";
}
