import { Archive, Clock3 } from "lucide-react";
import type { StoredMemory } from "../types/memory";

export function PersistentMemory({ memories }: { memories: StoredMemory[] }) {
  return (
    <section className="glass min-h-[520px] rounded-lg">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Archive className="h-4 w-4 text-cyan-300" />
          Persistent Memory
        </div>
      </div>

      <div className="scrollbar-thin max-h-[calc(100vh-170px)] space-y-3 overflow-y-auto p-4">
        {memories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-5 text-sm text-slate-300">
            Durable Walrus memories will appear here newest first.
          </div>
        ) : (
          memories.map((memory, index) => (
            <article
              key={memory.id}
              className="rounded-lg border border-white/10 bg-white/8 p-4 text-sm text-slate-200 shadow-lg animate-in fade-in slide-in-from-right-3"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-medium text-cyan-100">
                  {memory.type}
                </span>
                <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">{memory.status}</span>
              </div>
              <p className="mt-3 leading-6 text-slate-100">{memory.content}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                {new Date(memory.createdAt).toLocaleString()}
              </div>
              <p className="mt-2 truncate font-mono text-[11px] text-slate-500">{memory.id}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
