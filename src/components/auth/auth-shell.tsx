import type { PropsWithChildren } from "react";
import { Card } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-16">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section>
          <SectionHeading
            eyebrow="Operacao"
            title="Entre no Agendoro"
            description="Acesse sua operacao com seguranca. O contexto do tenant e resolvido pelo backend a partir da sua autenticacao."
          />
          <div className="mt-8 max-w-xl">
            <Card variant="premium" padding="lg">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">Fluxo inicial</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-text-soft">
                <li>1. Fazer login com email e senha.</li>
                <li>2. Validar sessao em <code>/auth/me</code>.</li>
                <li>3. Carregar shell autenticado com tenant atual.</li>
              </ul>
            </Card>
          </div>
        </section>
        <section>{children}</section>
      </div>
    </main>
  );
}
