import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import {
  colors,
  radius,
  semanticTokens,
  typography,
} from "@/design-system";

const inputVariants = cva(
  "w-full border text-sm outline-none transition-all placeholder:text-white/35 focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] disabled:pointer-events-none disabled:opacity-[var(--control-disabled-opacity)] disabled:[cursor:var(--control-disabled-cursor)] disabled:[filter:var(--control-disabled-filter)]",
  {
    variants: {
      variant: {
        glass: "focus:[background-color:var(--control-hover-glass-background-strong)]",
      },
      inputSize: {
        sm: "h-10 px-4",
        md: "h-12 px-4",
        lg: "h-14 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "glass",
      inputSize: "md",
    },
  }
);

const inputBaseStyle: React.CSSProperties = {
  borderRadius: radius.xl,
  backgroundColor: semanticTokens.surface.glass,
  borderColor: semanticTokens.border.subtle,
  color: colors.text.primary,
  fontFamily: typography.family.sans,
  fontWeight: typography.weight.medium,
  backdropFilter: `blur(${semanticTokens.blur.panel})`,
};

const inputStateStyle = {
  "--control-hover-glass-background-strong":
    semanticTokens.interaction.hover.glassBackgroundStrong,
  "--control-focus-border": semanticTokens.interaction.focus.border,
  "--control-focus-ring": semanticTokens.interaction.focus.ring,
  "--control-disabled-opacity": semanticTokens.interaction.disabled.opacity,
  "--control-disabled-filter": semanticTokens.interaction.disabled.filter,
  "--control-disabled-cursor": semanticTokens.interaction.disabled.cursor,
} as React.CSSProperties;

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, inputSize }), className)}
        style={{
          ...inputBaseStyle,
          ...inputStateStyle,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
