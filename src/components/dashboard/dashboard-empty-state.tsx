import { Card, CardDescription, CardTitle } from "@/components/flow/card";

interface DashboardEmptyStateProps {
  title: string;
  description?: string;
}

export function DashboardEmptyState({ title, description }: DashboardEmptyStateProps) {
  return (
    <Card variant="glass" padding="md" className="border border-dashed border-white/10 text-center">
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription className="mt-2">{description}</CardDescription> : null}
    </Card>
  );
}
