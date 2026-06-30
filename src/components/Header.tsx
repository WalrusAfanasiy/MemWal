import { Copy, FileText, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

type HeaderProps = {
  onPromptOpen: () => void;
  onNewSession: () => void;
};

export function Header({ onPromptOpen, onNewSession }: HeaderProps) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-normal text-white">MemoryWAL</h1>
        <p className="truncate text-sm text-cyan-100/70">Persistent AI Memory powered by Walrus</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onPromptOpen} variant="primary">
          <FileText className="h-4 w-4" />
          Prompt
        </Button>
        <Button onClick={onNewSession}>
          <RotateCcw className="h-4 w-4" />
          New Session
        </Button>
        <Button
          aria-label="Copy product name"
          size="icon"
          variant="ghost"
          onClick={() => navigator.clipboard.writeText("MemoryWAL")}
          title="Copy product name"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
