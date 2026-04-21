import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ufo-500 text-ink-950 hover:bg-ufo-400 active:bg-ufo-600 shadow-glow",
  ghost:
    "bg-transparent text-ink-100 hover:bg-ink-800/60 active:bg-ink-800",
  outline:
    "border border-ink-600 text-ink-100 hover:border-ufo-500 hover:text-ufo-400 bg-ink-900/40",
  danger:
    "bg-danger-500 text-white hover:bg-danger-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
