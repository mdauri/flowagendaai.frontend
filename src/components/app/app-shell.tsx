import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "@/components/flow/card";
import { UserIdentityHeaderCard } from "@/components/app/user-identity-header-card";
import { cn } from "@/lib/cn";
import type { AuthTenant, AuthUser } from "@/types/auth";

interface AppShellProps extends PropsWithChildren {
  user: AuthUser;
  tenant: AuthTenant;
  isUserIdentityLoading?: boolean;
  onLogout: () => void;
}

export function AppShell({
  user,
  tenant,
  isUserIdentityLoading = false,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <header className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Agendoro
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Operacao autenticada
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-soft">
            Tenant atual:{" "}
            <span className="font-semibold text-white">{tenant.name}</span>
          </p>
          <nav
            aria-label="Navegacao principal da operacao"
            className="mt-5 flex flex-wrap gap-3"
          >
            <NavLink
              to="/app/dashboard"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/app/professionals"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Profissionais
            </NavLink>
            <NavLink
              to="/app/services"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Servicos
            </NavLink>
            <NavLink
              to="/app/availability"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Disponibilidade
            </NavLink>
            <NavLink
              to="/app/slots"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Slots
            </NavLink>
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-black"
                    : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                )
              }
            >
              Configuracoes
            </NavLink>
            {user.role === "system-admin" ? (
              <NavLink
                to="/app/api-tokens"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                  )
                }
              >
                API Tokens
              </NavLink>
            ) : null}
            {user.role === "system-admin" ? (
              <NavLink
                to="/app/system-admin/tenants/provision"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:text-white"
                  )
                }
              >
                Provisionamento
              </NavLink>
            ) : null}
          </nav>
        </div>
        <div className="min-w-0 xl:max-w-[360px]">
          <UserIdentityHeaderCard
            name={user.name}
            isLoading={isUserIdentityLoading}
            onLogout={onLogout}
          />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl">
        <Card variant="glass" padding="lg">
          {children}
        </Card>
      </main>
    </div>
  );
}
