export interface CommercialFunnelSummary {
  signups: number;
  published: number;
  firstRealBooking: number;
  paid: number;
  trialing: number;
  expiredOrCanceled: number;
}

export interface CommercialFunnelRates {
  signupToPublish: number;
  signupToFirstRealBooking: number;
  signupToPaid: number;
  publishToFirstRealBooking: number;
}

export interface CommercialFunnelTimings {
  averageTimeToPublish: number | null;
  averageTimeToFirstRealBooking: number | null;
  averagePublishToFirstRealBooking: number | null;
}

export interface CommercialAttributionRow {
  source: string;
  medium: string | null;
  campaign: string | null;
  signups: number;
  published: number;
  firstRealBooking: number;
  paid: number;
  signupToPaidRate: number;
}

export interface CommercialTenantRow {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  createdAt: string;
  publishedAt: string | null;
  firstRealBookingAt: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  billingActivatedAt: string | null;
  acquisition: {
    source: string;
    medium: string | null;
    campaign: string | null;
  };
}

export interface CommercialFunnelResponse {
  period: {
    from: string;
    to: string;
  };
  summary: CommercialFunnelSummary;
  rates: CommercialFunnelRates;
  timingsMs: CommercialFunnelTimings;
  attribution: CommercialAttributionRow[];
  tenants: CommercialTenantRow[];
}
