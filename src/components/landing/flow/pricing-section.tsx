import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const includes = [
  "Configuração completa feita por nós",
  "Integração com WhatsApp e Google Calendar",
  "Automação de confirmações e lembretes",
  "Agendamento online para seus clientes",
  "Suporte para ajustes após o lançamento",
  "Sem você precisar mexer em nada",
];

export function PricingSection() {
  return (
    <section className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Investimento
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Simples, transparente e sem surpresa
          </h2>
          <p className="mt-4 text-base leading-7 text-text-soft">
            Sem contrato longo, sem taxa escondida. Você paga a configuração uma
            vez e a mensalidade enquanto quiser usar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Card instalação */}
          <Card padding="lg">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              Instalação
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black text-white">
                R$&nbsp;497
              </span>
              <span className="mb-2 text-sm text-text-muted">
                pagamento único
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-text-soft">
              Pagado uma vez para cobrir toda a configuração, integração e
              entrega do sistema pronto para usar.
            </p>

            <div className="mt-8 space-y-3">
              {includes.map((item) => (
                <GlassListItem
                  key={item}
                  icon="✓"
                  iconSize="sm"
                  label={item}
                />
              ))}
            </div>
          </Card>

          {/* Card mensalidade */}
          <Card variant="premium" padding="lg" className="relative">
            <div className="absolute -top-3 left-8">
              <span className="rounded-full bg-linear-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-dark shadow-(--shadow-card)">
                Recorrente
              </span>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              Mensalidade
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black text-white">R$&nbsp;97</span>
              <span className="mb-2 text-sm text-text-muted">/ mês</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-text-soft">
              Mantém tudo funcionando: hospedagem, automações, integrações e
              suporte para ajustes quando precisar.
            </p>

            <Card padding="sm" className="mt-8 rounded-(--radius-lg)">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                Pense assim
              </p>
              <p className="mt-3 text-sm leading-7 text-text-soft">
                Se o Agendoro te ajudar a recuperar{" "}
                <span className="font-bold text-white">2 clientes por mês</span>{" "}
                que você perderia por falta de resposta — o investimento já se
                paga no primeiro mês.
              </p>
            </Card>

            <div className="mt-8 space-y-3">
              <Button
                as="a"
                href={WHATSAPP_LINK}
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero começar — falar no WhatsApp
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
