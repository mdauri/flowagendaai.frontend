import { Search, X } from "lucide-react";
import { Input } from "@/components/flow/input";
import { Button } from "@/components/flow/button";
import { cn } from "@/lib/cn";

interface HelpSearchProps { value: string; onChange: (value: string) => void; resultCount?: number; autoFocus?: boolean; className?: string; }
export function HelpSearch({ value, onChange, resultCount, autoFocus = false, className }: HelpSearchProps) {
  return <div className={cn("relative w-full", className)}>
    <label htmlFor="help-search" className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]">Buscar na Central de Ajuda</label>
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={19} aria-hidden="true" />
      <Input id="help-search" type="search" inputSize="lg" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ex.: bloquear horário, notificação ou profissional" autoFocus={autoFocus} className="pl-12 pr-12" aria-describedby={resultCount === undefined ? undefined : "help-search-status"} />
      {value ? <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Limpar busca" onClick={() => onChange("")}><X size={17} aria-hidden="true" /></Button> : null}
    </div>
    {resultCount !== undefined ? <p id="help-search-status" className="mt-2 text-sm text-text-soft" role="status">{resultCount === 0 ? "Busca concluída: nenhum artigo encontrado." : `${resultCount} ${resultCount === 1 ? "artigo encontrado" : "artigos encontrados"}.`}</p> : null}
  </div>;
}
