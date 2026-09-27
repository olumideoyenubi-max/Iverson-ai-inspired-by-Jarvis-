import { useCallback, useEffect, useRef, useState } from "react";
import BootSequence from "./components/BootSequence";
import TopBar from "./components/TopBar";
import HudCore from "./components/HudCore";
import { NodeIcons } from "./components/nodeIcons";
import type { HudNode } from "./components/HudCore";
import ClockWidget from "./components/ClockWidget";
import WeatherWidget from "./components/WeatherWidget";
import Spectrum from "./components/Spectrum";
import ChatPanel from "./components/ChatPanel";
import CameraPanel from "./components/CameraPanel";
import SystemStats from "./components/SystemStats";
import SettingsModal from "./components/SettingsModal";
import { useIverson } from "./store/useIverson";
import { think } from "./lib/brain";
import { speak, stopSpeaking } from "./lib/speech";
import { useVoicePipeline } from "./hooks/useVoicePipeline";
import { appendEventLog } from "./lib/storage";

export default function App() {
  const [booted, setBooted] = useState(false);

  const {
    messages,
    addMessage,
    settings,
    updateSettings,
    status,
    setStatus,
    cameraOn,
    setCameraOn,
    motionEnabled,
    setMotionEnabled,
    motionAlerts,
    pushMotionAlert,
    lightsOn,
    setLightsOn,
    wakeWordArmed,
    setWakeWordArmed,
    settingsOpen,
    setSettingsOpen,
  } = useIverson();

  const busy = status === "thinking" || status === "speaking";
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.hudTheme;
  }, [settings.hudTheme]);

  const handleUserUtterance = useCallback(
    async (text: string) => {
      addMessage("user", text);
      setStatus("thinking");
      const history = useIverson.getState().messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      const reply = await think(text, history, useIverson.getState().settings, {
        userName: useIverson.getState().settings.userName,
        lightsOn: useIverson.getState().lightsOn,
        onStartCamera: () => setCameraOn(true),
        onStopCamera: () => setCameraOn(false),
        onToggleMotion: (on) => setMotionEnabled(on),
        onToggleLights: (on) => setLightsOn(on),
      });
      addMessage("assistant", reply);
      appendEventLog(`User: "${text}" → Iverson: "${reply}"`);
      if (useIverson.getState().settings.voiceOutputEnabled) {
        setStatus("speaking");
        speak(reply, {
          voiceURI: useIverson.getState().settings.selectedVoiceURI,
          onEnd: () => setStatus("idle"),
        });
      } else {
        setStatus("idle");
      }
    },
    [addMessage, setStatus, setCameraOn, setMotionEnabled, setLightsOn]
  );

  const voice = useVoicePipeline({
    wakeWordEnabled: settings.wakeWordEnabled,
    paused: busy,
    onWakeTriggered: () => {
      setStatus("listening");
      appendEventLog("Wake word detected.");
    },
    onCommand: (text) => {
      stopSpeaking();
      handleUserUtterance(text);
    },
  });

  useEffect(() => {
    setWakeWordArmed(settings.wakeWordEnabled && voice.supported);
  }, [settings.wakeWordEnabled, voice.supported, setWakeWordArmed]);

  useEffect(() => {
    if (voice.manualListening) setStatus("listening");
    else if (status === "listening") setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.manualListening]);

  const handleMicClick = () => {
    if (voice.manualListening) {
      voice.stopAll();
      setStatus("idle");
    } else {
      stopSpeaking();
      voice.startCommandListening();
    }
  };

  const handleMotionDetected = () => {
    const label = `Motion detected at ${new Date().toLocaleTimeString()}`;
    pushMotionAlert(label);
    appendEventLog(label);
    setStatus("alert");
    if (settings.voiceOutputEnabled) {
      speak("Motion detected in frame.", { onEnd: () => setStatus("idle") });
    } else {
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  if (!booted) {
    return <BootSequence onDone={() => setBooted(true)} />;
  }

  const nodes: HudNode[] = [
    { id: "vision", label: "VISION", icon: NodeIcons.vision, active: cameraOn, onClick: () => setCameraOn(!cameraOn) },
    {
      id: "comms",
      label: "COMMS",
      icon: NodeIcons.comms,
      active: false,
      onClick: () => {
        chatInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        chatInputRef.current?.focus({ preventScroll: true });
      },
    },
    {
      id: "voice",
      label: "VOICE",
      icon: NodeIcons.voice,
      active: wakeWordArmed,
      disabled: !voice.supported,
      onClick: () => updateSettings({ wakeWordEnabled: !settings.wakeWordEnabled }),
    },
    { id: "config", label: "CONFIG", icon: NodeIcons.config, active: settingsOpen, onClick: () => setSettingsOpen(true) },
    { id: "lights", label: "LIGHTS", icon: NodeIcons.lights, active: lightsOn, onClick: () => setLightsOn(!lightsOn) },
    {
      id: "motion",
      label: "MOTION",
      icon: NodeIcons.motion,
      active: motionEnabled,
      disabled: !cameraOn,
      onClick: () => setMotionEnabled(!motionEnabled),
    },
  ];

  return (
    <div className="relative min-h-screen lg:h-screen text-iverson-cyan flex flex-col lg:overflow-hidden bg-[rgb(var(--bg))]">
      <div className="pointer-events-none fixed inset-0 grid-overlay" />
      <div className="pointer-events-none fixed inset-0 hud-backdrop" />

      <header className="relative safe-top px-3">
        <TopBar status={status} onOpenSettings={() => setSettingsOpen(true)} />
      </header>

      <main className="relative flex-1 min-h-0 px-3 pt-3 safe-bottom grid grid-cols-1 lg:grid-cols-[330px_1fr_370px] gap-3">
        <section className="order-1 lg:order-2 flex flex-col items-center justify-center gap-2 min-h-0">
          <HudCore
            status={status}
            onMicClick={handleMicClick}
            micActive={voice.manualListening}
            micSupported={voice.supported}
            nodes={nodes}
          />
          <Spectrum status={status} />
        </section>

        <aside className="order-2 lg:order-1 flex flex-col gap-3 min-h-0 lg:overflow-y-auto lg:pr-1">
          <ClockWidget />
          <WeatherWidget />
          <SystemStats lightsOn={lightsOn} wakeWordArmed={wakeWordArmed} />
          <CameraPanel
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            motionEnabled={motionEnabled}
            setMotionEnabled={setMotionEnabled}
            onMotionDetected={handleMotionDetected}
            alerts={motionAlerts}
          />
        </aside>

        <section className="order-3 h-[75vh] lg:h-auto min-h-0">
          <ChatPanel ref={chatInputRef} messages={messages} onSend={handleUserUtterance} thinking={status === "thinking"} />
        </section>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
      />
    </div>
  );
}
