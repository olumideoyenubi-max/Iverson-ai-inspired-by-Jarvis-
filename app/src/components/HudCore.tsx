import type { ReactNode } from "react";
import type { IversonStatus } from "../store/useIverson";

export type HudNode = {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
};

// The core's colour follows Iverson's state; everything inside uses currentColor.
const STATUS_COLOR: Record<IversonStatus, string> = {
  idle: "rgb(var(--hud))",
  listening: "rgb(var(--hud-accent))",
  thinking: "#ffb238",
  speaking: "rgb(var(--hud))",
  alert: "#ff3b3b",
};

const STATUS_CAPTION: Record<IversonStatus, string> = {
  idle: "TAP CORE TO SPEAK",
  listening: "LISTENING…",
  thinking: "PROCESSING…",
  speaking: "RESPONDING…",
  alert: "MOTION ALERT",
};

// Geometry is in a 600×600 viewBox with the core centred at (C, C).
const C = 300;
const NODE_RADIUS = 250;
const NODE_ANGLES = [-150, -90, -30, 30, 90, 150];

// Deterministic pseudo-random so the particle cloud is identical on every render.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(21);
const PARTICLES = Array.from({ length: 150 }, () => {
  const angle = rand() * Math.PI * 2;
  const radius = 62 + Math.pow(rand(), 0.7) * 52;
  return {
    x: C + Math.cos(angle) * radius,
    y: C + Math.sin(angle) * radius,
    r: 0.6 + rand() * 1.8,
    delay: rand() * 2.6,
  };
});

const TICKS = Array.from({ length: 120 }, (_, i) => {
  const a = (i / 120) * Math.PI * 2;
  const long = i % 10 === 0;
  const r1 = 152;
  const r2 = long ? 166 : 159;
  return {
    x1: C + Math.cos(a) * r1,
    y1: C + Math.sin(a) * r1,
    x2: C + Math.cos(a) * r2,
    y2: C + Math.sin(a) * r2,
    long,
  };
});

const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r };
};

