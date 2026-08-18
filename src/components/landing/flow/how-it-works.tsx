import { BellRing, Link2, Settings } from "lucide-react";
import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { semanticTokens, shadows } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const steps = [
  {
    icon: Settings,
    number: "01",
    title: "Configure seu negócio",
    description:
      "Cadastre serviços, profissionais, horários e regras de disponibilidade.",
  },
  {
    icon: Link2,
    number: "02",
    title: "Compartilhe seu link",
    description:
      "Use sua página pública para receber agendamentos sem depender de troca de mensagens.",
  },
  {
    icon: BellRing,
    number: "03",
    title: "Clientes agendam e recebem lembretes",
    description:
      "O cliente escolhe o horário, acompanha compromissos e recebe lembretes conforme sua configuração.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
            Comece em 3 passos
          </h2>
          <p className="mt-4 text-base leading-7 text-text-soft">
            Configure sua agenda, compartilhe seu link e deixe seus clientes
            escolherem horários disponíveis.
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.number}
                padding="lg"
                className="flex flex-col items-center gap-6 text-center"
                style={{
                  boxShadow: shadows.depth,
                  backdropFilter: `blur(${semanticTokens.blur.shell})`,
                }}
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(249,112,21,0.20),rgba(218,158,98,0.10))]">
                  <Icon className="h-10 w-10 text-secondary" />
                  <span className="absolute -top-3 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(249,112,21,1),rgba(218,158,98,1))] text-xs font-black text-[var(--theme-text-primary)] ">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-[var(--theme-text-primary)] md:text-xl">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-text-soft">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            as="a"
            href="#precos"
            onClick={() =>
              trackLandingEvent("landing_pricing_clicked", {
                sourceSection: "pricing",
                target: "#precos",
                planContext: "agendoro",
              })
            }
          >
            Ver preços
          </Button>
        </div>
      </div>
    </section>
  );
}
