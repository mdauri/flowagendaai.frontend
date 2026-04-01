import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { colors, radius, semanticTokens, typography } from "@/design-system";

const textareaVariants = cva(
  "w-full border text-sm outline-none transition-all placeholder:text-white/35 focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] disabled:pointer-events-none disabled:opacity-[var(--control-disabled-opacity)] disabled:[cursor:var(--control-disabled-cursor)] disabled:[filter:var(--control-disabled-filter)]",
  {
    variants: {
      variant: {
        glass: "focus:[background-color:var(--control-hover-glass-background-strong)]",
      },
      size: {
        sm: "h-20 px-4 py-3",
        md: "h-28 px-4 py-3",
        lg: "h-40 px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
    },
  }
);

const textareaBaseStyle: React.CSSProperties = {
  borderRadius: radius.xl,
  backgroundColor: semanticTokens.surface.glass,
  borderColor: semanticTokens.border.subtle,
  color: colors.text.primary,
  fontFamily: typography.family.sans,
  fontWeight: typography.weight.medium,
  backdropFilter: `blur(${semanticTokens.blur.panel})`,
  resize: "vertical",
};

const textareaStateStyle = {
  "--control-hover-glass-background-strong": semanticTokens.interaction.hover.glassBackgroundStrong,
  "--control-focus-border": semanticTokens.interaction.focus.border,
  "--control-focus-ring": semanticTokens.interaction.focus.ring,
  "--control-disabled-opacity": semanticTokens.interaction.disabled.opacity,
  "--control-disabled-filter": semanticTokens.interaction.disabled.filter,
  "--control-disabled-cursor": semanticTokens.interaction.disabled.cursor,
} as React.CSSProperties;

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ variant, size }), className)}
        style={{
          ...textareaBaseStyle,
          ...textareaStateStyle,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
