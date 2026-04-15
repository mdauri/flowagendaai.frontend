import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const glassListItemVariants = cva(
  "flex items-center gap-3 border border-white/10 bg-white/5",
  {
    variants: {
      size: {
        compact: "rounded-md px-4 py-3",
        feature: "rounded-(--radius-lg) px-4 py-4",
      },
    },
    defaultVariants: {
      size: "compact",
    },
  },
);

const glassListItemIconVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full bg-badge font-black text-secondary",
  {
    variants: {
      iconSize: {
        sm: "h-6 w-6 text-xs",
        md: "h-7 w-7 text-xs",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      iconSize: "md",
    },
  },
);

export interface GlassListItemProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassListItemVariants> {
  icon: React.ReactNode;
  label: string;
  iconClassName?: string;
  labelClassName?: string;
}

export function GlassListItem({
  className,
  icon,
  iconClassName,
  //iconSize,
  label,
  labelClassName,
  size,
  ...props
}: GlassListItemProps) {
  return (
    <div className={cn(glassListItemVariants({ size }), className)} {...props}>
      <div className={cn(glassListItemIconVariants(), iconClassName)}>
        {icon}
      </div>
      <p className={cn("min-w-0 text-sm text-text-soft", labelClassName)}>
        {label}
      </p>
    </div>
  );
}
