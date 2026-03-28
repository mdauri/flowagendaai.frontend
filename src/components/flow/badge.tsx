import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { colors, semanticTokens, typography } from "@/design-system";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs", {
  variants: {
    variant: {
      default: "",
      subtle: "",
      neutral: "",
      success: "",
      warning: "",
      danger: "",
      info: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeBaseStyle: React.CSSProperties = {
  fontFamily: typography.family.sans,
  fontWeight: typography.weight.medium,
};

const badgeVariantStyles: Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, React.CSSProperties> = {
  default: {
    backgroundColor: colors.badge.background,
    borderColor: colors.badge.border,
    color: colors.badge.text,
  },
  subtle: {
    backgroundColor: semanticTokens.surface.glass,
    borderColor: semanticTokens.border.subtle,
    color: colors.text.soft,
  },
  neutral: {
    backgroundColor: semanticTokens.surface.glassSubtle,
    borderColor: semanticTokens.border.default,
    color: colors.text.soft,
  },
  success: {
    backgroundColor: semanticTokens.feedback.success.background,
    borderColor: semanticTokens.feedback.success.border,
    color: semanticTokens.feedback.success.text,
  },
  warning: {
    backgroundColor: semanticTokens.feedback.warning.background,
    borderColor: semanticTokens.feedback.warning.border,
    color: semanticTokens.feedback.warning.text,
  },
  danger: {
    backgroundColor: semanticTokens.feedback.danger.background,
    borderColor: semanticTokens.feedback.danger.border,
    color: semanticTokens.feedback.danger.text,
  },
  info: {
    backgroundColor: semanticTokens.feedback.info.background,
    borderColor: semanticTokens.feedback.info.border,
    color: semanticTokens.feedback.info.text,
  },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, style, variant, ...props }: BadgeProps) {
  const resolvedVariant = variant ?? "default";

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{
        ...badgeBaseStyle,
        ...badgeVariantStyles[resolvedVariant],
        ...style,
      }}
      {...props}
    />
  );
}
