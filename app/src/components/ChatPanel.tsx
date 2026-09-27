import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "../store/useIverson";

export default function ChatPanel({
  messages,
  onSend,
  thinking,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  thinking: boolean;
}) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full panel-glass clip-corner p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-hud text-xs tracking-[0.25em] text-iverson-cyan/80">COMMS LOG</h2>
        <span className="text-[10px] font-mono text-iverson-cyanDim">{messages.length} ENTRIES</span>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-md px-3 py-2 text-sm font-medium leading-snug ${
                m.role === "user"
                  ? "bg-iverson-amber/10 border border-iverson-amber/40 text-iverson-amber"
                  : "bg-iverson-cyan/5 border border-iverson-cyan/30 text-iverson-cyan"
              }`}
            >
              <div className="text-[9px] font-mono tracking-widest opacity-60 mb-1">
                {m.role === "user" ? "YOU" : "IVERSON"} · {new Date(m.ts).toLocaleTimeString()}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-md px-3 py-2 bg-iverson-cyan/5 border border-iverson-cyan/30 flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-iverson-cyan dot-anim" style={{ animationDelay: "0s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-iverson-cyan dot-anim" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-iverson-cyan dot-anim" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a command or question…"
          className="flex-1 bg-black/40 border border-iverson-cyan/30 rounded px-3 py-2 text-sm text-iverson-cyan placeholder:text-iverson-cyanDim/60 focus:outline-none focus:border-iverson-cyan"
        />
        <button
          type="submit"
          className="px-4 rounded border border-iverson-cyan/50 text-iverson-cyan text-xs font-mono tracking-widest hover:bg-iverson-cyan/10 transition"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
