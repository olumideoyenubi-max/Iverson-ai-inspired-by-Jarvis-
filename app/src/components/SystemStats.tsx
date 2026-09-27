import { useEffect, useState } from "react";

type Stat = { label: string; value: number };

export default function SystemStats({ lightsOn, wakeWordArmed }: { lightsOn: boolean; wakeWordArmed: boolean }) {
  const [stats, setStats] = useState<Stat[]>([
    { label: "CORE", value: 32 },
    { label: "NEURAL", value: 58 },
    { label: "NET", value: 74 },
    { label: "MEM", value: 41 },
  ]);

  useEffect(() => {
    const t = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          const delta = Math.round((Math.random() - 0.5) * 14);
          const value = Math.min(97, Math.max(8, s.value + delta));
          return { ...s, value };
        })
      );
    }, 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="panel-glass hud-frame p-3 sm:p-4">
      <h2 className="label-hud mb-3">System diagnostics</h2>
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <Gauge key={s.label} {...s} />
        ))}
      </div>
      <div className="mt-3 space-y-1">
        <StatusRow label="Smart lighting" on={lightsOn} onText="ONLINE" offText="STANDBY" />
        <StatusRow label={'Wake word "Iverson"'} on={wakeWordArmed} onText="ARMED" offText="DISARMED" />
      </div>
    </div>
  );
}

function Gauge({ label, value }: Stat) {
  const c = 2 * Math.PI * 22;
  // A 270° gauge: the track leaves a gap at the bottom.
  const track = c * 0.75;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-14 w-14 text-iverson-cyan">
        <svg viewBox="0 0 56 56" className="absolute inset-0 rotate-[135deg]">
          <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" strokeDasharray={`${track} ${c}`} strokeLinecap="round" />
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * track} ${c}`}
            className="glow-stroke transition-[stroke-dasharray] duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-hud text-xs font-bold">{value}</span>
      </div>
      <span className="font-mono text-[9px] tracking-widest text-iverson-cyanDim mt-0.5">{label}</span>
    </div>
  );
}

function StatusRow({ label, on, onText, offText }: { label: string; on: boolean; onText: string; offText: string }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-mono">
      <span className="text-iverson-cyanDim tracking-widest uppercase">{label}</span>
      <span className={`flex items-center gap-1.5 ${on ? "text-iverson-accent" : "text-iverson-cyanDim"}`}>
        <span className={`h-1.5 w-1.5 rounded-full bg-current ${on ? "shadow-[0_0_6px_currentColor]" : ""}`} />
        {on ? onText : offText}
      </span>
    </div>
  );
}
