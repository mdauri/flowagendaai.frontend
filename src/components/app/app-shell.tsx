import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "@/components/flow/card";
import { UserIdentityHeaderCard } from "@/components/app/user-identity-header-card";
import { DemoEnvironmentBanner } from "@/components/shared/demo-environment-banner";
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
  const isProfessional = user.role === "professional";

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 md:px-10 lg:px-16">
      <header className="mx-auto grid max-w-7xl min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <DemoEnvironmentBanner tenantSlug={tenant.slug} className="mb-4" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Agendoro
          </p>
          <p className="mt-2 max-w-full text-sm leading-6 text-text-soft">
            <span className="font-semibold text-(--theme-text-primary)">
              {tenant.name}
            </span>
          </p>
          <nav
            aria-label="Navegacao principal da operacao"
            className="mt-5 flex min-w-0 flex-wrap gap-2 sm:gap-3"
          >
            {isProfessional ? (
              <NavLink
                to="/app/meu-dia"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-(--theme-border-subtle) bg-(--theme-surface-glass) text-text-soft hover:border-(--theme-border-default) hover:text-(--theme-text-primary)",
                  )
                }
              >
                Meu Dia
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/app/dashboard"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-black"
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                    )
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/app/meu-dia"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-black"
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                    )
                  }
                >
                  Meu Dia
                </NavLink>
                <NavLink
                  to="/app/professionals"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-black"
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
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
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
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
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
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
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                    )
                  }
                >
                  Slots
                </NavLink>
                <NavLink
                  to="/app/holidays"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-black"
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                    )
                  }
                >
                  Bloqueios
                </NavLink>
                <NavLink
                  to="/app/waitlist"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-black"
                        : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                    )
                  }
                >
                  Lista de Espera
                </NavLink>
              </>
            )}
            {!isProfessional ? (
              <NavLink
                to="/app/settings"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                Configuracoes
              </NavLink>
            ) : null}
            {user.role === "system-admin" && !isProfessional ? (
              <NavLink
                to="/app/api-tokens"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                API Tokens
              </NavLink>
            ) : null}
            {user.role === "system-admin" && !isProfessional ? (
              <NavLink
                to="/app/system-admin/tenants/whatsapp"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                WhatsApp
              </NavLink>
            ) : null}
            {user.role === "system-admin" && !isProfessional ? (
              <NavLink
                to="/app/system-admin/meta-whatsapp"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                Billing WhatsApp
              </NavLink>
            ) : null}
            {user.role === "system-admin" && !isProfessional ? (
              <NavLink
                to="/app/system-admin/tenants/deposit-fee"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                Sinal Online
              </NavLink>
            ) : null}
            {["admin", "system-admin"].includes(user.role) &&
            !isProfessional ? (
              <NavLink
                to="/app/meta-whatsapp"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-(--theme-border-subtle) bg-(--theme-surface-glass) text-text-soft hover:border-(--theme-border-default) hover:text-(--theme-text-primary)",
                  )
                }
              >
                Meu WhatsApp
              </NavLink>
            ) : null}
            {user.role === "system-admin" && !isProfessional ? (
              <NavLink
                to="/app/system-admin/tenants/provision"
                className={({ isActive }) =>
                  cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-black"
                      : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                  )
                }
              >
                Provisionamento
              </NavLink>
            ) : null}
          </nav>
        </div>
        <div className="min-w-0 xl:max-w-90">
          <UserIdentityHeaderCard
            name={user.name}
            isLoading={isUserIdentityLoading}
            onLogout={onLogout}
          />
        </div>
      </header>

      <main className="mx-auto mt-8 w-full max-w-7xl min-w-0">
        <Card variant="glass" padding="lg">
          {children}
        </Card>
      </main>
    </div>
  );
}
