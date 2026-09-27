import { useEffect, useRef, useState } from "react";
import { requestCameraStream, startMotionWatcher } from "../lib/motion";
import type { MotionWatcher } from "../lib/motion";

export default function CameraPanel({
  cameraOn,
  setCameraOn,
  motionEnabled,
  setMotionEnabled,
  onMotionDetected,
  alerts,
}: {
  cameraOn: boolean;
  setCameraOn: (v: boolean) => void;
  motionEnabled: boolean;
  setMotionEnabled: (v: boolean) => void;
  onMotionDetected: () => void;
  alerts: string[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watcherRef = useRef<MotionWatcher | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setError(null);
      try {
        const stream = await requestCameraStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setError("Camera access denied or unavailable.");
        setCameraOn(false);
      }
    }
    if (cameraOn) {
      start();
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      watcherRef.current?.stop();
      watcherRef.current = null;
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);

  useEffect(() => {
    if (cameraOn && motionEnabled && videoRef.current) {
      watcherRef.current = startMotionWatcher({
        video: videoRef.current,
        sensitivity: 30,
        onFrame: (score) => setLevel(score),
        onMotion: () => {
          onMotionDetected();
          setFlash(true);
          setTimeout(() => setFlash(false), 700);
        },
      });
    } else {
      watcherRef.current?.stop();
      watcherRef.current = null;
    }
    return () => {
      watcherRef.current?.stop();
      watcherRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, motionEnabled]);

  return (
    <div className={`flex flex-col panel-glass hud-frame p-3 sm:p-4 transition ${flash ? "ring-2 ring-iverson-red" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="label-hud">Optical sensor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCameraOn(!cameraOn)}
            className={`text-[10px] font-mono px-2 py-1 rounded border ${
              cameraOn ? "border-iverson-green/60 text-iverson-green" : "border-iverson-cyan/40 text-iverson-cyan"
            }`}
          >
            {cameraOn ? "CAMERA ON" : "CAMERA OFF"}
          </button>
          <button
            onClick={() => setMotionEnabled(!motionEnabled)}
            disabled={!cameraOn}
            className={`text-[10px] font-mono px-2 py-1 rounded border disabled:opacity-30 ${
              motionEnabled ? "border-iverson-amber/60 text-iverson-amber" : "border-iverson-cyan/40 text-iverson-cyan"
            }`}
          >
            MOTION {motionEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className={`relative ${cameraOn ? "aspect-video" : "h-20"} bg-black/60 rounded overflow-hidden border border-iverson-cyan/20`}>
        {cameraOn ? (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-iverson-cyanDim text-xs font-mono">
            SENSOR OFFLINE
          </div>
        )}
        {cameraOn && (
          <>
            <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-iverson-cyan/10 to-transparent animate-scan pointer-events-none" />
            <div className="absolute bottom-1 left-1 text-[9px] font-mono text-iverson-green/80">● REC</div>
          </>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-iverson-red text-xs font-mono px-4 text-center">
            {error}
          </div>
        )}
      </div>

      {motionEnabled && cameraOn && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-iverson-cyan/10 rounded overflow-hidden">
            <div
              className="h-full bg-iverson-amber transition-all duration-150"
              style={{ width: `${Math.min(100, level * 3)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex-1 min-h-[60px] max-h-28 overflow-y-auto">
        <h3 className="label-hud mb-1">Motion log</h3>
        {alerts.length === 0 ? (
          <p className="text-[10px] font-mono text-iverson-cyanDim/60">No motion events recorded.</p>
        ) : (
          <ul className="space-y-1">
            {alerts.slice(0, 6).map((a, i) => (
              <li key={i} className="text-[10px] font-mono text-iverson-red/90">
                ⚠ {a}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
