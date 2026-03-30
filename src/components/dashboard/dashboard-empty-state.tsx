import { Card, CardDescription, CardTitle } from "@/components/flow/card";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
}

export function DashboardEmptyState({ title, description }: DashboardEmptyStateProps) {
  return (
    <Card variant="glass" padding="lg" className="border border-dashed border-white/10 text-center">
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-3">{description}</CardDescription>
    </Card>
  );
}
