import { Link } from "react-router-dom";

import {
  Button,
  CTASection,
  FeatureCard,
  GlassListItem,
  Hero,
  HowItWorks,
  Navbar,
  PainSection,
  PricingSection,
  SectionHeading,
  TestimonialCard,
} from "@/components/landing/flow";
import { Card } from "@/components/landing/flow/card";
import { compositionPatterns, semanticTokens } from "@/design-system";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const features = [
  {
    title: "Agenda inteligente",
    description:
      "Organize horários, profissionais e serviços com uma experiência simples, bonita e pronta para converter mais clientes.",
  },
  {
    title: "WhatsApp + automação",
    description:
      "Confirmações e lembretes automáticos direto no WhatsApp. Menos faltas, menos trabalho manual, mais resultado.",
  },
  {
    title: "Link de agendamento próprio",
    description:
      "Seu cliente escolhe o horário em segundos, sem precisar falar com ninguém. Tudo centralizado no Agendoro.",
  },
];

const benefits = [
  "Mais agendamentos sem aumentar a equipe",
  "Zero furo com confirmação automática pelo WhatsApp",
  "Visual profissional que transmite confiança",
  "Organização completa da sua agenda em minutos",
];

const audiences = [
  "Estética automotiva",
  "Salões de beleza",
  "Manicures e nail designers",
  "Lash designers",
  "Barbearias premium",
  "Profissionais autônomos",
];

const testimonials = [
  {
    name: "Marina S.",
    role: "Nail designer",
    text: "Antes eu perdia clientes porque esquecia de responder no WhatsApp. Agora tudo funciona no automático. Melhor investimento que fiz!",
  },
  {
    name: "Carlos R.",
    role: "Estética automotiva",
    text: "Minha agenda vivia bagunçada. Com o Agendoro, meus clientes agendam sozinhos e eu não perco mais nenhum horário.",
  },
  {
    name: "Fernanda L.",
    role: "Salão de beleza",
    text: "Em uma semana já vi diferença. Menos faltas, menos confusão e mais clientes agendando sem eu precisar fazer nada.",
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: compositionPatterns.overlay.marketingPage }}
      />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <PainSection />
        <HowItWorks />

        <section id="beneficios" className="px-6 py-18 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Benefícios"
              title="Tudo que você precisa para parar de perder clientes"
              description="Cada parte do Agendoro foi pensada para funcionar sozinha, sem você precisar configurar nada ou entender de tecnologia."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>

            <Card
              padding="lg"
              radiusSize="xl"
              className="mt-8 grid gap-4 lg:grid-cols-2"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                  Por que funciona
                </p>
                <h3 className="mt-3 text-2xl font-black text-white md:text-4xl">
                  Simples pra você, profissional pro seu cliente
                </h3>
              </div>
              <div className="grid gap-3">
                {benefits.map((benefit) => (
                  <GlassListItem
                    key={benefit}
                    icon="✓"
                    //iconSize="lg"
                    label={benefit}
                    size="feature"
                  />
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="segmentos" className="px-6 py-18 md:px-10 lg:px-16">
          <Card
            padding="lg"
            className="mx-auto max-w-7xl md:p-10"
            style={{ backdropFilter: `blur(${semanticTokens.blur.shell})` }}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Segmentos"
                title="Para qualquer negócio que vive de horário marcado"
                description="O Agendoro funciona para estética automotiva, beleza, saúde, consultórios e qualquer serviço que precise de agenda organizada."
              />
              <Button
                as="a"
                href="#precos"
                //target="_blank"
                //rel="noopener noreferrer"
              >
                Quero o Agendoro no meu negócio
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((audience) => (
                <Card
                  key={audience}
                  variant="surface"
                  radiusSize="xl"
                  className="p-6"
                >
                  <div className="text-sm text-secondary">Agendoro</div>
                  <div className="mt-2 text-xl font-bold text-white">
                    {audience}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Estrutura profissional para atrair clientes, organizar
                    horários e elevar percepção de valor.
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        <section id="depoimentos" className="px-6 py-18 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Depoimentos"
              title="Quem já usa o Agendoro conta"
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <TestimonialCard key={item.name} {...item} />
              ))}
            </div>
          </div>
        </section>
        <PricingSection />
        <CTASection />

        <footer className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 border-t border-white/10 pt-6 text-sm text-text-muted">
            <Link
              to="/politica-de-privacidade"
              className="transition hover:text-white"
            >
              Política de Privacidade
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/termos-de-uso" className="transition hover:text-white">
              Termos de Uso
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
