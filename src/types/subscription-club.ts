export type SubscriptionPlanStatus = "ACTIVE" | "INACTIVE";
export type SubscriptionUsagePeriod = "WEEKLY" | "MONTHLY";
export type SubscriptionAccumulationPolicy = "NON_CUMULATIVE";
export type CustomerSubscriptionStatus =
  | "ACTIVE"
  | "PAYMENT_PENDING"
  | "PAUSED"
  | "CANCELLED"
  | "EXPIRED";
export type SubscriptionUsageStatus = "CONSUMED" | "CANCELLED" | "REVERTED";
export type SubscriptionPaymentStatus = "PAID" | "PENDING" | "CANCELLED";
export type SubscriptionPaymentMethod = "MANUAL";
export type BookingPaymentMode = "NORMAL" | "DEPOSIT_REQUIRED" | "SUBSCRIPTION";

export interface Customer {
  id: string;
  tenantId: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanServiceRule {
  id: string;
  tenantId: string;
  subscriptionPlanId: string;
  serviceId: string;
  serviceName?: string | null;
  quantityLimit: number;
  usagePeriod: SubscriptionUsagePeriod;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  monthlyPrice: string;
  status: SubscriptionPlanStatus;
  accumulationPolicy: SubscriptionAccumulationPolicy;
  allowedWeekDays: number[];
  services: SubscriptionPlanServiceRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSubscription {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: Customer;
  subscriptionPlanId: string;
  plan?: SubscriptionPlan;
  status: CustomerSubscriptionStatus;
  startsAt: string;
  endsAt: string | null;
  currentCycleStart: string;
  currentCycleEnd: string;
  nextBillingAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  id: string;
  tenantId: string;
  customerSubscriptionId: string;
  subscriptionPlanId: string;
  serviceId: string;
  serviceName?: string | null;
  bookingId: string | null;
  usagePeriodStart: string;
  usagePeriodEnd: string;
  status: SubscriptionUsageStatus;
  consumedAt: string;
  revertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  tenantId: string;
  customerSubscriptionId: string;
  amount: string;
  status: SubscriptionPaymentStatus;
  paymentMethod: SubscriptionPaymentMethod;
  paidAt: string | null;
  dueDate: string | null;
  externalProvider: string | null;
  externalPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  description?: string | null;
  monthlyPrice: string;
  status: SubscriptionPlanStatus;
  allowedWeekDays: number[];
  services: Array<{
    serviceId: string;
    quantityLimit: number;
    usagePeriod: SubscriptionUsagePeriod;
  }>;
}

export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput>;

export interface ListSubscriptionPlansResponse {
  items: SubscriptionPlan[];
}

export interface GetSubscriptionPlanResponse {
  plan: SubscriptionPlan;
}

export interface UpsertCustomerInput {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ListCustomersResponse {
  items: Customer[];
}

export interface CreateCustomerSubscriptionInput {
  customer: UpsertCustomerInput;
  subscriptionPlanId: string;
  status?: CustomerSubscriptionStatus;
  startsAt: string;
  endsAt?: string | null;
  currentCycleStart: string;
  currentCycleEnd: string;
  nextBillingAt?: string | null;
}

export type UpdateCustomerSubscriptionInput = Partial<
  Omit<CreateCustomerSubscriptionInput, "customer">
> & {
  customerId?: string;
};

export interface ListCustomerSubscriptionsResponse {
  items: CustomerSubscription[];
}

export interface GetCustomerSubscriptionResponse {
  subscription: CustomerSubscription;
  payments: SubscriptionPayment[];
  usages: SubscriptionUsage[];
}

export interface MarkSubscriptionPaidInput {
  amount: string;
  paidAt?: string | null;
  dueDate?: string | null;
}

export interface ListSubscriptionUsagesResponse {
  items: SubscriptionUsage[];
}

export interface ActiveCustomerSubscriptionResponse {
  subscription: CustomerSubscription | null;
}

export interface ValidateSubscriptionUsageInput {
  customerId?: string;
  customerPhone?: string;
  serviceId: string;
  startDateTime: string;
  bookingId?: string;
}

export interface ValidateSubscriptionUsageResponse {
  allowed: boolean;
  blockReason: string | null;
  customerSubscription: CustomerSubscription | null;
  plan: SubscriptionPlan | null;
  availableBalance: number;
  quantityLimit: number;
  usedQuantity: number;
  usagePeriodStart: string | null;
  usagePeriodEnd: string | null;
  allowedServices?: Array<{
    serviceId: string;
    serviceName?: string | null;
    quantityLimit: number;
    usagePeriod: SubscriptionUsagePeriod;
  }>;
  message?: string;
}
