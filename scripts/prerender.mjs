import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const siteUrl = "https://agenda.dauri.com.br";
const imageUrl = `${siteUrl}/agendoro-logo.png`;

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const escapeJson = (value) => JSON.stringify(value).replaceAll("</", "<\\/");

const content = await readFile(join(root, "src/help/content.ts"), "utf8");
const commercial = JSON.parse(await readFile(join(root, "src/content/commercial-seo-pages.json"), "utf8"));
const categories = [...content.matchAll(/\{ slug: "([^"]+)", title: "([^"]+)", description: "([^"]+)"/g)]
  .map(([, slug, title, description]) => ({ slug, title, description }));
const articles = [...content.matchAll(/article\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"/g)]
  .map(([, categorySlug, slug, title, description]) => ({ categorySlug, slug, title, description }));

const pages = [
  {
    path: "/",
    title: "Agendoro | Sistema de agendamento online para pequenos negócios",
    description: "Organize agenda, profissionais, serviços, clientes e lembretes em um sistema de agendamento online para pequenos negócios.",
    h1: "A agenda do seu negócio, organizada de verdade",
    text: "O Agendoro reúne agenda, profissionais, serviços, clientes e agendamentos online para pequenos negócios.",
    type: "website",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "Organization", name: "Agendoro", url: siteUrl, logo: imageUrl },
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Agendoro", applicationCategory: "BusinessApplication", operatingSystem: "Web", url: siteUrl, description: "Sistema de agendamento online para pequenos negócios." },
      { "@context": "https://schema.org", "@type": "WebSite", name: "Agendoro", url: siteUrl },
    ],
  },
  {
    path: "/ajuda",
    title: "Central de Ajuda | Agendoro",
    description: "Encontre instruções simples para configurar e usar sua agenda no Agendoro.",
    h1: "Como podemos ajudar?",
    text: "Encontre instruções para configurar e usar sua agenda, equipe, serviços, clientes e agendamentos.",
    type: "website",
    jsonLd: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Agendoro", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Central de Ajuda", item: `${siteUrl}/ajuda` }] }],
  },
  { path: "/termos-de-uso", title: "Termos de Uso | Agendoro", description: "Consulte os Termos de Uso do Agendoro e as regras aplicáveis ao uso da plataforma.", h1: "Termos de Uso do Agendoro", text: "Conheça as regras de uso, responsabilidades, escopo e condições da plataforma Agendoro.", type: "article" },
  { path: "/politica-de-privacidade", title: "Política de Privacidade | Agendoro", description: "Saiba como o Agendoro trata dados pessoais e dados operacionais relacionados à plataforma.", h1: "Política de Privacidade do Agendoro", text: "Entenda os dados tratados, finalidades, segurança, retenção e direitos do titular.", type: "article" },
];

for (const category of categories) {
  pages.push({ path: `/ajuda/${category.slug}`, title: `${category.title} | Central de Ajuda Agendoro`, description: category.description, h1: category.title, text: category.description, type: "website", jsonLd: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Agendoro", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Central de Ajuda", item: `${siteUrl}/ajuda` }, { "@type": "ListItem", position: 3, name: category.title, item: `${siteUrl}/ajuda/${category.slug}` }] }] });
}
for (const article of articles) {
  const path = `/ajuda/${article.categorySlug}/${article.slug}`;
  pages.push({ path, title: `${article.title} | Central de Ajuda Agendoro`, description: article.description, h1: article.title, text: `${article.description} Consulte os passos e orientações do Agendoro para este assunto.`, type: "article", jsonLd: [{ "@context": "https://schema.org", "@type": "TechArticle", headline: article.title, description: article.description, url: `${siteUrl}${path}`, mainEntityOfPage: `${siteUrl}${path}`, publisher: { "@type": "Organization", name: "Agendoro", url: siteUrl } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Agendoro", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Central de Ajuda", item: `${siteUrl}/ajuda` }, { "@type": "ListItem", position: 3, name: article.title, item: `${siteUrl}${path}` }] }] });
}

