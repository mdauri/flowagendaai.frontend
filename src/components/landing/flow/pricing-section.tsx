import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";
import { trackLandingEvent } from "@/lib/landing-analytics";

const agendoroFeatures = [
  "Até 3 profissionais",
  "Agendamentos ilimitados",
  "Clientes ilimitados",
  "Serviços ilimitados",
  "Agenda completa desktop e mobile",
  "Página pública e link próprio",
  "PWA do cliente e Meus compromissos",
  "Lembretes por push e e-mail",
];

const additionalServices = [
  "Profissional adicional: R$ 15/mês",
  "Implantação assistida: R$ 197",
  "Implantação WhatsApp: R$ 297",
];

export function PricingSection() {
  return (
    <section id="precos" className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Investimento
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
            Um plano principal, adicionais quando fizer sentido
          </h2>
          <p className="mt-4 text-base leading-7 text-text-soft">
            Comece com o Agendoro completo por R$ 97/mês. Se quiser, adicione a
            automação WhatsApp depois, sem transformar isso em requisito para
            usar a plataforma.
          </p>
          <p className="mt-2 text-sm font-semibold text-success">14 dias grátis, sem cartão.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card variant="premium" padding="lg" className="flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Agendoro
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-[var(--theme-text-primary)]">
                  R$&nbsp;97
                </span>
                <span className="mb-2 text-sm text-text-muted">/mês</span>
              </div>
              <p className="mt-4 text-sm font-bold text-success">
                R$ 970/ano — pague 10 meses e use 12
              </p>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                Para pequenos negócios que precisam de agenda organizada,
                agendamento online, lembretes e uma experiência profissional
                para o cliente.
              </p>
            </div>

            <div className="mb-8 grow space-y-3 border-t border-[var(--theme-border-subtle)] pt-6">
              {agendoroFeatures.map((item) => (
                <GlassListItem
                  key={item}
                  icon="✓"
                  label={item}
                />
              ))}
            </div>

            <Button
              as="a"
              href="/signup"
              className="w-full"
              onClick={() =>
                trackLandingEvent("landing_trial_cta_clicked", {
                  sourceSection: "pricing",
                  target: "/signup",
                  planContext: "agendoro",
                })
              }
            >
              Testar grátis por 14 dias
            </Button>
            <p className="mt-4 text-center text-xs text-text-muted">
              Sem fidelidade. Cancele quando quiser.
            </p>
          </Card>

          <div className="grid gap-6">
            <Card padding="lg" className="flex flex-col">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Adicional opcional
              </p>
              <h3 className="mt-3 text-2xl font-black text-[var(--theme-text-primary)]">
                Automação WhatsApp
              </h3>
              <p className="mt-4 text-4xl font-black text-[var(--theme-text-primary)]">
                + R$ 100/mês
              </p>
              <p className="mt-3 text-sm font-bold text-secondary">
                Agendoro + WhatsApp: R$ 197/mês
              </p>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                Adiciona automações de atendimento e lembretes pelo WhatsApp
                para negócios que querem esse canal integrado ao Agendoro.
              </p>

              <div className="mt-6 space-y-3 border-t border-[var(--theme-border-subtle)] pt-6">
                <GlassListItem icon="✓" label="Implantação WhatsApp: R$ 297" />
                <GlassListItem
                  icon="!"
                  label="Custos de mensagens cobrados pela Meta não estão incluídos."
                />
              </div>
              <Button
                as="a"
                href={
                  "https://wa.me/5512982933873?text=Quero%20conhecer%20a%20automacao%20WhatsApp%20do%20Agendoro"
                }
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  trackLandingEvent("landing_whatsapp_addon_clicked", {
                    sourceSection: "pricing",
                    target: "https://wa.me/5512982933873",
                    planContext: "whatsapp_addon",
                  })
                }
              >
                Falar sobre o adicional
              </Button>
            </Card>

            <Card variant="surface" padding="lg">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Serviços adicionais
              </p>
              <div className="mt-5 space-y-3">
                {additionalServices.map((item) => (
                  <GlassListItem key={item} icon="+" label={item} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
