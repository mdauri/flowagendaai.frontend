import { Link } from "react-router";

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
  FAQSection,
  SectionHeading,
} from "@/components/landing/flow";
import { Card } from "@/components/landing/flow/card";
import { compositionPatterns, semanticTokens } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const features = [
  {
    title: "Reduza faltas com lembretes automáticos",
    description:
      "Envie lembretes por push, e-mail e canais configurados para diminuir esquecimentos e manter a agenda cheia.",
  },
  {
    title: "Economize tempo no WhatsApp",
    description:
      "Seu cliente acessa o link, escolhe serviço, profissional e horário sem você intermediar cada conversa.",
  },
  {
    title: "Evite conflitos de agenda",
    description:
      "Serviços, profissionais, bloqueios e horários centralizados para reduzir marcações erradas e retrabalho.",
  },
];

const benefits = [
  "Mais horários preenchidos com agendamento 24h",
  "Menos mensagens pendentes no dia a dia",
  "Equipe mais independente para atender",
  "Cliente acompanha tudo pelo celular",
];

const audiences = [
  "Estética automotiva",
  "Salões de beleza",
  "Manicures e nail designers",
  "Lash designers",
  "Barbearias premium",
  "Profissionais autônomos",
];

const audienceDescriptions: Record<string, string> = {
  "Estética automotiva":
    "Vitrificação, polimento e higienização com tempo correto na agenda. Cliente agenda pelo link e recebe lembrete antes de chegar.",
  "Salões de beleza":
    "Corte, coloração e tratamentos em uma agenda única. Profissionais veem a fila do dia no celular, sem sobreposição.",
  "Manicures e nail designers":
    "Alongamento, banho de gel e manutenção com tempo certo entre atendimentos. Menos 'esqueci', mais cadeiras cheias.",
  "Lash designers":
    "Classic, volume e híbrido com bloqueios automáticos entre atendimentos. Agenda que respeita o tempo de cada técnica.",
  "Barbearias premium":
    "Corte, barba e combos com duração precisa. Cliente escolhe o barbeiro e o horário pelo link próprio — até de madrugada.",
  "Profissionais autônomos":
    "Uma agenda que trabalha quando você descansa. Clientes agendam 24h e recebem lembretes automáticos.",
};

const resourceModules = [
  {
    title: "Controle a agenda da equipe",
    items: [
      "Agenda desktop e mobile",
      "Gestão de profissionais",
      "Gestão de serviços",
      "Bloqueios e indisponibilidades",
    ],
  },
  {
    title: "Receba agendamentos online",
    items: [
      "Página pública de agendamento",
      "Link próprio",
      "Catálogo de serviços",
      "Clientes organizados",
    ],
  },
  {
    title: "Dê autonomia ao cliente",
    items: [
      "PWA do cliente",
      "Instalação do app",
      "Meus compromissos",
      "Notificações push",
    ],
  },
  {
    title: "Automatize lembretes e retornos",
    items: [
      "Lembretes por push",
      "Lembretes por e-mail",
      "Múltiplos lembretes configuráveis",
      "Lista de espera e lembrete de retorno",
    ],
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-[var(--theme-text-primary)]">
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
              title="Ganhe tempo na operação e reduza faltas sem depender de conversa manual"
              description="Menos tempo respondendo, mais clareza para a equipe e uma experiência profissional para quem agenda."
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
                <h3 className="mt-3 text-2xl font-black text-[var(--theme-text-primary)] md:text-4xl">
                  O que muda no seu dia com o Agendoro
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

        <section id="recursos" className="px-6 py-18 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Recursos"
              title="Tudo que você precisa para agendar, lembrar e organizar clientes"
              description="O Agendoro reúne operação, agendamento online, experiência do cliente e lembretes em uma plataforma única."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {resourceModules.map((module) => (
                <Card
                  key={module.title}
                  variant="surface"
                  padding="lg"
                  className="h-full"
                >
                  <h3 className="text-xl font-black text-[var(--theme-text-primary)]">
                    {module.title}
                  </h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {module.items.map((item) => (
                      <GlassListItem key={item} icon="✓" label={item} />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
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
                title="Feito para quem vive de horário marcado"
                description="Estética, beleza, saúde, consultórios e serviços locais ganham uma agenda mais previsível."
              />
              <Button
                as="a"
                href="#precos"
                className="w-full sm:w-auto"
                onClick={() =>
                  trackLandingEvent("landing_pricing_clicked", {
                    sourceSection: "pricing",
                    target: "#precos",
                    planContext: "agendoro",
                  })
                }
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
                  <div className="mt-2 text-xl font-bold text-[var(--theme-text-primary)]">
                    {audience}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {audienceDescriptions[audience]}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </section>
        <PricingSection />
        <FAQSection />
        <CTASection />

        <footer className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 border-t border-[var(--theme-border-subtle)] pt-6 text-sm text-text-muted">
            <Link
              to="/politica-de-privacidade"
              className="transition hover:text-[var(--theme-text-primary)]"
            >
              Política de Privacidade
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/termos-de-uso" className="transition hover:text-[var(--theme-text-primary)]">
              Termos de Uso
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
