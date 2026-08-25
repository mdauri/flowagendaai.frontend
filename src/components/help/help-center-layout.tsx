import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { BookOpen, LogIn } from "lucide-react";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { cn } from "@/lib/cn";

export function HelpCenterLayout({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className="min-h-screen bg-(--bg-base) px-4 py-4 sm:px-6 md:px-10 lg:px-16">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-[var(--theme-border-subtle)] pb-4">
      <Link to="/ajuda" className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <BookOpen className="shrink-0 text-primary" size={24} aria-hidden="true" /><span className="truncate text-base font-black text-[var(--theme-text-primary)]">Central de Ajuda</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2"><ThemeSwitcher compact /><Link to="/" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-text-soft hover:text-[var(--theme-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex">Agendoro</Link><Link to="/login" aria-label="Entrar no Agendoro" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--theme-border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--theme-text-primary)] hover:border-[var(--theme-border-default)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><LogIn size={15} aria-hidden="true" /><span className="hidden sm:inline">Entrar</span></Link></div>
    </header>
    <main className={cn("mx-auto w-full max-w-7xl", className)}>{children}</main>
    <footer className="mx-auto mt-16 max-w-7xl border-t border-[var(--theme-border-subtle)] py-6 text-sm text-text-soft"><p>Central de Ajuda do Agendoro</p></footer>
  </div>;
}
