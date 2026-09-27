import { useCallback, useEffect, useState } from "react";
import BootSequence from "./components/BootSequence";
import TopBar from "./components/TopBar";
import ArcReactor from "./components/ArcReactor";
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

  return (
    <div className="h-screen w-screen bg-iverson-bg grid-overlay text-iverson-cyan overflow-hidden flex flex-col">
      <div className="p-3">
        <TopBar status={status} onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      <div className="flex-1 min-h-0 px-3 pb-3 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-3">
        <div className="hidden lg:flex flex-col gap-3 min-h-0">
          <CameraPanel
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            motionEnabled={motionEnabled}
            setMotionEnabled={setMotionEnabled}
            onMotionDetected={handleMotionDetected}
            alerts={motionAlerts}
          />
          <SystemStats lightsOn={lightsOn} wakeWordArmed={wakeWordArmed} />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 min-h-0">
          <ArcReactor
            status={status}
            onMicClick={handleMicClick}
            micActive={voice.manualListening}
            micSupported={voice.supported}
          />
          <div className="lg:hidden w-full max-w-sm">
            <CameraPanel
              cameraOn={cameraOn}
              setCameraOn={setCameraOn}
              motionEnabled={motionEnabled}
              setMotionEnabled={setMotionEnabled}
              onMotionDetected={handleMotionDetected}
              alerts={motionAlerts}
            />
          </div>
        </div>

        <div className="min-h-0">
          <ChatPanel messages={messages} onSend={handleUserUtterance} thinking={status === "thinking"} />
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
      />
    </div>
  );
}
