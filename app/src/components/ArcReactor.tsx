import type { IversonStatus } from "../store/useIverson";

const STATUS_RING_COLOR: Record<IversonStatus, string> = {
  idle: "border-iverson-cyan/50",
  listening: "border-iverson-green/70",
  thinking: "border-iverson-amber/70",
  speaking: "border-iverson-cyan/80",
  alert: "border-iverson-red/80",
};

const STATUS_GLOW: Record<IversonStatus, string> = {
  idle: "shadow-[0_0_40px_10px_rgba(79,243,255,0.15)]",
  listening: "shadow-[0_0_50px_14px_rgba(56,255,178,0.25)]",
  thinking: "shadow-[0_0_50px_14px_rgba(255,178,56,0.25)]",
  speaking: "shadow-[0_0_50px_14px_rgba(79,243,255,0.3)]",
  alert: "shadow-[0_0_60px_16px_rgba(255,59,59,0.35)]",
};

export default function ArcReactor({
  status,
  onMicClick,
  micActive,
  micSupported,
}: {
  status: IversonStatus;
  onMicClick: () => void;
  micActive: boolean;
  micSupported: boolean;
}) {
  const ringColor = STATUS_RING_COLOR[status];
  const glow = STATUS_GLOW[status];

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative h-64 w-64 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border ${ringColor} animate-spinSlow`} />
        <div className={`absolute inset-4 rounded-full border ${ringColor} animate-spinSlowReverse`} />
        <div className="absolute inset-8 rounded-full border border-dashed border-iverson-cyan/30" />

        {status === "listening" && (
          <span className="absolute inset-10 rounded-full border-2 border-iverson-green/60 animate-pulseRing" />
        )}
        {status === "alert" && (
          <span className="absolute inset-10 rounded-full border-2 border-iverson-red/60 animate-pulseRing" />
        )}

        <button
          onClick={onMicClick}
          disabled={!micSupported}
          className={`relative h-32 w-32 rounded-full bg-gradient-to-br from-[#04202a] to-[#010608] border-2 ${ringColor} ${glow} flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40`}
          aria-label={micActive ? "Stop listening" : "Start listening"}
        >
          <div className="absolute inset-3 rounded-full border border-iverson-cyan/20" />
          {micActive ? (
            <EqualizerIcon status={status} />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>
      <p className="mt-4 font-mono text-[11px] tracking-[0.3em] text-iverson-cyanDim">
        {micSupported ? "TAP CORE TO SPEAK" : "VOICE INPUT UNSUPPORTED — USE TEXT"}
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10 text-iverson-cyan text-glow">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0014 0" />
      <path d="M12 18v4M9 22h6" />
    </svg>
  );
}

function EqualizerIcon({ status }: { status: IversonStatus }) {
  const bars = [0, 1, 2, 3, 4];
  const color = status === "alert" ? "bg-iverson-red" : status === "thinking" ? "bg-iverson-amber" : "bg-iverson-green";
  return (
    <div className="flex items-end gap-1 h-10">
      {bars.map((b) => (
        <span
          key={b}
          className={`w-1.5 rounded-sm ${color} animate-pulse`}
          style={{
            height: `${12 + (b % 3) * 8}px`,
            animationDelay: `${b * 0.12}s`,
            animationDuration: "0.9s",
          }}
        />
      ))}
    </div>
  );
}
