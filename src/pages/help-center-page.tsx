import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { HelpCenterLayout } from "@/components/help/help-center-layout";
import { HelpSearch } from "@/components/help/help-search";
import { HelpCategoryList } from "@/components/help/help-category-list";
import { HelpArticleList } from "@/components/help/help-article-list";
import { Card } from "@/components/flow/card";
import { helpArticles, helpCategories } from "@/help/content";
import { searchHelpArticles } from "@/help/search";
import { trackHelpEvent } from "@/components/help/help-analytics";
import { setHelpSeo } from "@/help/seo";

const featuredSlugs = ["configurar-empresa", "configurar-horarios", "primeiro-profissional", "publicar-agenda"];
export function HelpCenterPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const results = useMemo(() => searchHelpArticles(query), [query]);
  useEffect(() => { setHelpSeo({ title: query ? "Busca | Central de Ajuda Agendoro" : "Central de Ajuda | Agendoro", description: "Encontre instruções simples para configurar e usar sua agenda no Agendoro.", path: "/ajuda" }); }, [query]);
  useEffect(() => { trackHelpEvent("help_center_opened", { source: "help_home" }); }, []);
  function updateQuery(value: string) { setQuery(value); const next = new URLSearchParams(params); if (value.trim()) next.set("q", value); else next.delete("q"); setParams(next, { replace: true }); if (value.trim()) trackHelpEvent("help_search", { source: "help_home", resultCount: searchHelpArticles(value).length, term: value.trim().slice(0, 80) }); }
  const featured = featuredSlugs.map((slug) => helpArticles.find((article) => article.slug === slug)).filter((article): article is typeof helpArticles[number] => Boolean(article));
  return <HelpCenterLayout>
    <section className="mx-auto max-w-3xl py-12 text-center md:py-16"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">Agendoro</p><h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--theme-text-primary)] md:text-6xl">Como podemos ajudar?</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-soft">Encontre instruções simples para configurar e usar sua agenda.</p><div className="mt-8 text-left"><HelpSearch value={query} onChange={updateQuery} resultCount={query.trim() ? results.length : undefined} autoFocus={false} /></div></section>
    {query.trim() ? <section className="mx-auto max-w-3xl" aria-labelledby="help-results-title"><h2 id="help-results-title" className="text-2xl font-black text-[var(--theme-text-primary)]">Resultados da busca</h2>{results.length ? <Card variant="glass" padding="md" className="mt-4"><HelpArticleList articles={results} /></Card> : <Card variant="glass" padding="lg" className="mt-4"><p className="font-bold text-[var(--theme-text-primary)]">Não encontramos nenhum artigo para essa busca.</p><p className="mt-2 text-sm leading-6 text-text-soft">Tente mudar os termos ou navegue pelas categorias.</p><Link to="/ajuda" onClick={() => updateQuery("")} className="mt-4 inline-block font-semibold text-primary underline underline-offset-4">Ver categorias</Link></Card>}</section> : <>
      <section className="mx-auto max-w-5xl" aria-labelledby="help-start-title"><div className="flex items-end justify-between gap-4"><h2 id="help-start-title" className="text-2xl font-black text-[var(--theme-text-primary)]">Comece por aqui</h2><Link to="/ajuda/primeiros-passos" className="hidden text-sm font-semibold text-primary hover:text-[var(--theme-text-primary)] sm:inline">Ver todos</Link></div><Card variant="glass" padding="md" className="mt-4"><HelpArticleList articles={featured} /></Card></section>
      <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="help-categories-title"><h2 id="help-categories-title" className="text-2xl font-black text-[var(--theme-text-primary)]">Categorias</h2><div className="mt-4"><HelpCategoryList categories={helpCategories} /></div></section>
    </>}
  </HelpCenterLayout>;
}
