import { BillingPanel } from "@/components/billing/billing-panel";
import { SectionHeading } from "@/components/flow/section-heading";
import { HelpContextualLink } from "@/components/help/help-contextual-link";

export function BillingPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Faturamento"
        title="Assinatura do Agendoro"
        description="Acompanhe o plano, cobrancas e regularizacao da mensalidade SaaS."
      />
      <HelpContextualLink href="/ajuda/plano-cobranca/entenda-seu-plano">Entenda seu plano</HelpContextualLink>
      <div className="mt-8">
        <BillingPanel />
      </div>
    </div>
  );
}
