import { Badge } from "@/components/flow/badge";
import type { TenantBillingPaymentStatus, TenantSubscriptionStatus } from "@/types/billing";

export function subscriptionStatusLabel(status: TenantSubscriptionStatus) {
  const labels: Record<TenantSubscriptionStatus, string> = {
    NOT_CONFIGURED: "Nao configurada",
    TRIALING: "Teste gratis",
    PENDING: "Pagamento pendente",
    ACTIVE: "Ativa",
    OVERDUE: "Em atraso",
    GRACE_PERIOD: "Periodo de tolerancia",
    SUSPENDED: "Suspensa",
    CANCELED: "Cancelada",
  };
  return labels[status];
}

export function paymentStatusLabel(status: TenantBillingPaymentStatus) {
  const labels: Record<TenantBillingPaymentStatus, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    RECEIVED: "Recebido",
    OVERDUE: "Em atraso",
    REFUNDED: "Estornado",
    CHARGEBACK: "Chargeback",
    CANCELED: "Cancelado",
    FAILED: "Falhou",
    UNKNOWN: "Desconhecido",
  };
  return labels[status];
}

export function SubscriptionStatusBadge({ status }: { status: TenantSubscriptionStatus }) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "TRIALING"
        ? "info"
        : status === "GRACE_PERIOD" || status === "OVERDUE" || status === "PENDING"
        ? "warning"
        : status === "SUSPENDED" || status === "CANCELED"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{subscriptionStatusLabel(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: TenantBillingPaymentStatus }) {
  const variant =
    status === "CONFIRMED" || status === "RECEIVED"
      ? "success"
      : status === "PENDING" || status === "OVERDUE"
        ? "warning"
        : status === "FAILED" || status === "REFUNDED" || status === "CHARGEBACK"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{paymentStatusLabel(status)}</Badge>;
}
