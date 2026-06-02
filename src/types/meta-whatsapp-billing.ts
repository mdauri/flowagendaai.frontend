export interface MetaWhatsAppBillingSummarySeriesItem {
  month: string;
  totalEvents: number;
  grossCost: string;
  repassedCost: string;
}

export interface MetaWhatsAppBillingSummaryCard {
  totalEvents: number;
  messagesReceived: number;
  messagesSent: number;
  deliveredCount: number;
  failedCount: number;
  freeMessagesCount: number;
  grossCost: string;
  repassedCost: string;
  billingMonth: string;
  timezone: string;
}

export interface MetaWhatsAppBillingSummaryResponse {
  generatedAt: string;
  month: string;
  currency: string;
  series: MetaWhatsAppBillingSummarySeriesItem[];
  current: MetaWhatsAppBillingSummaryCard;
  previous: MetaWhatsAppBillingSummaryCard | null;
  byCategory: Array<{
    category: string;
    totalEvents: number;
    grossCost: string;
    repassedCost: string;
  }>;
  byTenant: Array<{
    tenantId: string;
    tenantName: string;
    totalEvents: number;
    grossCost: string;
    repassedCost: string;
    monthlyLimitValue: string;
    alertThresholdValue: string;
    usagePercentage: number | null;
    isNearLimit: boolean;
  }>;
  topTenant: {
    tenantId: string;
    tenantName: string;
    totalEvents: number;
    grossCost: string;
    repassedCost: string;
    monthlyLimitValue: string;
    alertThresholdValue: string;
    usagePercentage: number | null;
    isNearLimit: boolean;
  } | null;
  alerts: Array<{
    tenantId: string;
    tenantName: string;
    message: string;
    severity: "info" | "warning" | "danger";
    usagePercentage: number | null;
    monthlyLimitValue: string;
    repassedCost: string;
  }>;
}

export type MetaWhatsAppBillingTenantSummaryResponse = Omit<MetaWhatsAppBillingSummaryResponse, "topTenant">;

export interface MetaWhatsAppBillingEvent {
  id: string;
  tenantId: string;
  wabaId: string | null;
  phoneNumberId: string;
  recipientPhone: string | null;
  messageId: string | null;
  eventType: string;
  messageCategory: string;
  recipientCountry: string | null;
  pricingCurrency: string;
  pricingRateId: string | null;
  pricingVersion: string | null;
  estimatedCost: string;
  repassedCost: string;
  isFree: boolean;
  billingStatus: string;
  sourceEventId: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaWhatsAppBillingEventsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: MetaWhatsAppBillingEvent[];
}

export interface MetaWhatsAppPricingRate {
  id: string;
  countryCode: string;
  messageCategory: string;
  currency: string;
  baseCost: string;
  isFree: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  source: string | null;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MetaWhatsAppBillingSettings {
  id: string;
  tenantId: string;
  markupType: "NONE" | "PERCENTAGE" | "FIXED";
  markupValue: string;
  fixedFeeValue: string;
  monthlyLimitValue: string;
  alertThresholdValue: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertMetaWhatsAppPricingRateInput {
  id?: string | null;
  countryCode: string;
  messageCategory: string;
  currency?: string;
  baseCost: string | number;
  isFree?: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  source?: string | null;
  externalReference?: string | null;
}

export interface UpsertMetaWhatsAppBillingSettingsInput {
  markupType: "NONE" | "PERCENTAGE" | "FIXED";
  markupValue?: string | number;
  fixedFeeValue?: string | number;
  monthlyLimitValue?: string | number;
  alertThresholdValue?: string | number;
  currency?: string;
  isActive?: boolean;
}
