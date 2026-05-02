import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "aliasist-button-primary hover:brightness-105 active:brightness-95",
  ghost: "aliasist-button-ghost",
  outline: "aliasist-button-outline",
  danger: "aliasist-button-danger hover:brightness-105 active:brightness-95",
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
        "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight",
        "transition-all duration-250 ease-out",
        "hover:brightness-105 active:scale-[0.98] active:brightness-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--aliasist-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--aliasist-bg)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "motion-reduce:transition-colors motion-reduce:hover:brightness-100 motion-reduce:active:scale-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
