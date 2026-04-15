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
    label: "Link de agendamento profissional e personalizado",
  },
  {
    icon: "✓",
    label: "Comece a organizar hoje mesmo ou deixe que nós automatizamos",
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
              Agenda bagunçada é dinheiro saindo pelo ralo
            </h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              O custo de um esquecimento ou de uma mensagem não respondida é
              mais alto do que você imagina. Não é falta de competência, é falta
              de sistema.
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
                      backgroundColor:
                        semanticTokens.feedback.danger.background,
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
              Organizamos seu negócio ou automatizamos seu crescimento.
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-soft">
              Tenha controle total da sua agenda por R$ 97/mês, com link de
              agendamento próprio. Quando estiver pronto, evolua para a
              automação completa com robô de WhatsApp.
            </p>

            <div className="mt-7 space-y-3">
              {solutions.map((s) => (
                <GlassListItem key={s.label} icon={s.icon} label={s.label} />
              ))}
            </div>

            <div className="mt-8">
              <Button as="a" href="#precos" className="w-full">
                Escolher meu plano agora
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
