import { BillingPanel } from "@/components/billing/billing-panel";
import { SectionHeading } from "@/components/flow/section-heading";

export function BillingPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Faturamento"
        title="Assinatura do Agendoro"
        description="Acompanhe o plano, cobrancas e regularizacao da mensalidade SaaS."
      />
      <div className="mt-8">
        <BillingPanel />
      </div>
    </div>
  );
}
