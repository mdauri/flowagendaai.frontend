import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card } from "@/components/flow/card";
import { Badge } from "@/components/flow/badge";
import { cn } from "@/lib/cn";
import type { AuthTenant, AuthUser } from "@/types/auth";

interface AppShellProps extends PropsWithChildren {
  user: AuthUser;
  tenant: AuthTenant;
  onLogout: () => void;
}

export function AppShell({ user, tenant, onLogout, children }: AppShellProps) {
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
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="subtle">{user.role}</Badge>
          <Button variant="secondary" size="md" onClick={onLogout}>
            Sair
          </Button>
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
