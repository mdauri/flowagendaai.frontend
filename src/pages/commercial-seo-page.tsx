import { useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { Navbar } from "@/components/landing/flow/navbar";
import { trackLandingEvent } from "@/lib/landing-analytics";
import pages from "@/content/commercial-seo-pages.json";

type PageKey = keyof typeof pages;
type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  eyebrow: string;
  problems?: string[];
  steps?: string[];
  features?: string[];
  segments?: string[];
  examples?: string[];
  solution?: string[];
  usage?: string[];
  links?: { label: string; to: string }[];
  demo?: { label: string; to: string };
  faqs?: { q: string; a: string }[];
};

function Action({ page, target, children, secondary = false }: { page: SeoPage; target: string; children: React.ReactNode; secondary?: boolean }) {
  return <Button as="a" href={target} variant={secondary ? "secondary" : "primary"} onClick={() => { trackLandingEvent(target === page.demo?.to ? "landing_demo_clicked" : secondary ? "landing_secondary_cta_clicked" : "landing_trial_cta_clicked", { sourceSection: secondary ? "secondary_cta" : "hero", target, landingPath: page.path }); if (target === "/signup") trackLandingEvent("landing_signup_started", { sourceSection: secondary ? "secondary_cta" : "hero", target, landingPath: page.path }); }}>{children}</Button>;
}

function ListSection({ title, items, eyebrow }: { title: string; items: string[]; eyebrow: string }) {
  return <section className="px-6 py-12 md:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">{eyebrow}</p><h2 className="mt-3 text-3xl font-black text-[var(--theme-text-primary)] md:text-5xl">{title}</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Card key={item} variant="surface" padding="md" radiusSize="xl"><p className="font-semibold leading-7 text-[var(--theme-text-primary)]">{item}</p></Card>)}</div></div></section>;
}

function Pricing({ page }: { page: SeoPage }) {
  return <section id="precos" className="px-6 py-12 md:px-10 lg:px-16"><Card variant="premium" padding="lg" className="mx-auto max-w-7xl md:p-10"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">Preços</p><h2 className="mt-3 text-3xl font-black text-[var(--theme-text-primary)] md:text-5xl">Comece com 14 dias grátis, sem cartão</h2><div className="mt-8 grid gap-6 md:grid-cols-2"><Card variant="surface" padding="lg"><p className="text-4xl font-black text-[var(--theme-text-primary)]">R$ 97<span className="text-base font-semibold text-text-soft">/mês</span></p><p className="mt-2 text-sm text-text-soft">R$ 970/ano · até 3 profissionais</p><p className="mt-4 text-sm leading-7 text-text-soft">Profissional adicional: R$ 15/mês. Automação WhatsApp: adicional de R$ 100/mês; custos de mensagens da Meta não estão incluídos.</p><Action page={page} target="/signup">{page.path === "/sistema-agendamento-online" ? "Testar grátis por 14 dias" : "Começar meu teste grátis"}</Action></Card><Card variant="surface" padding="lg"><h3 className="text-xl font-black text-[var(--theme-text-primary)]">O que acontece no teste?</h3><p className="mt-3 text-sm leading-7 text-text-soft">Configure profissionais, serviços, durações e horários. Publique o link e faça seu primeiro agendamento real antes de decidir como continuar.</p><Link className="mt-5 inline-block font-semibold text-secondary" to="/ajuda/primeiros-passos/agendamento-de-teste">Ver orientação na Central de Ajuda →</Link></Card></div></Card></section>;
}

function FAQ({ page }: { page: SeoPage }) {
  return <section className="px-6 py-12 md:px-10 lg:px-16"><Card variant="premium" padding="lg" className="mx-auto max-w-7xl md:p-10"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">FAQ</p><h2 className="mt-3 text-3xl font-black text-[var(--theme-text-primary)] md:text-5xl">Dúvidas frequentes</h2><div className="mt-8 border-t border-[var(--theme-border-subtle)]">{(page.faqs ?? []).map((faq) => <details key={faq.q} className="border-b border-[var(--theme-border-subtle)]"><summary className="cursor-pointer py-5 font-bold text-[var(--theme-text-primary)]">{faq.q}</summary><p className="max-w-3xl pb-5 text-sm leading-7 text-text-soft">{faq.a}</p></details>)}</div></Card></section>;
}

