import { useTheme } from "@/theme/theme-provider";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function ThemeSwitcher({ compact = false, className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={!isDark}
      onClick={() => setTheme(isDark ? "light-pastel" : "dark")}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-[var(--theme-border-default)] bg-[var(--theme-surface-glass)] text-[var(--theme-text-soft)] backdrop-blur-[var(--theme-blur-panel)] transition-all hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-surface-glass-hover)] hover:text-[var(--theme-text-primary)] active:scale-95 focus-visible:outline-none focus-visible:[box-shadow:var(--theme-focus-ring)]",
        compact ? "h-8 w-8" : "h-10 w-10",
        className
      )}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
