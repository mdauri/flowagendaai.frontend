import { Card, CardDescription, CardTitle } from "@/components/landing/flow/card";

interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card className="transition-transform hover:-translate-y-1 hover:border-white/20">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-(--radius-lg) bg-linear-to-br from-primary to-tertiary text-lg font-black text-dark">
        ✦
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-3">{description}</CardDescription>
    </Card>
  );
}
