import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";
import { semanticTokens } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const pains = [
  {
    icon: "✗",
    problem: "Faltas deixam dinheiro na mesa",
    description:
      "Sem lembretes automáticos, o cliente esquece e o horário fica vazio. Uma falta por semana já é mais de R$ 300 no final do mês.",
  },
  {
    icon: "✗",
    problem: "Conflitos viram retrabalho",
    description:
      "Horários duplicados, bloqueios esquecidos e alterações manuais bagunçam a rotina da equipe.",
  },
  {
    icon: "✗",
    problem: "Cliente demora, você perde oportunidade",
    description:
      "Quando a resposta depende de mensagem, o cliente pode desistir ou procurar outro profissional.",
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
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <Card variant="premium" padding="lg" className="flex h-full flex-col md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
              Agenda manual faz você perder tempo, clientes e horários
            </h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              Quando tudo depende de mensagem, caderno ou planilha, o negócio
              para quando você para.
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
            <a href="#solucao" className="mt-6 inline-block text-sm font-semibold text-secondary transition hover:text-[var(--theme-text-primary)]">
              Veja como o Agendoro resolve isso →
            </a>
          </Card>

          <Card id="solucao" variant="premium" padding="lg" className="flex h-full flex-col md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              A solução
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-3xl">
              Sua agenda organizada em minutos. Seu cliente agendando sozinho em segundos.
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-soft">
              O Agendoro centraliza horários, profissionais, serviços, clientes,
              agendamento online e lembretes em uma experiência simples.
            </p>

            <div className="mt-7 space-y-3">
              {solutions.map((s) => (
                <GlassListItem key={s.label} icon={s.icon} label={s.label} />
              ))}
            </div>

            <div className="mt-8 lg:mt-auto lg:pt-8">
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
              Ver planos e preços →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
