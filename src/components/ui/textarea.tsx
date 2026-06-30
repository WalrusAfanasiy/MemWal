import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-md border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15",
        className
      )}
      {...props}
    />
  );
}
