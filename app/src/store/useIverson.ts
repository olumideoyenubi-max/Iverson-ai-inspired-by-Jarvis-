import { create } from "zustand";
import { defaultSettings, loadSettings, saveSettings } from "../lib/storage";
import type { IversonSettings } from "../lib/storage";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
};

export type IversonStatus = "idle" | "listening" | "thinking" | "speaking" | "alert";

type IversonState = {
  messages: ChatMessage[];
  addMessage: (role: ChatMessage["role"], content: string) => ChatMessage;

  settings: IversonSettings;
  updateSettings: (patch: Partial<IversonSettings>) => void;

  status: IversonStatus;
  setStatus: (s: IversonStatus) => void;

  cameraOn: boolean;
  setCameraOn: (on: boolean) => void;

  motionEnabled: boolean;
  setMotionEnabled: (on: boolean) => void;

  motionAlerts: string[];
  pushMotionAlert: (msg: string) => void;

  lightsOn: boolean;
  setLightsOn: (on: boolean) => void;

  wakeWordArmed: boolean;
  setWakeWordArmed: (on: boolean) => void;

  settingsOpen: boolean;
  setSettingsOpen: (on: boolean) => void;
};

export const useIverson = create<IversonState>((set) => ({
  messages: [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Systems online. I'm Iverson. How can I help you today?",
      ts: Date.now(),
    },
  ],
  addMessage: (role, content) => {
    const msg: ChatMessage = { id: crypto.randomUUID(), role, content, ts: Date.now() };
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },

  settings: loadSettings(),
  updateSettings: (patch) =>
    set((s) => {
      const next = { ...s.settings, ...patch };
      saveSettings(next);
      return { settings: next };
    }),

  status: "idle",
  setStatus: (status) => set({ status }),

  cameraOn: false,
  setCameraOn: (on) => set({ cameraOn: on }),

  motionEnabled: false,
  setMotionEnabled: (on) => set({ motionEnabled: on }),

  motionAlerts: [],
  pushMotionAlert: (msg) => set((s) => ({ motionAlerts: [msg, ...s.motionAlerts].slice(0, 30) })),

  lightsOn: false,
  setLightsOn: (on) => set({ lightsOn: on }),

  wakeWordArmed: false,
  setWakeWordArmed: (on) => set({ wakeWordArmed: on }),

  settingsOpen: false,
  setSettingsOpen: (on) => set({ settingsOpen: on }),
}));

export const resetSettingsFallback = defaultSettings;
