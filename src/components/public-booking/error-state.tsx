import { PageState } from "@/components/shared/page-state";

interface ErrorStatePublicProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorStatePublic({ title, description, actionLabel, onAction }: ErrorStatePublicProps) {
  return (
    <PageState title={title} description={description} actionLabel={actionLabel} onAction={onAction} />
  );
}
