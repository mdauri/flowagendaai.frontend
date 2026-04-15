import { MessageCircle, Settings, Zap } from "lucide-react";
import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { semanticTokens, shadows } from "@/design-system";
const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Escolha seu plano",
    description:
      "Decida entre organizar sua agenda manualmente ou automatizar todo o seu atendimento via WhatsApp.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configure do seu jeito",
    description:
      "Cadastre seus serviços e profissionais em minutos ou deixe que nossa equipe faça a implantação completa para você.",
  },
  {
    icon: Zap,
    number: "03",
    title: "Sua agenda roda sozinha",
    description:
      "Seus clientes agendam direto pelo seu link exclusivo, recebem confirmações e você ganha tempo para o que importa.",
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
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Simples assim — em 3 passos
          </h2>
          <p className="mt-4 text-base leading-7 text-text-soft">
            Sem configuração técnica, sem tutoriais, sem dor de cabeça. Você
            fala com a gente e a gente resolve tudo.
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
                  <span className="absolute -top-3 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(249,112,21,1),rgba(218,158,98,1))] text-xs font-black text-white ">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white md:text-xl">
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
            //target="_blank"
            //rel="noopener noreferrer"
          >
            Começar agora pelo WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
