import { useEffect, useState } from "react";

const LINES = [
  "INITIALIZING IVERSON CORE...",
  "LOADING NEURAL SUBROUTINES...",
  "CALIBRATING VOICE MATRIX...",
  "LINKING OPTICAL SENSORS...",
  "ESTABLISHING SECURE HANDSHAKE...",
  "ALL SYSTEMS NOMINAL.",
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setVisibleLines((v) => Math.min(v + 1, LINES.length));
    }, 320);
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 100));
    }, 60);
    const done = setTimeout(onDone, 2300);
    return () => {
      clearInterval(lineTimer);
      clearInterval(progressTimer);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-iverson-bg grid-overlay">
      <div className="relative">
        <div className="absolute -inset-10 rounded-full border border-iverson-cyan/20 animate-spinSlow" />
        <div className="absolute -inset-16 rounded-full border border-iverson-cyan/10 animate-spinSlowReverse" />
        <div className="h-28 w-28 rounded-full border-2 border-iverson-cyan flex items-center justify-center text-glow animate-flicker">
          <span className="font-hud text-xl tracking-widest text-iverson-cyan">IV</span>
        </div>
      </div>
      <div className="mt-10 font-mono text-iverson-cyan text-sm space-y-1 h-32 w-80 text-center">
        {LINES.slice(0, visibleLines).map((l, i) => (
          <div key={i} className="text-glow opacity-90">
            {l}
          </div>
        ))}
      </div>
      <div className="mt-4 w-72 h-1 bg-iverson-cyan/10 rounded overflow-hidden">
        <div
          className="h-full bg-iverson-cyan transition-all duration-100 shadow-[0_0_8px_2px_rgba(79,243,255,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
