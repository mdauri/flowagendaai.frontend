import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { GlassListItem } from "@/components/landing/flow/glass-list-item";
import { semanticTokens } from "@/design-system";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const pains = [
  {
    icon: "✗",
    problem: "Clientes desistindo",
    description:
      "Mensagem sem resposta no WhatsApp é cliente marcando horário com o concorrente.",
  },
  {
    icon: "✗",
    problem: "Horários duplicados",
    description:
      "Dois clientes no mesmo horário. Resultado: confusão, cancelamento e reputação em risco.",
  },
  {
    icon: "✗",
    problem: "Agenda bagunçada",
    description:
      "Sem controle dos horários você perde tempo, perde dinheiro e perde o fio da meada todo dia.",
  },
];

const solutions = [
  {
    icon: "✓",
    label: "Seus clientes agendam sozinhos, sem precisar de você",
  },
  {
    icon: "✓",
    label: "Confirmações automáticas pelo WhatsApp — zero furo",
  },
  {
    icon: "✓",
    label: "Google Calendar sincronizado em tempo real",
  },
  {
    icon: "✓",
    label: "Configuração completa em até 48 horas",
  },
];

export function PainSection() {
  return (
    <section className="px-6 py-18 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Lado esquerdo — dores */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Sem controle da agenda, você perde clientes todo dia
            </h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              Você já passou por isso — ou passa agora. E sabe que não é falta
              de competência, é falta de sistema.
            </p>

            <div className="mt-8 space-y-4">
              {pains.map((pain) => (
                <div
                  key={pain.problem}
                  className="flex gap-4 rounded-(--radius-lg) border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black"
                  style={{
                    backgroundColor: semanticTokens.feedback.danger.background,
                    color: semanticTokens.feedback.danger.text,
                  }}
                >
                  {pain.icon}
                </div>
                  <div>
                    <p className="font-bold text-white">{pain.problem}</p>
                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      {pain.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lado direito — solução */}
          <Card variant="premium" padding="lg" className="md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              A solução
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              Uma agenda que funciona sozinha. Nós configuramos tudo pra você.
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-soft">
              Fale com a gente, conta sobre o seu negócio e em até 48 horas seu
              sistema de agendamento está no ar — do zero, sem você precisar
              mexer em nada.
            </p>

            <div className="mt-7 space-y-3">
              {solutions.map((s) => (
                <GlassListItem
                  key={s.label}
                  icon={s.icon}
                  label={s.label}
                />
              ))}
            </div>

            <div className="mt-8">
              <Button
                as="a"
                href={WHATSAPP_LINK}
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar no WhatsApp agora
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
