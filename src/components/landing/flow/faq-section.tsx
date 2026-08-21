import { ChevronDown } from "lucide-react";
import { Card } from "@/components/landing/flow/card";

const questions = [
  {
    question: "Preciso de cartão de crédito para testar?",
    answer:
      "Não. O teste de 14 dias é totalmente gratuito e não exige cartão de crédito.",
  },
  {
    question: "E se eu tiver apenas 1 profissional?",
    answer:
      "Funciona perfeitamente. O plano inclui até 3 profissionais, mas você pode usar com 1, 2 ou 3.",
  },
  {
    question: "Meus clientes precisam baixar um aplicativo?",
    answer:
      "Não. O cliente agenda pelo navegador. Se quiser, pode instalar o PWA (Progressive Web App) direto na tela inicial do celular — sem ir à loja de apps.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Não há fidelidade. Você pode cancelar a qualquer momento sem multa.",
  },
  {
    question: "Os lembretes por WhatsApp têm custo extra?",
    answer:
      "O plano base inclui lembretes por push e e-mail. O add-on de WhatsApp custa +R$ 100/mês. As mensagens enviadas pelo WhatsApp têm custos cobrados pela Meta, que não estão incluídos no valor do add-on.",
  },
];

export function FAQSection() {
  return (
    <section className="px-6 py-12 md:px-10 lg:px-16">
      <Card variant="premium" padding="lg" className="mx-auto max-w-7xl md:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-5xl">
            Dúvidas frequentes
          </h2>
        </div>

        <div className="border-t border-[var(--theme-border-subtle)]">
          {questions.map(({ answer, question }) => (
            <details key={question} className="group border-b border-[var(--theme-border-subtle)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold text-[var(--theme-text-primary)] [&::-webkit-details-marker]:hidden">
                <span>{question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-secondary transition-transform group-open:rotate-180" />
              </summary>
              <p className="max-w-3xl pb-5 text-sm leading-7 text-text-soft">{answer}</p>
            </details>
          ))}
        </div>
      </Card>
    </section>
  );
}
