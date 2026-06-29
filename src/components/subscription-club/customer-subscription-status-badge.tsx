import { Badge } from "@/components/flow/badge";
import type { CustomerSubscriptionStatus } from "@/types/subscription-club";

interface CustomerSubscriptionStatusBadgeProps {
  status: CustomerSubscriptionStatus;
}

export function subscriptionStatusLabel(status: CustomerSubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "Ativa";
    case "PAYMENT_PENDING":
      return "Pendente";
    case "PAUSED":
      return "Pausada";
    case "CANCELLED":
      return "Cancelada";
    case "EXPIRED":
      return "Vencida";
  }
}

export function CustomerSubscriptionStatusBadge({
  status,
}: CustomerSubscriptionStatusBadgeProps) {
  const variant = status === "ACTIVE" ? "success" : status === "CANCELLED" ? "danger" : "warning";

  return <Badge variant={variant}>{subscriptionStatusLabel(status)}</Badge>;
}
