import { Navigate } from "react-router";

export function ApiTokensPage() {
  return <Navigate to="/app/system-admin/tenants/central?tab=api-tokens" replace />;
}
