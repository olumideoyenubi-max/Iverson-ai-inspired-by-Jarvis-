import { useEffect, useState } from "react";

type Stat = { label: string; value: number };

export default function SystemStats({ lightsOn, wakeWordArmed }: { lightsOn: boolean; wakeWordArmed: boolean }) {
  const [stats, setStats] = useState<Stat[]>([
    { label: "CORE LOAD", value: 32 },
    { label: "NEURAL NET", value: 58 },
    { label: "NETWORK", value: 74 },
    { label: "MEMORY", value: 41 },
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
    <div className="panel-glass clip-corner p-4">
      <h2 className="font-hud text-xs tracking-[0.25em] text-iverson-cyan/80 mb-3">SYSTEM DIAGNOSTICS</h2>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-[10px] font-mono text-iverson-cyanDim mb-1">
              <span>{s.label}</span>
              <span>{s.value}%</span>
            </div>
            <div className="h-1.5 bg-iverson-cyan/10 rounded overflow-hidden">
              <div
                className="h-full bg-iverson-cyan transition-all duration-700"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
        <span className="text-iverson-cyanDim tracking-widest">SMART LIGHTING</span>
        <span className={lightsOn ? "text-iverson-green" : "text-iverson-cyanDim"}>{lightsOn ? "ONLINE" : "STANDBY"}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
        <span className="text-iverson-cyanDim tracking-widest">WAKE WORD "IVERSON"</span>
        <span className={wakeWordArmed ? "text-iverson-green" : "text-iverson-cyanDim"}>{wakeWordArmed ? "ARMED" : "DISARMED"}</span>
      </div>
    </div>
  );
}
