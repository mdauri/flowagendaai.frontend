import { Navigate } from "react-router-dom";

export function ApiTokensPage() {
  return <Navigate to="/app/system-admin/tenants/central?tab=api-tokens" replace />;
}
