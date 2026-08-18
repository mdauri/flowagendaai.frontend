import type { PropsWithChildren } from "react";
import { Card } from "@/components/flow/card";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { SectionHeading } from "@/components/flow/section-heading";

interface AuthShellProps extends PropsWithChildren {
  title?: string;
  description?: string;
  benefits?: string[];
  hideBenefitsOnMobile?: boolean;
}

const defaultBenefits = [
  "Agenda, profissionais e serviços em um só lugar.",
  "Acesso seguro para cuidar da operação do seu negócio.",
  "Experiência limpa para trabalhar com foco e confiança.",
];

export function AuthShell({
  children,
  title = "Acesse sua área profissional",
  description = "Entre para acompanhar sua agenda, organizar serviços e manter o atendimento sempre em dia.",
  benefits = defaultBenefits,
  hideBenefitsOnMobile = false,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-16">
      <div className="absolute right-6 top-6 z-10 md:right-10 lg:right-16">
        <ThemeSwitcher compact />
      </div>
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section>
          <SectionHeading
            eyebrow="Agendoro"
            title={title}
            description={description}
          />
          <div className={`${hideBenefitsOnMobile ? "hidden lg:block" : ""} mt-8 max-w-xl`}>
            <Card variant="premium" padding="lg">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Gestão simples
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-text-soft">
                {benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
        <section>{children}</section>
      </div>
    </main>
  );
}
