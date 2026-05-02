import { cn } from "../lib/cn";
import { THEMES, type ThemeId } from "../theme";

export interface ThemePickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
  className?: string;
}

export const ThemePicker = ({ value, onChange, className }: ThemePickerProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-1 py-1",
      "border-[color:var(--aliasist-border)] bg-[color:var(--aliasist-surface)]",
      className,
    )}
    aria-label="Theme selector"
    role="group"
  >
    {THEMES.map((theme) => {
      const active = value === theme.id;
      return (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-all duration-250",
            active
              ? "bg-[color:var(--aliasist-accent)] text-[color:var(--aliasist-accent-contrast)] shadow-[0_0_0_1px_rgba(47,149,220,0.18)]"
              : "text-[color:var(--aliasist-text-muted)] hover:bg-[color:var(--aliasist-surface-elevated)] hover:text-[color:var(--aliasist-text)]",
          )}
          title={theme.description}
          aria-pressed={active}
        >
          {theme.label}
        </button>
      );
    })}
  </div>
);
