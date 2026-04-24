export type ApiTokenScope =
  | "messages:read"
  | "messages:send"
  | "customers:read"
  | "bookings:read"
  | "bookings:write"
  | "ai:respond"
  | "webhooks:receive"
  | "ai:respond"
  | "webhooks:receive";

export interface CreateApiTokenInput {
  tenantId: string;
  name: string;
  prefix: string;
  scopes: ApiTokenScope[];
  expiresAt: string;
}

export interface CreateApiTokenResponse {
  apiToken: {
    id: string;
    name: string;
    prefix: string;
    scopes: ApiTokenScope[];
    expiresAt: string;
    createdAt: string;
    createdBy: string;
  };
  token: string;
}

export interface ApiTokenListItem {
  id: string;
  name: string;
  prefix: string;
  scopes: ApiTokenScope[];
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy: string;
  status: "active" | "expired" | "revoked";
}

export interface ListApiTokensResponse {
  items: ApiTokenListItem[];
  allowedScopes: ApiTokenScope[];
}
