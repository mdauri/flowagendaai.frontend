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
    cycle: "MONTHLY" | "YEARLY";
  };
  recurring: {
    items: Array<{
      productCode: string;
      priceCode: string;
      description: string;
      unitAmount: number;
      quantity: number;
      cycle: string;
      amount: number;
    }>;
    total: number;
  };
  seats: {
    includedProfessionals: number;
    additionalProfessionals: number;
    maxProfessionals: number;
    activeProfessionals: number;
  };
  subscription: {
    status: TenantSubscriptionStatus;
    provider: "ASAAS";
    providerCustomerId: string | null;
    providerSubscriptionId: string | null;
    trialStartsAt: string | null;
    trialEndsAt: string | null;
    trialDaysRemaining: number | null;
    nextBillingDate: string | null;
    gracePeriodUntil: string | null;
    billingActivatedAt: string | null;
    billingCanceledAt: string | null;
    cancellationRequestedAt: string | null;
    isBillingExempt: boolean;
    billingExemptAt: string | null;
    billingExemptReason: string | null;
  };
  entitlement: {
    canAccess: boolean;
    accessStatus:
      | "NOT_CONFIGURED"
      | "BILLING_EXEMPT"
      | "TRIAL_ACTIVE"
      | "ACTIVE"
      | "PAYMENT_PENDING"
      | "PAST_DUE"
      | "SUSPENDED"
      | "CANCELED";
    subscriptionStatus: TenantSubscriptionStatus;
    trialStartsAt: string | null;
    trialEndsAt: string | null;
    trialDaysRemaining: number | null;
    isBillingExempt: boolean;
    billingExemptAt: string | null;
    billingExemptReason: string | null;
    reason: string | null;
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
  expectedAmount: number | null;
  amountMismatch: boolean;
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
  checkoutUrls?: string[];
  externalReference: string;
  total?: number;
}

export interface BillingCheckoutInput {
  basePlan?: "AGENDORO_MONTHLY" | "AGENDORO_ANNUAL";
  additionalProfessionals?: number;
  whatsappAddon?: boolean;
}

export interface BillingOneTimePurchaseInput {
  productCode: "ASSISTED_ONBOARDING" | "WHATSAPP_ONBOARDING";
}

export interface BillingOneTimePurchaseResponse {
  paymentUrl: string;
  externalReference: string;
  amount: number;
}

export interface SystemAdminBillingTenantSummary {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  account: BillingStatusResponse["subscription"] | null;
  lastPayment: BillingPayment | null;
}
