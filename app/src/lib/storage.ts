export type IversonSettings = {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  voiceOutputEnabled: boolean;
  wakeWordEnabled: boolean;
  selectedVoiceURI: string | null;
  userName: string;
};

const SETTINGS_KEY = "iverson.settings.v1";
const NOTES_KEY = "iverson.notes.v1";
const LOG_KEY = "iverson.log.v1";

export const defaultSettings: IversonSettings = {
  apiKey: "",
  apiBaseUrl: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
  voiceOutputEnabled: true,
  wakeWordEnabled: false,
  selectedVoiceURI: null,
  userName: "Sir",
};

export function loadSettings(): IversonSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: IversonSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadNotes(): string[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: string[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function appendEventLog(entry: string) {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    list.unshift(`${new Date().toLocaleString()} — ${entry}`);
    localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* noop */
  }
}

export function loadEventLog(): string[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
