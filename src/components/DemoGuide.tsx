import { Clapperboard, ClipboardList, Play, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

type DemoGuideProps = {
  onLoadDemo: () => void;
  onOpenPrompt: () => void;
};

export function DemoGuide({ onLoadDemo, onOpenPrompt }: DemoGuideProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950/45 px-4 py-4 sm:px-6">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <Clapperboard className="h-4 w-4" />
            3-minute demo story
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-200">
            Show the prompt, then prove it controls memory: Remember a durable preference, Merge a changed preference, Skip a sensitive throwaway detail.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/6 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ClipboardList className="h-4 w-4 text-cyan-300" />
            What judges see
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-300">
            The system prompt is the product. The agent is only the proof that the prompt writes useful Walrus memories.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/6 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Proof checklist
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-300">
            Capture Recall, Decision, Remember/Merge/Skip, Persistent Memory, and your Agent ID after real writes.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button variant="primary" onClick={onLoadDemo} className="h-full min-h-12">
            <Play className="h-4 w-4" />
            Load Demo Scene
          </Button>
          <Button onClick={onOpenPrompt} className="h-full min-h-12">
            <ClipboardList className="h-4 w-4" />
            Show Prompt
          </Button>
        </div>
      </div>
    </section>
  );
}
