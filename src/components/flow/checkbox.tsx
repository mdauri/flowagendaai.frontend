import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    function toggle() {
      if (disabled) {
        return;
      }

      onCheckedChange?.(!checked);
    }

    return (
      <button
        type="button"
        className={cn(
          "peer relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/30 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1f22]",
          checked
            ? "bg-[#FF8A3D] border-[#FF8A3D]"
            : "bg-transparent hover:bg-white/10",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
        onClick={toggle}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        {checked && (
          <Check className="h-4 w-4 text-white" />
        )}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";
