import { httpClient } from "@/lib/http-client";
import type { AcquisitionAttribution } from "@/lib/acquisition-attribution";

export const acquisitionService = {
  async recordSignupAttribution(input: AcquisitionAttribution): Promise<void> {
    await httpClient<void>("/acquisition/signup-attribution", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
