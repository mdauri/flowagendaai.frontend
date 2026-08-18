import { Link } from "react-router";
import { LogIn } from "lucide-react";
import { Button } from "@/components/landing/flow/button";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { trackLandingEvent } from "@/lib/landing-analytics";

const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5173";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-10 md:pt-6 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-3 py-2.5 shadow-[var(--theme-shadow-card)] backdrop-blur-xl md:px-4 md:py-3">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <Link to="/" className="flex items-center ">
            <img
              src="/agendoro-logo.png"
              alt="Agendoro"
              className="h-14 w-14 md:h-16 md:w-16"
            />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-[var(--theme-text-primary)]">
              Agend
              <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                oro
              </span>
            </p>
            <p className="text-xs text-text-muted">Agendamento inteligente</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-text-soft md:flex">
          <a href="#beneficios" className="transition hover:text-[var(--theme-text-primary)]">
            Benefícios
          </a>
          <a href="#recursos" className="transition hover:text-[var(--theme-text-primary)]">
            Recursos
          </a>
          <a href="#precos" className="transition hover:text-[var(--theme-text-primary)]">
            Preços
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <Button
            variant="ghost"
            size="sm"
            as="a"
            href={`${FRONTEND_URL}/login`}
            aria-label="Entrar no sistema"
            className="hidden md:inline-flex"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </Button>
          <Button
            size="sm"
            as="a"
            href="/signup"
            onClick={() =>
              trackLandingEvent("landing_trial_cta_clicked", {
                sourceSection: "navbar",
                target: "/signup",
                planContext: "agendoro",
              })
            }
            className="hidden sm:inline-flex"
          >
            Testar grátis
          </Button>
        </div>
      </div>
    </header>
  );
}
