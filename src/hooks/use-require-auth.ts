import { useAuth } from "@/hooks/use-auth";

export function useRequireAuth() {
  return useAuth();
}
