import { Card, CardDescription, CardTitle } from "@/components/landing/flow/card";

interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 before:absolute before:left-6 before:right-6 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/45 before:to-transparent hover:-translate-y-0.5 hover:border-[var(--theme-border-strong)] hover:shadow-[var(--theme-shadow-card)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-(--radius-lg) border border-[var(--theme-border-accent)] bg-linear-to-br from-primary to-tertiary text-lg font-black text-dark shadow-[var(--theme-shadow-card)]">
        ✦
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-3">{description}</CardDescription>
    </Card>
  );
}
