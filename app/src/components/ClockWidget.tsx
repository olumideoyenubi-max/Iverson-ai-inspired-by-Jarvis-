import { useEffect, useState } from "react";

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const seconds = now.getSeconds();
  const circumference = 2 * Math.PI * 44;
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const [clock, meridiem] = time.split(" ");

  return (
    <div className="panel-glass hud-frame p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 text-iverson-cyan">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(seconds / 60) * circumference} ${circumference}`}
            className="glow-stroke transition-[stroke-dasharray] duration-500"
          />
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="1 4" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-hud text-lg sm:text-xl font-bold text-glow leading-none">{clock}</span>
          <span className="font-mono text-[9px] text-iverson-cyanDim mt-1">
            {meridiem ?? ""} {String(seconds).padStart(2, "0")}s
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-2xl sm:text-3xl font-semibold italic text-iverson-accent leading-none truncate">
          {now.toLocaleDateString(undefined, { weekday: "long" })}
        </div>
        <div className="font-hud text-xs sm:text-sm tracking-widest text-iverson-cyan mt-1">
          {now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
