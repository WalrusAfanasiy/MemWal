import { Brain, Database, GitMerge, Search, ShieldQuestion } from "lucide-react";
import type { MemoryEvent } from "../types/memory";
import { cn } from "../utils/cn";

const eventStyles = {
  recall: {
    icon: Search,
    color: "border-blue-300/30 bg-blue-400/10 text-blue-200"
  },
  decision: {
    icon: ShieldQuestion,
    color: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
  },
  remember: {
    icon: Database,
    color: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
  },
  merge: {
    icon: GitMerge,
    color: "border-orange-300/30 bg-orange-400/10 text-orange-100"
  },
  skip: {
    icon: Brain,
    color: "border-slate-300/20 bg-slate-400/10 text-slate-200"
  }
};

export function MemoryEngine({ events }: { events: MemoryEvent[] }) {
  return (
    <section className="glass min-h-[520px] rounded-lg">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Brain className="h-4 w-4 text-cyan-300" />
          Memory Engine
        </div>
      </div>

      <div className="scrollbar-thin max-h-[calc(100vh-170px)] space-y-3 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-5 text-sm leading-6 text-slate-300">
            <p className="font-medium text-white">The prompt controls memory.</p>
            <p className="mt-2">Send a message to watch Recall, Decision, Remember, Merge, or Skip animate in sequence.</p>
          </div>
        ) : (
          events.map((event, index) => {
            const style = eventStyles[event.type];
            const Icon = style.icon;
            return (
              <article
                key={event.id}
                className={cn("relative rounded-lg border p-4 animate-in fade-in slide-in-from-bottom-4", style.color)}
                style={{ animationDelay: `${index * 180}ms` }}
              >
                {index > 0 && <div className="absolute -top-3 left-8 h-3 w-px bg-white/20" />}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md border border-white/10 bg-slate-950/60 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-white">{event.title}</h2>
                      <time className="shrink-0 text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-5">{event.description}</p>
                    <dl className="mt-3 grid gap-2 text-xs text-slate-300">
                      <div>
                        <dt className="text-slate-500">Reason</dt>
                        <dd>{event.reason}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Action</dt>
                        <dd className="font-medium text-slate-100">{event.action}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
