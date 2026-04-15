import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

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
              Pronto para automatizar?
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Fale com a gente agora e comece a receber agendamentos no
              automático
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-soft md:text-lg">
              Conta sobre o seu negócio pelo WhatsApp e em até 48 horas seu
              sistema de agendamento está no ar — configurado, testado e
              funcionando sozinho.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Button
              as="a"
              href="#precos"
              //target="_blank"
              //rel="noopener noreferrer"
            >
              Falar no WhatsApp agora
            </Button>
            <Button as="a" href="#como-funciona" variant="secondary">
              Ver como funciona
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
