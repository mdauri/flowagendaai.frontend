import { Navigate } from "react-router-dom";

export function SystemAdminTenantWhatsAppPage() {
  return <Navigate to="/app/system-admin/tenants/central?tab=whatsapp" replace />;
}