export default function HudCore({
  status,
  onMicClick,
  micActive,
  micSupported,
  nodes,
}: {
  status: IversonStatus;
  onMicClick: () => void;
  micActive: boolean;
  micSupported: boolean;
  nodes: HudNode[];
}) {
  const color = STATUS_COLOR[status];
  const energised = status !== "idle";
  const spin = (idle: string, busy: string) => (energised ? busy : idle);
  const origin = { transformOrigin: `${C}px ${C}px` };

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="relative w-full max-w-[min(600px,62vh)] lg:max-w-[min(640px,70vh)] aspect-square" style={{ color }}>
        <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <radialGradient id="core-glow">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.08" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connectors from the core out to each module node */}
          {nodes.map((node, i) => {
            const angle = NODE_ANGLES[i % NODE_ANGLES.length];
            const start = polar(angle, 172);
            const end = polar(angle, NODE_RADIUS - 30);
            const ctrl = polar(angle + 14, (172 + NODE_RADIUS) / 2);
            return (
              <g key={node.id} style={{ color: node.active ? "rgb(var(--hud-accent))" : undefined }}>
                <path
                  d={`M${start.x},${start.y} Q${ctrl.x},${ctrl.y} ${end.x},${end.y}`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={node.active ? 0.9 : 0.35}
                  strokeWidth={node.active ? 1.6 : 1}
                  strokeDasharray={node.active ? "6 6" : undefined}
                  className={node.active ? "dash-flow" : undefined}
                />
                <circle cx={start.x} cy={start.y} r={2.5} fill="currentColor" />
              </g>
            );
          })}

          <circle cx={C} cy={C} r={190} fill="url(#core-glow)" className="animate-breathe" style={origin} />

          {/* Outer tick ring */}
          <g className={spin("animate-spinSlowReverse", "animate-spinSlow")} style={origin} opacity={0.75}>
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="currentColor"
                strokeWidth={t.long ? 2 : 1}
                strokeOpacity={t.long ? 1 : 0.55}
              />
            ))}
          </g>

          {/* Segmented arc ring */}
          <circle
            cx={C}
            cy={C}
            r={140}
            fill="none"
            stroke="currentColor"
            strokeWidth={7}
            strokeOpacity={0.55}
            strokeDasharray="110 18 34 18 160 26 60 18 90 22 40 30 70 184"
            className={`glow-stroke ${spin("animate-spinSlow", "animate-spinMed")}`}
            style={origin}
          />

          <circle cx={C} cy={C} r={127} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeDasharray="2 6" />

          {/* Thin fast arc that sweeps while Iverson is busy */}
          <circle
            cx={C}
            cy={C}
            r={118}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeOpacity={energised ? 0.95 : 0.45}
            strokeDasharray="180 562"
            strokeLinecap="round"
            className={`glow-stroke ${spin("animate-spinSlowReverse", "animate-spinFastReverse")}`}
            style={origin}
          />

          {/* Particle cloud */}
          <g className={energised ? "animate-breathe" : undefined} style={origin}>
            {PARTICLES.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill="currentColor"
                className="twinkle"
                style={{ animationDelay: `${p.delay}s`, animationDuration: energised ? "1.1s" : undefined }}
              />
            ))}
          </g>

          <circle cx={C} cy={C} r={58} fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={1.5} className="glow-stroke" />

          <text
            x={C}
            y={C + 92}
            textAnchor="middle"
            fill="currentColor"
            className="font-hud"
            fontSize={15}
            letterSpacing={6}
            fontWeight={700}
            stroke="rgb(var(--bg))"
            strokeWidth={5}
            paintOrder="stroke"
          >
            IVERSON
          </text>
        </svg>

        {/* Centre button */}
        <button
          onClick={onMicClick}
          disabled={!micSupported}
          aria-label={micActive ? "Stop listening" : "Start listening"}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[17%] w-[17%] rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgb(var(--hud) / 0.22), rgb(var(--bg)) 70%)",
            boxShadow: "0 0 30px currentColor, inset 0 0 18px currentColor",
          }}
        >
          {micActive ? <Equalizer /> : <MicIcon />}
        </button>

        {/* Module nodes */}
        {nodes.map((node, i) => {
          const { x, y } = polar(NODE_ANGLES[i % NODE_ANGLES.length], NODE_RADIUS);
          return (
            <button
              key={node.id}
              onClick={node.onClick}
              disabled={node.disabled}
              aria-pressed={node.active}
              className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 disabled:opacity-35"
              style={{ left: `${(x / 600) * 100}%`, top: `${(y / 600) * 100}%` }}
            >
              <span
                className={`relative flex items-center justify-center h-11 w-11 sm:h-14 sm:w-14 rounded-full border transition ${
                  node.active
                    ? "border-iverson-accent text-iverson-accent bg-iverson-accent/15 shadow-[0_0_18px_rgb(var(--hud-accent)/0.55)]"
                    : "border-iverson-cyan/40 text-iverson-cyan bg-[rgb(var(--bg)/0.8)] group-hover:border-iverson-cyan group-hover:shadow-[0_0_14px_rgb(var(--hud)/0.45)]"
                }`}
              >
                <span className="h-5 w-5 sm:h-6 sm:w-6">{node.icon}</span>
                {node.active && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-iverson-accent shadow-[0_0_8px_rgb(var(--hud-accent))]" />
                )}
              </span>
              <span
                className={`font-hud text-[9px] sm:text-[10px] tracking-[0.2em] whitespace-nowrap ${
                  node.active ? "text-iverson-accent" : "text-iverson-cyan/80"
                }`}
              >
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-1 label-hud" style={{ color: energised ? color : undefined }}>
        {micSupported ? STATUS_CAPTION[status] : "VOICE INPUT UNSUPPORTED — USE TEXT"}
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[40%] w-[40%] text-glow">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0014 0" />
      <path d="M12 18v4M9 22h6" />
    </svg>
  );
}

function Equalizer() {
  return (
    <div className="flex items-end gap-[3px] h-[40%]">
      {[0, 1, 2, 3, 4].map((b) => (
        <span
          key={b}
          className="w-1 rounded-sm bg-current spectrum-bar"
          style={{ height: "100%", animationDelay: `${b * 0.13}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}
