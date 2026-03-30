import { Badge } from "@/components/flow/badge";

interface DashboardStatusBadgeProps {
  status: string;
}

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
  return status.replace(/_/g, " ");
}

export function DashboardStatusBadge({ status }: DashboardStatusBadgeProps) {
  return <Badge variant={resolveBadgeVariant(status)}>{formatStatusLabel(status)}</Badge>;
}
