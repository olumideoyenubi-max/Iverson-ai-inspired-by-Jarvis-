import { useEffect, useState } from "react";
import type { IversonSettings } from "../lib/storage";
import { getVoices, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from "../lib/speech";

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  settings: IversonSettings;
  onChange: (patch: Partial<IversonSettings>) => void;
}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;
    const update = () => setVoices(getVoices());
    update();
    window.speechSynthesis.onvoiceschanged = update;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg panel-glass clip-corner p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-hud text-lg tracking-[0.2em] text-iverson-cyan text-glow">IVERSON CONFIG</h2>
          <button onClick={onClose} className="text-iverson-cyan/70 hover:text-iverson-cyan text-xl leading-none">
            ×
          </button>
        </div>

        <section className="mb-5">
          <h3 className="text-[11px] font-mono tracking-widest text-iverson-cyanDim mb-2">IDENTITY</h3>
          <label className="text-xs text-iverson-cyan/80 block mb-1">What should Iverson call you?</label>
          <input
            value={settings.userName}
            onChange={(e) => onChange({ userName: e.target.value })}
            className="w-full bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan focus:outline-none focus:border-iverson-cyan"
          />
        </section>

        <section className="mb-5">
          <h3 className="text-[11px] font-mono tracking-widest text-iverson-cyanDim mb-2">LANGUAGE MODEL (OPTIONAL)</h3>
          <p className="text-[11px] text-iverson-cyanDim/80 mb-2">
            Iverson works offline with a built-in command engine. Add an OpenAI-compatible API key to unlock full
            conversational reasoning. Your key is stored only in this browser's local storage and sent directly
            to the API endpoint below — never anywhere else.
          </p>
          <label className="text-xs text-iverson-cyan/80 block mb-1">API Key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => onChange({ apiKey: e.target.value })}
            placeholder="sk-…"
            className="w-full bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan mb-2 focus:outline-none focus:border-iverson-cyan"
          />
          <label className="text-xs text-iverson-cyan/80 block mb-1">API Endpoint</label>
          <input
            value={settings.apiBaseUrl}
            onChange={(e) => onChange({ apiBaseUrl: e.target.value })}
            className="w-full bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan mb-2 focus:outline-none focus:border-iverson-cyan"
          />
          <label className="text-xs text-iverson-cyan/80 block mb-1">Model</label>
          <input
            value={settings.model}
            onChange={(e) => onChange({ model: e.target.value })}
            className="w-full bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan focus:outline-none focus:border-iverson-cyan"
          />
        </section>

        <section className="mb-5">
          <h3 className="text-[11px] font-mono tracking-widest text-iverson-cyanDim mb-2">VOICE</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-iverson-cyan/80">Speak replies aloud</span>
            <Toggle
              checked={settings.voiceOutputEnabled}
              onChange={(v) => onChange({ voiceOutputEnabled: v })}
              disabled={!isSpeechSynthesisSupported()}
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-iverson-cyan/80">
              Wake word ("Hey Iverson") {isSpeechRecognitionSupported() ? "" : "— unsupported in this browser"}
            </span>
            <Toggle
              checked={settings.wakeWordEnabled}
              onChange={(v) => onChange({ wakeWordEnabled: v })}
              disabled={!isSpeechRecognitionSupported()}
            />
          </div>
          {voices.length > 0 && (
            <div>
              <label className="text-xs text-iverson-cyan/80 block mb-1">TTS Voice</label>
              <select
                value={settings.selectedVoiceURI ?? ""}
                onChange={(e) => onChange({ selectedVoiceURI: e.target.value || null })}
                className="w-full bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan"
              >
                <option value="">Auto (best available)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-[11px] font-mono tracking-widest text-iverson-cyanDim mb-2">INSTALL AS APP</h3>
          <p className="text-[11px] text-iverson-cyanDim/80">
            On Android/Chrome use the browser menu → "Install app" / "Add to Home screen". On macOS Safari or
            Chrome use File/Share → "Add to Dock". Iverson runs standalone with its own window and works offline
            once installed.
          </p>
        </section>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full border transition relative disabled:opacity-30 ${
        checked ? "bg-iverson-cyan/30 border-iverson-cyan" : "bg-black/30 border-iverson-cyan/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-iverson-cyan transition-transform ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
