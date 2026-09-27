import { forwardRef, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "../store/useIverson";

const ChatPanel = forwardRef<HTMLInputElement, {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  thinking: boolean;
}>(function ChatPanel({ messages, onSend, thinking }, inputRef) {
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
    <div className="flex flex-col h-full panel-glass hud-frame p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-iverson-cyan/15">
        <h2 className="label-hud">Comms log</h2>
        <span className="font-mono text-[10px] text-iverson-cyanDim">{messages.length} ENTRIES</span>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-br-sm px-3 py-2 bg-iverson-amber/10 border border-iverson-amber/35 text-iverson-amber">
                <div className="font-mono text-[9px] tracking-widest opacity-60 mb-0.5 text-right">
                  YOU · {new Date(m.ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </div>
                <p className="text-[15px] font-medium leading-snug">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2 items-start">
              <span className="mt-1 h-6 w-6 shrink-0 rounded-full border border-iverson-cyan/60 flex items-center justify-center shadow-[0_0_10px_rgb(var(--hud)/0.4)]">
                <span className="h-2 w-2 rounded-full bg-iverson-cyan" />
              </span>
              <div className="max-w-[85%] rounded-lg rounded-tl-sm px-3 py-2 bg-iverson-cyan/[0.06] border border-iverson-cyan/25 text-iverson-cyan">
                <div className="font-mono text-[9px] tracking-widest opacity-60 mb-0.5">
                  IVERSON · {new Date(m.ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </div>
                <p className="text-[15px] font-medium leading-snug whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          )
        )}
        {thinking && (
          <div className="flex gap-2 items-center">
            <span className="h-6 w-6 shrink-0 rounded-full border border-iverson-amber/60 animate-spin border-t-transparent" />
            <div className="rounded-lg px-3 py-2 bg-iverson-cyan/[0.06] border border-iverson-cyan/25 flex gap-1 items-center">
              {[0, 0.15, 0.3].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-iverson-cyan dot-anim" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Iverson anything…"
          className="flex-1 min-w-0 bg-black/40 border border-iverson-cyan/30 rounded-full px-4 py-2.5 text-[16px] text-iverson-cyan placeholder:text-iverson-cyanDim/70 focus:outline-none focus:border-iverson-cyan focus:shadow-[0_0_12px_rgb(var(--hud)/0.35)] transition"
        />
        <button
          type="submit"
          aria-label="Send"
          className="h-11 w-11 shrink-0 rounded-full border border-iverson-cyan/60 text-iverson-cyan hover:bg-iverson-cyan/15 hover:shadow-[0_0_14px_rgb(var(--hud)/0.5)] transition flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
});

export default ChatPanel;
