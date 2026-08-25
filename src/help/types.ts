export type HelpCategorySlug = "primeiros-passos" | "agenda" | "profissionais" | "servicos" | "pagina-publica" | "clientes-aplicativo" | "notificacoes" | "lista-espera-retorno" | "whatsapp" | "plano-cobranca" | "solucao-problemas" | "faq";
export type OfficialOnboardingVideoKey = "company-data" | "business-hours" | "first-professional" | "first-service" | "appearance" | "notifications" | "test-booking" | "publish";
export type HelpIconName = "book-open" | "calendar" | "users" | "briefcase" | "share" | "smartphone" | "bell" | "clock" | "message" | "credit-card" | "wrench" | "help";
export type HelpBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "note"; title?: string; text: string }
  | { type: "troubleshooting"; title: string; items: string[] }
  | { type: "link"; label: string; href: string }
  | { type: "video"; videoKey: OfficialOnboardingVideoKey; title: string; fallbackText: string };
export interface HelpCategory { slug: HelpCategorySlug; title: string; description: string; icon: HelpIconName; }
export interface HelpArticleSummary { slug: string; categorySlug: HelpCategorySlug; title: string; description: string; tags: string[]; hasVideo: boolean; }
export interface HelpArticle extends HelpArticleSummary { seo: { title: string; description: string }; body: HelpBlock[]; relatedSlugs: string[]; videoKey?: OfficialOnboardingVideoKey; }
