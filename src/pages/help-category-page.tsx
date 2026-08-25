import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { HelpCenterLayout } from "@/components/help/help-center-layout";
import { HelpBreadcrumbs } from "@/components/help/help-breadcrumbs";
import { HelpArticleList } from "@/components/help/help-article-list";
import { Card } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import { helpCategoryBySlug } from "@/help/content";
import { articlesByCategory } from "@/help/search";
import type { HelpCategorySlug } from "@/help/types";
import { setHelpSeo } from "@/help/seo";
export function HelpCategoryPage() { const { categorySlug } = useParams(); const category = categorySlug ? helpCategoryBySlug.get(categorySlug as HelpCategorySlug) : undefined; useEffect(() => { if (category && categorySlug) setHelpSeo({ title: `${category.title} | Central de Ajuda Agendoro`, description: category.description, path: `/ajuda/${categorySlug}` }); }, [category, categorySlug]); if (!category || !categorySlug) return <HelpNotFoundInline />; return <HelpCenterLayout><div className="py-8 md:py-12"><HelpBreadcrumbs items={[{ label: category.title }]} /><header className="mt-8 max-w-3xl"><h1 className="text-4xl font-black tracking-tight text-[var(--theme-text-primary)]">{category.title}</h1><p className="mt-3 text-base leading-7 text-text-soft">{category.description}</p></header><Card variant="glass" padding="md" className="mt-8 max-w-3xl"><HelpArticleList articles={articlesByCategory(categorySlug)} /></Card><Link to="/ajuda" className="mt-6 inline-block text-sm font-semibold text-primary underline underline-offset-4">Voltar para a Central</Link></div></HelpCenterLayout>; }
function HelpNotFoundInline() { return <HelpCenterLayout><div className="py-16"><PageState title="Não encontramos esta página." description="A categoria pode ter sido removida ou o endereço está incorreto." actionLabel="Voltar para a Central" actionHref="/ajuda" /></div></HelpCenterLayout>; }
