import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/types/api";

export function useRequireAuth() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.token && !auth.isBootstrapping) {
      navigate("/login", { replace: true });
      return;
    }

    if (auth.error instanceof ApiError && auth.error.status === 401) {
      auth.logout();
      navigate("/login", { replace: true });
    }
  }, [auth, navigate]);

  return auth;
}
