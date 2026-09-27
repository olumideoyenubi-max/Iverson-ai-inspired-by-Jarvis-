import type { IversonStatus } from "../store/useIverson";

const STATUS_COPY: Record<IversonStatus, { label: string; color: string }> = {
  idle: { label: "STANDING BY", color: "text-iverson-cyan" },
  listening: { label: "LISTENING", color: "text-iverson-accent" },
  thinking: { label: "PROCESSING", color: "text-iverson-amber" },
  speaking: { label: "RESPONDING", color: "text-iverson-cyan" },
  alert: { label: "ALERT", color: "text-iverson-red" },
};

export default function TopBar({ status, onOpenSettings }: { status: IversonStatus; onOpenSettings: () => void }) {
  const copy = STATUS_COPY[status];

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 panel-glass hud-frame">
      <div className="flex items-center gap-3 min-w-0">
        <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0 text-iverson-cyan glow-stroke" aria-hidden>
          <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 6" className="animate-spinSlow" style={{ transformOrigin: "20px 20px" }} />
          <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="20" cy="20" r="5" fill="currentColor" className="animate-pulse" />
        </svg>
        <div className="min-w-0">
          <h1 className="font-hud text-lg sm:text-2xl font-bold tracking-[0.3em] text-iverson-cyan text-glow leading-none">IVERSON</h1>
          <p className="hidden sm:block label-hud mt-1 truncate">Personal AI agent · online</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <div className={`font-mono text-[10px] sm:text-xs tracking-widest ${copy.color} flex items-center gap-2 px-2.5 py-1 rounded-full border`} style={{ borderColor: "currentColor" }}>
          <span className="h-2 w-2 rounded-full bg-current animate-pulse shadow-[0_0_6px_currentColor]" />
          {copy.label}
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="h-9 w-9 rounded-full border border-iverson-cyan/40 text-iverson-cyan hover:bg-iverson-cyan/10 hover:shadow-[0_0_12px_rgb(var(--hud)/0.4)] transition flex items-center justify-center"
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
