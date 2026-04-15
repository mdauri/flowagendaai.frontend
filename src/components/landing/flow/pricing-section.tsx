import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const essentialFeatures = [
  "Link de Agendamento Profissional",
  "Agenda Completa (Desktop e Mobile)",
  "Cadastro ilimitado de serviços",
  "Gestão de Profissionais",
  "Dashboard de Faturamento",
  "Suporte via E-mail e Central",
];

const proFeatures = [
  "Tudo do Plano Essencial",
  "Robô de Atendimento WhatsApp",
  "Confirmações Automáticas",
  "Lembretes de Horário",
  "Implantação feita por nós",
  "Suporte Prioritário",
];

export function PricingSection() {
  return (
    <section id="precos" className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Investimento
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            O plano ideal para o seu momento
          </h2>
          <p className="mt-4 text-base leading-7 text-text-soft">
            Comece organizando sua agenda ou automatize seu atendimento para
            escalar seu negócio. Sem fidelidade, sem letras miúdas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Plano Essencial */}
          <Card padding="lg" className="flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Essencial
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  R$&nbsp;97
                </span>
                <span className="mb-2 text-sm text-text-muted">/ mês</span>
              </div>
              <p className="mt-4 text-sm font-bold text-success">
                Zero taxa de implantação
              </p>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                Ideal para autônomos e pequenos negócios que querem
                profissionalismo e organização.
              </p>
            </div>

            <div className="mb-8 grow space-y-3 border-t border-white/10 pt-6">
              {essentialFeatures.map((item) => (
                <GlassListItem
                  key={item}
                  icon="✓"
                  //iconSize="sm"
                  label={item}
                />
              ))}
            </div>

            <Button
              as="a"
              href={
                "https://wa.me/5512982933873?text=Quero%20o%20plano%20Start%20"
              }
              variant="secondary"
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              Começar no Essencial
            </Button>
          </Card>

          {/* Plano Pro */}
          <Card
            variant="premium"
            padding="lg"
            className="relative flex flex-col"
          >
            <div className="absolute -top-3 left-8">
              <span className="rounded-full bg-linear-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-dark shadow-(--shadow-card)">
                Mais Popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Pro (Automação)
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  R$&nbsp;197
                </span>
                <span className="mb-2 text-sm text-text-muted">/ mês</span>
              </div>
              <p className="mt-4 text-sm font-bold text-white">
                + Implantação: R$ 497 (único)
              </p>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                Ideal para negócios em crescimento que querem eliminar faltas e
                automatizar o atendimento.
              </p>
            </div>

            <div className="mb-8 grow space-y-3 border-t border-white/10 pt-6">
              {proFeatures.map((item) => (
                <GlassListItem
                  key={item}
                  icon="✓"
                  //iconSize="sm"
                  label={item}
                />
              ))}
            </div>

            <div className="space-y-3">
              <Button
                as="a"
                href={
                  "https://wa.me/5512982933873?text=Quero%20o%20plano%20Pro%20com%20automacao"
                }
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escolher Automação Pro
              </Button>
              <p className="text-center text-xs text-text-muted">
                Sem contrato de fidelidade · Cancele quando quiser
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
