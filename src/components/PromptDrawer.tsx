import { Copy, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultPrompt } from "../prompts/defaultPrompt";
import type { PromptState } from "../types/memory";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type PromptDrawerProps = {
  open: boolean;
  prompt: PromptState;
  saving: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
};

export function PromptDrawer({ open, prompt, saving, onClose, onSave }: PromptDrawerProps) {
  const [draft, setDraft] = useState(prompt.content);

  useEffect(() => {
    if (open) setDraft(prompt.content);
  }, [open, prompt.content]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-label="Close prompt drawer" onClick={onClose} />
      <aside className="glass absolute right-0 top-0 h-full w-full max-w-3xl overflow-hidden rounded-l-lg">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">System Prompt</h2>
            <p className="mt-1 text-sm text-slate-400">Memory Policy v1.0 controls recall, decisions, and storage.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close prompt drawer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid h-[calc(100%-82px)] grid-rows-[1fr_auto] gap-4 p-5">
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="h-full min-h-[460px] font-mono text-sm leading-6" />

          <div className="rounded-lg border border-white/10 bg-white/6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-medium text-emerald-200">✓ Active</p>
                <p className="text-slate-400">Version: {prompt.version}</p>
                <p className="text-slate-400">Last Updated: {new Date(prompt.updatedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => onSave(draft)} disabled={saving}>
                  <Save className="h-4 w-4" />
                  Save Prompt
                </Button>
                <Button onClick={() => navigator.clipboard.writeText(draft)}>
                  <Copy className="h-4 w-4" />
                  Copy Prompt
                </Button>
                <Button onClick={() => setDraft(defaultPrompt)}>
                  <RotateCcw className="h-4 w-4" />
                  Restore Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
