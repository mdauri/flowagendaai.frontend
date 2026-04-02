import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { colors, radius } from "@/design-system";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div
        className={cn(
          "peer h-5 w-5 shrink-0 rounded border border-white/30 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D]",
          checked
            ? "bg-[#FF8A3D] border-[#FF8A3D]"
            : "bg-transparent hover:bg-white/10",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCheckedChange?.(!checked);
          }
        }}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        {checked && (
          <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
