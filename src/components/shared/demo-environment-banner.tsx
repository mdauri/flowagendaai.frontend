import { Link } from "react-router";
import { trackFirstPartyEvent } from "@/lib/first-party-analytics";
import { FeedbackBanner } from "@/components/shared/feedback-banner";

interface DemoEnvironmentBannerProps {
  tenantSlug?: string | null;
  className?: string;
}

export function DemoEnvironmentBanner({ tenantSlug, className }: DemoEnvironmentBannerProps) {
  const isBarbershop = tenantSlug === "barbearia-dom-pedro";
  if (isBarbershop) {
    return <div className={className}>
      <FeedbackBanner title="Barbearia de demonstração" description="Dados fictícios. Experimente o agendamento sem usar dados de clientes reais." tone="info" />
      <p className="mt-3 text-sm text-text-soft">Seu cliente escolhe serviço, profissional, dia e horário sozinho.</p>
      <Link to="/signup" className="mt-2 inline-flex min-h-11 items-center font-semibold text-secondary underline" onClick={() => trackFirstPartyEvent({ eventName: "cta_click" })}>Criar a agenda da minha barbearia — 14 dias grátis, sem cartão</Link>
    </div>;
  }
  if (tenantSlug !== "demo") {
    return null;
  }

  return (
    <FeedbackBanner
      title="⚠ Ambiente de Demonstração"
      description="Os dados podem ser restaurados automaticamente."
      tone="warning"
      className={className}
    />
  );
}
