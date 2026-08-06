import { Navigate } from "react-router";

export function SystemAdminTenantDepositFeePage() {
  return <Navigate to="/app/system-admin/tenants/central?tab=deposit-fee" replace />;
}
