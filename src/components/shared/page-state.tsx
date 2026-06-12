import { Card } from "@/components/flow/card";
import { Button } from "@/components/flow/button";

interface PageStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageState({ title, description, actionLabel, onAction }: PageStateProps) {
  return (
    <Card variant="glass" padding="lg" className="mx-auto w-full max-w-xl min-w-0 text-center">
      <h2 className="text-2xl font-black tracking-tight text-[var(--theme-text-primary)]">{title}</h2>
      <p className="mt-4 text-base leading-7 text-text-soft">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6 w-full sm:w-auto" onClick={onAction} size="md">
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
