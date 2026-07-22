import { httpClient } from "@/lib/http-client";

export interface UpdateTenantInput {
  name?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  publicAddress?: string | null;
  description?: string | null;
  reactivationEnabled?: boolean;
  daysAfterLastService?: number;
  reactivationCooldownDays?: number;
  reactivationTemplateName?: string | null;
  subscriptionClubEnabled?: boolean;
}

export interface UpdateTenantResponse {
  id: string;
  name: string;
  slug: string | null;
  timezone: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  publicAddress: string | null;
  description: string | null;
  reactivationEnabled?: boolean;
  daysAfterLastService?: number;
  reactivationCooldownDays?: number;
  reactivationTemplateName?: string | null;
  depositModuleEnabled: boolean;
  depositPaymentProvider: "MANUAL" | "MERCADO_PAGO";
  depositProviderConfigured: boolean;
  mercadoPagoPublicKey: string | null;
  depositConvenienceFeeEnabled: boolean;
  subscriptionClubAllowed?: boolean;
  subscriptionClubEnabled?: boolean;
}

export interface BookingReminderSettings {
  enabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  offsets: number[];
}

export interface UpdateBookingReminderSettingsInput {
  enabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  offsets: number[];
}

export interface SendBookingReminderTestEmailInput {
  recipientEmail: string;
}

export interface SendBookingReminderTestEmailResponse {
  status: "SENT";
}

export interface TenantCustomerAppSettings {
  tenantSlug: string;
  customerAppUrl: string;
  whatsappMessageTemplate: string;
  whatsappBusinessHint: string;
}

export interface SendCustomerReturnReminderTestInput {
  customerName: string;
  customerPhone: string;
}

export interface SendCustomerReturnReminderTestResponse {
  status: "SENT";
  metaMessageId: string;
}

export interface GeocodeInput {
  latitude: number;
  longitude: number;
}

export interface GeocodeResponse {
  formattedAddress: string;
}

export interface BusinessHour {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface UpdateBusinessHoursInput {
  businessHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    startTime?: string | null;
    endTime?: string | null;
  }>;
}

export const tenantService = {
  async updateTenant(input: UpdateTenantInput): Promise<UpdateTenantResponse> {
    return httpClient<UpdateTenantResponse>("/tenants/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async sendCustomerReturnReminderTest(
    input: SendCustomerReturnReminderTestInput,
  ): Promise<SendCustomerReturnReminderTestResponse> {
    return httpClient<SendCustomerReturnReminderTestResponse>(
      "/tenants/me/customer-return-reminders/test",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async geocode(input: GeocodeInput): Promise<GeocodeResponse> {
    return httpClient<GeocodeResponse>("/tenants/me/geocode", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getBusinessHours(): Promise<{ businessHours: BusinessHour[] }> {
    return httpClient<{ businessHours: BusinessHour[] }>("/tenants/me/business-hours");
  },

  async updateBusinessHours(input: UpdateBusinessHoursInput): Promise<void> {
    await httpClient("/tenants/me/business-hours", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async getBookingReminderSettings(): Promise<BookingReminderSettings> {
    return httpClient<BookingReminderSettings>("/tenants/me/booking-reminder-settings");
  },

  async getCustomerAppSettings(): Promise<TenantCustomerAppSettings> {
    return httpClient<TenantCustomerAppSettings>("/tenants/me/customer-app-settings");
  },

  async updateBookingReminderSettings(
    input: UpdateBookingReminderSettingsInput,
  ): Promise<BookingReminderSettings> {
    return httpClient<BookingReminderSettings>("/tenants/me/booking-reminder-settings", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async sendBookingReminderTestEmail(
    input: SendBookingReminderTestEmailInput,
  ): Promise<SendBookingReminderTestEmailResponse> {
    return httpClient<SendBookingReminderTestEmailResponse>(
      "/tenants/me/booking-reminder-settings/test-email",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },
};
