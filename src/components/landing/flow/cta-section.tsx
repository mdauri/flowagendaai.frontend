import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { trackLandingEvent } from "@/lib/landing-analytics";

export function CTASection() {
  return (
    <section className="px-6 pb-20 md:px-10 lg:px-16">
      <Card
        variant="premium"
        padding="lg"
        className="mx-auto max-w-7xl md:p-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              Pronto para começar?
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
              Coloque sua agenda online ainda hoje
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-soft md:text-lg">
              Crie sua conta, configure seus serviços e compartilhe seu link
              para começar a receber agendamentos sem depender de mensagens
              manuais.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Button
              as="a"
              href="/signup"
              onClick={() =>
                trackLandingEvent("landing_trial_cta_clicked", {
                  sourceSection: "final_cta",
                  target: "/signup",
                  planContext: "agendoro",
                })
              }
            >
              Começar teste grátis de 14 dias
            </Button>
            <Button as="a" href="#precos" variant="secondary">
              Ver preços
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
