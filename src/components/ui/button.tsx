import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-cyan-300/40 bg-cyan-300 text-slate-950 shadow-glow hover:bg-cyan-200",
        variant === "secondary" && "border-white/10 bg-white/8 text-slate-100 hover:border-cyan-300/40 hover:bg-white/12",
        variant === "ghost" && "border-transparent bg-transparent text-slate-300 hover:bg-white/8 hover:text-white",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-10 w-10 p-0",
        className
      )}
      {...props}
    />
  );
}
