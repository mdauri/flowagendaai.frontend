import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function HelpBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav aria-label="Navegação da Central de Ajuda" className="flex min-w-0 flex-wrap items-center gap-1 text-sm text-text-soft">
    <Link to="/ajuda" className="rounded px-1 py-1 hover:text-[var(--theme-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Central de Ajuda</Link>
    {items.map((item) => <span key={`${item.label}-${item.href ?? "current"}`} className="inline-flex min-w-0 items-center gap-1"><ChevronRight size={14} aria-hidden="true" /><span className={cn("truncate", item.href && "hover:text-[var(--theme-text-primary)]")}>{item.href ? <Link to={item.href} className="rounded py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{item.label}</Link> : item.label}</span></span>)}
  </nav>;
}
