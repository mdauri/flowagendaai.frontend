import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { colors, radius, semanticTokens, shadows, typography } from "@/design-system";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-transparent text-sm transition-all outline-none focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] disabled:pointer-events-none disabled:opacity-[var(--control-disabled-opacity)] disabled:[cursor:var(--control-disabled-cursor)] disabled:[filter:var(--control-disabled-filter)]",
  {
    variants: {
      variant: {
        primary: "hover:translate-y-[var(--control-hover-lift-y)]",
        secondary: "hover:[background-color:var(--control-hover-glass-background)]",
        ghost: "hover:[color:var(--control-hover-ghost-text)]",
      },
      size: {
        sm: "h-10 px-4 py-2",
        md: "h-12 px-5 py-3",
        lg: "h-14 px-7 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

const buttonBaseStyle: React.CSSProperties = {
  borderRadius: radius.xl,
  fontFamily: typography.family.sans,
  fontWeight: typography.weight.semibold,
};

const buttonStateStyle = {
  "--control-hover-lift-y": semanticTokens.interaction.hover.liftY,
  "--control-hover-glass-background": semanticTokens.interaction.hover.glassBackground,
  "--control-hover-ghost-text": semanticTokens.interaction.hover.ghostText,
  "--control-focus-border": semanticTokens.interaction.focus.border,
  "--control-focus-ring": semanticTokens.interaction.focus.ring,
  "--control-disabled-opacity": semanticTokens.interaction.disabled.opacity,
  "--control-disabled-filter": semanticTokens.interaction.disabled.filter,
  "--control-disabled-cursor": semanticTokens.interaction.disabled.cursor,
} as React.CSSProperties;

const buttonVariantStyles: Record<NonNullable<VariantProps<typeof buttonVariants>["variant"]>, React.CSSProperties> = {
  primary: {
    backgroundImage: `linear-gradient(to right, ${colors.brand.primary}, ${colors.brand.secondary})`,
    boxShadow: shadows.glow,
    color: colors.text.dark,
  },
  secondary: {
    backgroundColor: semanticTokens.surface.glass,
    borderColor: semanticTokens.border.default,
    color: colors.text.primary,
    backdropFilter: `blur(${semanticTokens.blur.panel})`,
  },
  ghost: {
    color: colors.text.soft,
  },
};

export type ButtonProps<C extends React.ElementType = "button"> =
  VariantProps<typeof buttonVariants> &
    Omit<React.ComponentPropsWithoutRef<C>, "className"> & {
      as?: C;
      className?: string;
    };

export function Button<C extends React.ElementType = "button">({
  as,
  className,
  variant,
  size,
  style,
  ...props
}: ButtonProps<C>) {
  const Component = as ?? "button";
  const resolvedVariant = variant ?? "primary";

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      style={{
        ...buttonBaseStyle,
        ...buttonStateStyle,
        ...buttonVariantStyles[resolvedVariant],
        ...style,
      }}
      {...props}
    />
  );
}
