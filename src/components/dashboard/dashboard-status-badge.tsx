import { Badge } from "@/components/flow/badge";

interface DashboardStatusBadgeProps {
  status: string;
}

const STATUS_LABELS_PT_BR: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluido",
};

function resolveBadgeVariant(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "neutral";
  }
}

function formatStatusLabel(status: string) {
  const normalized = status.toUpperCase();
  return STATUS_LABELS_PT_BR[normalized] ?? status.replace(/_/g, " ");
}

export function DashboardStatusBadge({ status }: DashboardStatusBadgeProps) {
  return <Badge variant={resolveBadgeVariant(status)}>{formatStatusLabel(status)}</Badge>;
}
