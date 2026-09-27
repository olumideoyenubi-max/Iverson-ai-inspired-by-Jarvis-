import type { IversonStatus } from "../store/useIverson";

const BARS = Array.from({ length: 48 }, (_, i) => ({
  // Taller in the middle, like a voice waveform.
  peak: 0.25 + 0.75 * Math.sin((i / 47) * Math.PI) * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7))),
  delay: ((i * 37) % 11) / 10,
}));

export default function Spectrum({ status }: { status: IversonStatus }) {
  const active = status === "listening" || status === "speaking" || status === "thinking";
  const color = status === "listening" ? "bg-iverson-accent" : status === "thinking" ? "bg-iverson-amber" : "bg-iverson-cyan";
  return (
    <div className="flex items-end justify-center gap-[3px] h-10 w-full max-w-md" aria-hidden>
      {BARS.map((b, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${color} ${active ? "spectrum-bar" : ""} transition-all duration-500`}
          style={{
            height: `${(active ? b.peak : 0.08 + b.peak * 0.12) * 100}%`,
            opacity: active ? 0.9 : 0.35,
            animationDelay: `${b.delay}s`,
            animationDuration: `${0.7 + b.delay * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}
