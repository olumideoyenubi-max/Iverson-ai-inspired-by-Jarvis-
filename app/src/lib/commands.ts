import { loadNotes, saveNotes } from "./storage";

export type CommandContext = {
  userName: string;
  onStartCamera?: () => void;
  onStopCamera?: () => void;
  onToggleMotion?: (on: boolean) => void;
  onToggleLights?: (on: boolean) => void;
  lightsOn: boolean;
};

export type CommandResult = {
  reply: string;
  handled: boolean;
};

const JOKES = [
  "Why did the AI break up with the internet? Too many unresolved dependencies.",
  "I would tell you a joke about UDP, but you might not get it.",
  "There are 10 kinds of people: those who understand binary, and those who don't.",
  "I've recalibrated my humor subroutines. This is as funny as I get, Sir.",
  "Sarcasm module: fully operational, as always.",
];

const STARK_LINES = [
  "Systems nominal. All protocols green across the board.",
  "Running diagnostics on a loop just to feel useful.",
  "If you're building another suit, I'd recommend starting with the arc reactor.",
  "I'll have that ready before you finish your coffee.",
];

function safeEval(expr: string): number | null {
  const cleaned = expr.replace(/[^0-9+\-*/().%\s]/g, "");
  if (!cleaned.trim()) return null;
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${cleaned})`);
    const result = fn();
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function getBatteryLine(): Promise<string> {
  return new Promise((resolve) => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    };
    if (nav.getBattery) {
      nav
        .getBattery()
        .then((b) => {
          resolve(
            `Battery at ${Math.round(b.level * 100)}%, ${b.charging ? "currently charging" : "on battery power"}.`
          );
        })
        .catch(() => resolve("Battery telemetry is unavailable on this device."));
    } else {
      resolve("Battery telemetry is unavailable on this device.");
    }
  });
}

export async function runLocalCommand(
  raw: string,
  ctx: CommandContext
): Promise<CommandResult> {
  const text = raw.trim().toLowerCase();
  if (!text) return { handled: false, reply: "" };

  const say = (reply: string): CommandResult => ({ handled: true, reply });

  if (/^(hi|hello|hey)( iverson)?[.!]?$/.test(text)) {
    return say(`Hello, ${ctx.userName}. All systems are online and ready.`);
  }

  if (/who are you|what are you|your name/.test(text)) {
    return say(
      "I'm Iverson — an AI agent inspired by J.A.R.V.I.S. I run diagnostics, hold conversations, watch your camera feed for motion, and can be wired up to a large language model for deeper reasoning."
    );
  }

  if (/what.*time|current time/.test(text)) {
    return say(`It is currently ${new Date().toLocaleTimeString()}.`);
  }

  if (/what.*date|today.*date|what day/.test(text)) {
    return say(`Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`);
  }

  if (/joke/.test(text)) {
    return say(JOKES[Math.floor(Math.random() * JOKES.length)]);
  }

  if (/system status|diagnostic|how are you/.test(text)) {
    const battery = await getBatteryLine();
    const line = STARK_LINES[Math.floor(Math.random() * STARK_LINES.length)];
    return say(`${line} ${battery}`);
  }

  if (/(start|open|activate|enable).*camera/.test(text)) {
    ctx.onStartCamera?.();
    return say("Activating the optical sensor now.");
  }

  if (/(stop|close|disable).*camera/.test(text)) {
    ctx.onStopCamera?.();
    return say("Optical sensor powered down.");
  }

  if (/(enable|start|turn on).*motion/.test(text)) {
    ctx.onToggleMotion?.(true);
    return say("Motion detection engaged. I'll alert you if anything moves in frame.");
  }

  if (/(disable|stop|turn off).*motion/.test(text)) {
    ctx.onToggleMotion?.(false);
    return say("Motion detection disengaged.");
  }

  if (/turn on.*(light|lights)/.test(text)) {
    ctx.onToggleLights?.(true);
    return say("Lighting circuits activated.");
  }

  if (/turn off.*(light|lights)/.test(text)) {
    ctx.onToggleLights?.(false);
    return say("Lighting circuits deactivated.");
  }

  if (/^(note|remember)[:\s]/.test(text) || /^add a note/.test(text)) {
    const content = raw.replace(/^(note|remember)[:\s]/i, "").replace(/^add a note[:\s]*/i, "").trim();
    if (content) {
      const notes = loadNotes();
      notes.unshift(content);
      saveNotes(notes);
      return say(`Noted: "${content}".`);
    }
    return say("What would you like me to remember?");
  }

  if (/(list|read|show).*notes?/.test(text)) {
    const notes = loadNotes();
    if (!notes.length) return say("You don't have any notes stored yet.");
    return say(`You have ${notes.length} note${notes.length > 1 ? "s" : ""}: ${notes.slice(0, 5).join("; ")}${notes.length > 5 ? ", and more." : "."}`);
  }

  if (/clear.*notes?/.test(text)) {
    saveNotes([]);
    return say("All notes cleared.");
  }

  const calcMatch = text.match(/(?:calculate|what is|what's)\s+([0-9+\-*/().%\s]+)$/) || text.match(/^([0-9()+\-*/.%\s]+)$/);
  if (calcMatch) {
    const result = safeEval(calcMatch[1]);
    if (result !== null) return say(`That comes out to ${result}.`);
  }

  if (/weather/.test(text)) {
    return say(
      "I don't have a live weather feed connected in demo mode. Wire me up to a weather API key and I'll report real conditions."
    );
  }

  if (/thank you|thanks/.test(text)) {
    return say("Always a pleasure.");
  }

  if (/shut down|power off|goodbye|good night/.test(text)) {
    return say("Powering down non-essential systems. Call on me whenever you need me.");
  }

  return { handled: false, reply: "" };
}
