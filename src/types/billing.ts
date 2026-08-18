export type TenantSubscriptionStatus =
  | "NOT_CONFIGURED"
  | "TRIALING"
  | "PENDING"
  | "ACTIVE"
  | "OVERDUE"
  | "GRACE_PERIOD"
  | "SUSPENDED"
  | "CANCELED";

export type TenantBillingPaymentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RECEIVED"
  | "OVERDUE"
  | "REFUNDED"
  | "CHARGEBACK"
  | "CANCELED"
  | "FAILED"
  | "UNKNOWN";

export interface BillingStatusResponse {
  enabled: boolean;
  plan: {
    code: string;
    name: string;
    price: number;
    cycle: "MONTHLY";
  };
  subscription: {
    status: TenantSubscriptionStatus;
    provider: "ASAAS";
    providerCustomerId: string | null;
    providerSubscriptionId: string | null;
    nextBillingDate: string | null;
    gracePeriodUntil: string | null;
    billingActivatedAt: string | null;
    billingCanceledAt: string | null;
    cancellationRequestedAt: string | null;
  };
  billingCustomer: BillingCustomerData;
}

export interface BillingCustomerData {
  billingEmail: string | null;
  billingCpfCnpj: string | null;
  billingPhone: string | null;
  billingAddress: string | null;
  billingAddressNumber: string | null;
  billingPostalCode: string | null;
  billingProvince: string | null;
}

export interface BillingCustomerInput {
  billingEmail: string;
  billingCpfCnpj: string;
  billingPhone: string;
  billingAddress: string;
  billingAddressNumber: string;
  billingPostalCode: string;
  billingProvince: string;
}

export interface BillingPayment {
  id: string;
  tenantId: string;
  provider: "ASAAS";
  providerPaymentId: string;
  providerSubscriptionId: string | null;
  amount: number;
  status: TenantBillingPaymentStatus;
  billingType: string | null;
  dueDate: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingPaymentsResponse {
  items: BillingPayment[];
}

export interface BillingCheckoutResponse {
  checkoutUrl: string;
  externalReference: string;
}

export interface SystemAdminBillingTenantSummary {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  account: BillingStatusResponse["subscription"] | null;
  lastPayment: BillingPayment | null;
}
