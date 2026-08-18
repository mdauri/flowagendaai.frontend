import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";
import { semanticTokens } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const pains = [
  {
    icon: "✗",
    problem: "Clientes esperando resposta",
    description:
      "Enquanto você atende, novas mensagens podem ficar para depois e o cliente procura outro horário.",
  },
  {
    icon: "✗",
    problem: "Horários em conflito",
    description:
      "Sem uma agenda centralizada, fica mais fácil marcar duas coisas no mesmo horário.",
  },
  {
    icon: "✗",
    problem: "Faltas sem lembrete",
    description:
      "Sem avisos automáticos, o cliente pode esquecer o compromisso e deixar buracos na rotina.",
  },
];

const solutions = [
  {
    icon: "✓",
    label: "Link próprio para agendamento online",
  },
  {
    icon: "✓",
    label: "Agenda completa no desktop e no celular",
  },
  {
    icon: "✓",
    label: "Lembretes automáticos por push e e-mail",
  },
  {
    icon: "✓",
    label: "PWA do cliente com área Meus compromissos",
  },
];

export function PainSection() {
  return (
    <section className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Lado esquerdo — dores */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
              Agenda manual custa tempo e cria buracos na rotina
            </h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              Quando tudo depende de mensagem, caderno ou planilha, clientes
              esperam resposta, horários se cruzam e faltas passam
              despercebidas.
            </p>

            <div className="mt-8 space-y-4">
              {pains.map((pain) => (
                <div
                  key={pain.problem}
                  className="flex gap-4 rounded-(--radius-lg) border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5 backdrop-blur-xl"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black"
                    style={{
                      backgroundColor:
                        semanticTokens.feedback.danger.background,
                      color: semanticTokens.feedback.danger.text,
                    }}
                  >
                    {pain.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--theme-text-primary)]">{pain.problem}</p>
                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      {pain.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lado direito — solução */}
          <Card variant="premium" padding="lg" className="md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              A solução
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-3xl">
              Uma agenda online para organizar o dia e deixar o cliente agendar sozinho
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-soft">
              O Agendoro centraliza horários, profissionais, serviços,
              clientes, agendamento online e lembretes em uma experiência
              simples para você e para seu cliente.
            </p>

            <div className="mt-7 space-y-3">
              {solutions.map((s) => (
                <GlassListItem key={s.label} icon={s.icon} label={s.label} />
              ))}
            </div>

            <div className="mt-8">
              <Button
                as="a"
                href="#precos"
                className="w-full"
                onClick={() =>
                  trackLandingEvent("landing_pricing_clicked", {
                    sourceSection: "pricing",
                    target: "#precos",
                    planContext: "agendoro",
                  })
                }
              >
                Ver planos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
