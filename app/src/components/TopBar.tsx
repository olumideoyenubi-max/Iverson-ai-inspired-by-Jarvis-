import { useEffect, useState } from "react";
import type { IversonStatus } from "../store/useIverson";

const STATUS_COPY: Record<IversonStatus, { label: string; color: string }> = {
  idle: { label: "STANDING BY", color: "text-iverson-cyan" },
  listening: { label: "LISTENING", color: "text-iverson-green" },
  thinking: { label: "PROCESSING", color: "text-iverson-amber" },
  speaking: { label: "RESPONDING", color: "text-iverson-cyan" },
  alert: { label: "ALERT", color: "text-iverson-red" },
};

export default function TopBar({
  status,
  onOpenSettings,
}: {
  status: IversonStatus;
  onOpenSettings: () => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const copy = STATUS_COPY[status];

  return (
    <div className="flex items-center justify-between px-6 py-3 panel-glass clip-corner">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-iverson-cyan shadow-[0_0_8px_3px_rgba(79,243,255,0.7)] animate-pulse" />
        <h1 className="font-hud text-2xl tracking-[0.3em] text-iverson-cyan text-glow">IVERSON</h1>
        <span className="hidden sm:inline text-xs font-mono text-iverson-cyanDim tracking-widest ml-2">
          J.A.R.V.I.S.-CLASS PERSONAL AGENT
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className={`font-mono text-xs tracking-widest ${copy.color}`}>
          <span className="inline-block h-2 w-2 rounded-full bg-current mr-2 align-middle animate-pulse" />
          {copy.label}
        </div>
        <div className="font-mono text-sm text-iverson-cyan/80 text-right">
          <div>{now.toLocaleTimeString()}</div>
          <div className="text-[10px] text-iverson-cyanDim">
            {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="h-9 w-9 rounded-full border border-iverson-cyan/40 text-iverson-cyan hover:bg-iverson-cyan/10 transition flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
            <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
            <path d="M19.4 13.5a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19.4a2 2 0 11-4 0v-.08a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H4.6a2 2 0 110-4h.08a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H10.6a1.65 1.65 0 001-1.51V4.6a2 2 0 114 0v.08a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H19.4a2 2 0 110 4h-.08a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