const list = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
const commercialBody = (page) => {
  const steps = page.steps ?? ["Cadastre serviços e duração", "Organize profissionais", "Publique seu link", "Receba agendamentos"];
  const blocks = [
    `<nav aria-label="Breadcrumb"><a href="/">Agendoro</a> / <span aria-current="page">${escapeHtml(page.eyebrow)}</span></nav>`,
    `<header><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p><p><strong>14 dias grátis, sem cartão.</strong></p><p><a href="/signup">${page.path === "/sistema-agendamento-online" ? "Testar grátis por 14 dias" : page.path.includes("estetica") ? "Criar minha agenda de estética automotiva" : "Organizar meu salão"}</a> <a href="${page.demo?.to ?? "#como-funciona"}">${page.demo ? "Ver demonstração" : "Ver como funciona"}</a></p></header>`,
    `<section id="como-funciona"><h2>Como funciona</h2><ol>${list(steps)}</ol></section>`,
  ];
  if (page.problems) blocks.push(`<section><h2>${page.path === "/sistema-agendamento-online" ? "Menos improviso na rotina" : "Dores que uma agenda específica ajuda a organizar"}</h2><ul>${list(page.problems)}</ul></section>`);
  if (page.examples) blocks.push(`<section><h2>Exemplos de serviços</h2><ul>${list(page.examples)}</ul></section>`);
  if (page.solution) blocks.push(`<section><h2>Uma agenda que respeita sua operação</h2><ul>${list(page.solution)}</ul></section>`);
  if (page.features) blocks.push(`<section><h2>Recursos para organizar equipe e clientes</h2><ul>${list(page.features)}</ul></section>`);
  if (page.usage) blocks.push(`<section><h2>Leve o link para onde suas clientes já estão</h2><ul>${list(page.usage)}</ul></section>`);
  if (page.segments) blocks.push(`<section><h2>Para negócios com hora marcada</h2><ul>${list(page.segments)}</ul></section>`);
  blocks.push(`<section><h2>Veja também</h2><ul>${(page.links ?? []).map((link) => `<li><a href="${escapeHtml(link.to)}">${escapeHtml(link.label)}</a></li>`).join("")}</ul></section>`);
  blocks.push(`<section id="precos"><h2>Comece com 14 dias grátis, sem cartão</h2><p><strong>R$ 97/mês</strong> ou R$ 970/ano, até 3 profissionais.</p><p>Profissional adicional: R$ 15/mês. Automação WhatsApp: adicional de R$ 100/mês; custos de mensagens da Meta não estão incluídos.</p><p><a href="/signup">Começar meu teste grátis</a></p></section>`);
  blocks.push(`<section><h2>Dúvidas frequentes</h2>${(page.faqs ?? []).map((faq) => `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`).join("")}</section>`);
  blocks.push(`<footer><h2>Pronto para organizar sua agenda?</h2><p>Teste por 14 dias, sem cartão.</p><a href="/signup">Começar meu teste grátis</a></footer>`);
  return blocks.join("");
};

for (const page of Object.values(commercial)) {
  const canonical = `${siteUrl}${page.path}`;
  pages.push({
    ...page,
    type: "website",
    bodyHtml: commercialBody(page),
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebPage", name: page.title, description: page.description, url: canonical, mainEntityOfPage: canonical },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Agendoro", item: siteUrl }, { "@type": "ListItem", position: 2, name: page.eyebrow, item: canonical }] },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (page.faqs ?? []).map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
    ],
  });
}

const indexTemplate = await readFile(join(dist, "index.html"), "utf8");
const assetTags = [...indexTemplate.matchAll(/<link\b[^>]*>|<script\b[^>]*src=[^>]*><\/script>/g)].map(([tag]) => tag).join("");
const baseMetaTags = [
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  '<meta name="theme-color" content="#f59e0b" />',
  '<meta name="agendoro-customer-app-context" content="browser" />',
].join("");
const robots = `<meta name="robots" content="index,follow" />`;
const twitter = `<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="%TITLE%" /><meta name="twitter:description" content="%DESCRIPTION%" /><meta name="twitter:image" content="${imageUrl}" />`;

function render(page, noindex = false) {
  const canonical = `${siteUrl}${page.path}`;
  const metadata = [
    `<title>${escapeHtml(page.title)}</title>`, `<meta name="description" content="${escapeHtml(page.description)}" />`, noindex ? `<meta name="robots" content="noindex,follow" />` : robots,
    `<link rel="canonical" href="${canonical}" />`, `<meta property="og:title" content="${escapeHtml(page.title)}" />`, `<meta property="og:description" content="${escapeHtml(page.description)}" />`, `<meta property="og:type" content="${page.type ?? "website"}" />`, `<meta property="og:url" content="${canonical}" />`, `<meta property="og:image" content="${imageUrl}" />`, twitter.replaceAll("%TITLE%", escapeHtml(page.title)).replaceAll("%DESCRIPTION%", escapeHtml(page.description)),
    ...(page.jsonLd ?? []).map((item) => `<script type="application/ld+json">${escapeJson(item)}</script>`),
  ].join("");
  const body = `<div id="root">${page.bodyHtml ?? `<main><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.text)}</p></main>`}</div>`;
  return indexTemplate.replace(/<html[^>]*>/, `<html lang="pt-BR">`).replace(/<head>[\s\S]*?<\/head>/, `<head><meta charset="UTF-8" />${baseMetaTags}${assetTags}${metadata}</head>`).replace(/<div id="root"><\/div>/, body);
}

for (const page of pages) {
  const output = join(dist, page.path === "/" ? "index.html" : `${page.path.slice(1)}/index.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, render(page));
}

for (const page of [
  { path: "/login", h1: "Entrar no Agendoro" },
  { path: "/signup", h1: "Comece seu teste grátis" },
  { path: "/forgot-password", h1: "Recuperar senha" },
  { path: "/reset-password", h1: "Redefinir senha" },
]) {
  const output = join(dist, `${page.path.slice(1)}/index.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, render({ path: page.path, title: `${page.h1} | Agendoro`, description: "Área operacional do Agendoro.", h1: page.h1, text: "Esta área não é destinada à indexação pública." }, true));
}

await writeFile(join(dist, "private-index.html"), render({ path: "/private-index.html", title: "Área privada | Agendoro", description: "Área operacional do Agendoro.", h1: "Área privada do Agendoro", text: "Esta área não é destinada à indexação pública." }, true));

const sitemap = ["/", ...Object.values(commercial).map(({ path }) => path), "/ajuda", ...categories.map(({ slug }) => `/ajuda/${slug}`), ...articles.map(({ categorySlug, slug }) => `/ajuda/${categorySlug}/${slug}`), "/termos-de-uso", "/politica-de-privacidade"];
await writeFile(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join("")}</urlset>\n`);
