import { httpClient } from "@/lib/http-client";

export interface PublicCustomerAppConfig {
  tenant: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    publicAddress: string | null;
    description: string | null;
  };
  customerAppUrl: string;
  catalogUrl: string;
  whatsappPhone: string | null;
  whatsappUrl: string | null;
  supportsInstallHint: boolean;
  supportsPushHint: boolean;
  pushPublicKey: string | null;
}

export interface BootstrapCustomerAppSessionResponse {
  sessionToken: string;
  expiresAt: string;
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface CustomerAppBooking {
  id: string;
  status: string;
  start: string;
  end: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  professionalName: string | null;
  serviceName: string | null;
  manageTokenExpiresAt: string | null;
}

export interface CustomerAppBookingsResponse {
  customer: {
    id: string;
    name: string | null;
  };
  bookings: CustomerAppBooking[];
}

export interface CustomerAppBookingDetailResponse {
  booking: CustomerAppBooking;
}

export interface CustomerPushSubscriptionResponse {
  subscriptionId: string;
  active: boolean;
  endpoint: string;
}

export const customerAppService = {
  async getPublicConfig(tenantSlug: string): Promise<PublicCustomerAppConfig> {
    return httpClient<PublicCustomerAppConfig>(`/public/customer-app/${tenantSlug}/config`, {
      skipAuth: true,
    });
  },

  async bootstrapSession(
    tenantSlug: string,
    input: { bookingBootstrapToken: string; deviceLabel?: string },
  ): Promise<BootstrapCustomerAppSessionResponse> {
    return httpClient<BootstrapCustomerAppSessionResponse>(
      `/public/customer-app/${tenantSlug}/session/bootstrap`,
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(input),
      },
    );
  },

  async listBookings(
    tenantSlug: string,
    sessionToken: string,
  ): Promise<CustomerAppBookingsResponse> {
    return httpClient<CustomerAppBookingsResponse>(`/public/customer-app/${tenantSlug}/bookings`, {
      skipAuth: true,
      headers: {
        "X-Customer-App-Session": sessionToken,
      },
    });
  },

  async getBookingDetail(
    tenantSlug: string,
    bookingId: string,
    sessionToken: string,
  ): Promise<CustomerAppBookingDetailResponse> {
    return httpClient<CustomerAppBookingDetailResponse>(
      `/public/customer-app/${tenantSlug}/bookings/${bookingId}`,
      {
        skipAuth: true,
        headers: {
          "X-Customer-App-Session": sessionToken,
        },
      },
    );
  },

  async registerPushSubscription(
    tenantSlug: string,
    sessionToken: string,
    input: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
  ): Promise<CustomerPushSubscriptionResponse> {
    return httpClient<CustomerPushSubscriptionResponse>(
      `/public/customer-app/${tenantSlug}/push-subscriptions`,
      {
        method: "POST",
        skipAuth: true,
        headers: {
          "X-Customer-App-Session": sessionToken,
        },
        body: JSON.stringify(input),
      },
    );
  },

  async deactivatePushSubscription(
    tenantSlug: string,
    sessionToken: string,
    subscriptionId: string,
  ): Promise<void> {
    await httpClient<void>(
      `/public/customer-app/${tenantSlug}/push-subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        skipAuth: true,
        headers: {
          "X-Customer-App-Session": sessionToken,
        },
      },
    );
  },
};
