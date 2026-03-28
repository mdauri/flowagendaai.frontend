import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppPage } from "@/pages/app-page";
import { LoginPage } from "@/pages/login-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ServicesPage } from "@/pages/services-page";
import { ProtectedRoute } from "@/components/app/protected-route";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="professionals" replace />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="*" element={<Navigate to="professionals" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
