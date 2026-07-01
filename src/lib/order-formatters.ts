import { DateTime } from "luxon";
import type {
  FulfillmentType,
  ProductPaymentStatus,
  ProductOrderStatus,
  ProductUnitType,
} from "@/types/order-module";

export function formatOrderCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatOrderDate(value: string) {
  return DateTime.fromISO(value).toFormat("dd/MM/yyyy");
}

export function formatUnitType(value: ProductUnitType) {
  const labels: Record<ProductUnitType, string> = {
    UNIT: "unidade",
    HUNDRED: "cento",
    KIT: "kit",
    KG: "kg",
    TRAY: "bandeja",
  };

  return labels[value];
}

export function formatFulfillmentType(value: FulfillmentType) {
  return value === "DELIVERY" ? "Entrega" : "Retirada";
}

export function formatOrderStatus(value: ProductOrderStatus) {
  const labels: Record<ProductOrderStatus, string> = {
    RECEIVED: "Recebido",
    CONFIRMED: "Confirmado",
    AWAITING_PAYMENT: "Aguardando pagamento",
    PAID: "Pago",
    IN_PRODUCTION: "Em producao",
    READY: "Pronto",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };

  return labels[value];
}

export function formatPaymentStatus(value: ProductPaymentStatus) {
  const labels: Record<ProductPaymentStatus, string> = {
    PENDING: "Pendente",
    PARTIALLY_PAID: "Parcial",
    PAID: "Pago",
  };

  return labels[value];
}