export function CommercialSeoPage({ pageKey }: { pageKey: PageKey }) {
  const page = pages[pageKey] as SeoPage;
  const isSystem = pageKey === "system";
  useEffect(() => { trackLandingEvent("landing_page_viewed", { sourceSection: "page_view", target: page.path, landingPath: page.path }); }, [page.path]);
  return <main className="min-h-screen overflow-x-hidden bg-background text-[var(--theme-text-primary)]"><div className="relative z-10"><Navbar /><div className="mx-auto max-w-7xl px-6 pt-8 md:px-10 lg:px-16"><nav aria-label="Breadcrumb" className="text-sm text-text-muted"><Link to="/">Agendoro</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">{page.eyebrow}</span></nav></div><section className="px-6 py-14 md:px-10 md:py-20 lg:px-16"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">{page.eyebrow}</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight text-[var(--theme-text-primary)] md:text-6xl">{page.h1}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-text-soft">{page.intro}</p><p className="mt-4 font-semibold text-success">14 dias grátis, sem cartão.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><Action page={page} target="/signup">{isSystem ? "Testar grátis por 14 dias" : pageKey === "automotive" ? "Criar minha agenda de estética automotiva" : "Organizar meu salão"}</Action><Action page={page} target={page.demo?.to ?? "#como-funciona"} secondary>{page.demo ? "Ver demonstração" : "Ver como funciona"}</Action></div></div><Card variant="premium" padding="lg"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">Agenda organizada</p><p className="mt-4 text-2xl font-black text-[var(--theme-text-primary)]">Serviço, profissional e horário no mesmo fluxo.</p><p className="mt-4 leading-7 text-text-soft">Compartilhe uma página pública e deixe o cliente escolher um horário disponível conforme sua configuração.</p></Card></div></section><section id="como-funciona" className="px-6 py-12 md:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">Como funciona</p><h2 className="mt-3 text-3xl font-black text-[var(--theme-text-primary)] md:text-5xl">Organize o caminho até o agendamento</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(page.steps ?? ["Cadastre serviços e duração","Organize profissionais","Publique seu link","Receba agendamentos"]).map((step, index) => <Card key={step} variant="surface" padding="md" radiusSize="xl"><span className="text-sm font-black text-secondary">0{index + 1}</span><h3 className="mt-4 font-bold">{step}</h3></Card>)}</div></div></section>{page.problems && <ListSection eyebrow="Problemas" title={isSystem ? "Menos improviso na rotina" : "Dores que uma agenda específica ajuda a organizar"} items={page.problems} />}{page.examples && <ListSection eyebrow="Exemplos de serviços" title="Cadastre cada serviço com o contexto do seu negócio" items={page.examples} />}{page.solution && <ListSection eyebrow="Solução" title="Uma agenda que respeita sua operação" items={page.solution} />}{page.features && <ListSection eyebrow="Funcionalidades" title="Recursos para organizar equipe e clientes" items={page.features} />}{page.usage && <ListSection eyebrow="Uso prático" title="Leve o link para os lugares onde suas clientes já estão" items={page.usage} />}{page.segments && <ListSection eyebrow="Segmentos atendidos" title="Para negócios com hora marcada" items={page.segments} />}<section className="px-6 py-12 md:px-10 lg:px-16"><Card variant="surface" padding="lg" className="mx-auto max-w-7xl"><h2 className="text-3xl font-black text-[var(--theme-text-primary)]">Veja também</h2><div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">{(page.links ?? []).map((link) => <Link key={link.to} to={link.to} className="font-semibold text-secondary">{link.label} →</Link>)}</div></Card></section><Pricing page={page} /><FAQ page={page} /><section className="px-6 pb-20 md:px-10 lg:px-16"><Card variant="premium" padding="lg" className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="text-3xl font-black md:text-5xl">Pronto para organizar sua agenda?</h2><p className="mt-3 text-text-soft">Teste por 14 dias, sem cartão, e configure seu primeiro fluxo.</p></div><Action page={page} target="/signup">Começar meu teste grátis</Action></Card></section></div></main>;
}
