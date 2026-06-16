export type WaitlistEntryStatus = "WAITING" | "OFFERED" | "BOOKED" | "EXPIRED" | "CANCELLED";

export type WaitlistPeriod = "MORNING" | "AFTERNOON" | "EVENING";

export interface WaitlistEntry {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  employeeId?: string | null;
  preferredDate?: string | null;
  preferredPeriod?: WaitlistPeriod | null;
  notes?: string | null;
  status: WaitlistEntryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListWaitlistResponse {
  items: WaitlistEntry[];
}

export interface WaitlistMutationResponse {
  waitlistEntry: WaitlistEntry;
  wasCreated?: boolean;
}

export interface WaitlistFilters {
  customerPhone?: string;
  serviceId?: string;
  employeeId?: string;
  preferredDate?: string;
  preferredPeriod?: WaitlistPeriod;
  status?: WaitlistEntryStatus;
}

export interface CreateWaitlistInput {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  employeeId?: string | null;
  preferredDate?: string | null;
  preferredPeriod?: WaitlistPeriod | null;
  notes?: string | null;
}

export interface UpdateWaitlistInput {
  customerName?: string;
  customerPhone?: string;
  serviceId?: string;
  employeeId?: string | null;
  preferredDate?: string | null;
  preferredPeriod?: WaitlistPeriod | null;
  notes?: string | null;
  status?: WaitlistEntryStatus;
}
