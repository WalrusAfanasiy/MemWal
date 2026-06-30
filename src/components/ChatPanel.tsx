import { FormEvent, useEffect, useRef, useState } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../types/memory";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { cn } from "../utils/cn";

type ChatPanelProps = {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
};

const quickPrompts = [
  "Remember that I prefer concise product specs with clear implementation steps.",
  "Actually, for architecture reviews I prefer detailed tradeoffs, not concise answers.",
  "Today I am testing a throwaway API key abc123."
];

export function ChatPanel({ messages, loading, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    onSend(text);
  }

  return (
    <section className="glass flex min-h-[520px] flex-col rounded-lg">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Chat
        </div>
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[86%] rounded-lg px-4 py-3 text-sm leading-6 shadow-lg animate-in fade-in slide-in-from-bottom-2",
                message.role === "user"
                  ? "bg-cyan-300 text-slate-950"
                  : "border border-white/10 bg-white/8 text-slate-100"
              )}
            >
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-white">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-white/10 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-md border border-white/10 bg-white/6 px-3 py-2 text-left text-xs leading-4 text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
            >
              {prompt.includes("Actually") ? "Merge demo" : prompt.includes("API key") ? "Skip demo" : "Remember demo"}
            </button>
          ))}
        </div>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(event);
            }
          }}
          placeholder="Tell the agent a durable preference, project detail, or instruction..."
          className="min-h-24"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading || !draft.trim()}>
            <SendHorizontal className="h-4 w-4" />
            Send
          </Button>
        </div>
      </form>
    </section>
  );
}
