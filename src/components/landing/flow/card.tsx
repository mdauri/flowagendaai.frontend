import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import {
  colors,
  radius,
  semanticTokens,
  shadows,
  typography,
} from "@/design-system";

const cardVariants = cva("border", {
  variants: {
    variant: {
      glass: "",
      surface: "",
      premium: "",
    },
    padding: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    radiusSize: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
      shell: "",
      xl: "",
      xxl: "",
    },
  },
  defaultVariants: {
    variant: "glass",
    padding: "md",
    radiusSize: "xxl",
  },
});

const cardRadiusStyles: Record<
  NonNullable<VariantProps<typeof cardVariants>["radiusSize"]>,
  React.CSSProperties
> = {
  xs: { borderRadius: radius.xs },
  sm: { borderRadius: radius.sm },
  md: { borderRadius: radius.md },
  lg: { borderRadius: radius.lg },
  shell: { borderRadius: radius.shell },
  xl: { borderRadius: radius.xl },
  xxl: { borderRadius: radius.xxl },
};

const cardBaseStyle: React.CSSProperties = {
  borderColor: semanticTokens.border.subtle,
};

const cardVariantStyles: Record<
  NonNullable<VariantProps<typeof cardVariants>["variant"]>,
  React.CSSProperties
> = {
  glass: {
    backgroundColor: semanticTokens.surface.glass,
    backdropFilter: `blur(${semanticTokens.blur.panel})`,
  },
  surface: {
    backgroundColor: semanticTokens.surface.panel,
  },
  premium: {
    backgroundImage: semanticTokens.surface.premiumGradient,
    borderColor: semanticTokens.border.default,
    boxShadow: shadows.soft,
  },
};

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export function Card({
  className,
  variant,
  padding,
  radiusSize,
  style,
  ...props
}: CardProps) {
  const resolvedVariant = variant ?? "glass";
  const resolvedRadiusSize = radiusSize ?? "xxl";

  return (
    <div
      className={cn(
        cardVariants({ variant, padding, radiusSize }),
        className
      )}
      style={{
        ...cardBaseStyle,
        ...cardRadiusStyles[resolvedRadiusSize],
        ...cardVariantStyles[resolvedVariant],
        ...style,
      }}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl text-white", className)}
      style={{
        fontFamily: typography.family.sans,
        fontWeight: typography.weight.black,
        letterSpacing: typography.tracking.tight,
        ...style,
      }}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-7", className)}
      style={{
        color: colors.text.soft,
        fontFamily: typography.family.sans,
        ...style,
      }}
      {...props}
    />
  );
}
