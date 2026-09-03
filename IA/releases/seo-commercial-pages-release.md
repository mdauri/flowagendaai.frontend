# Release — primeiras páginas comerciais de SEO

## Status

PASS LOCALMENTE PRONTO PARA REVISÃO — candidato não publicado.

## Entrega

- `/sistema-agendamento-online`
- `/agenda-online-estetica-automotiva`
- `/agenda-online-salao-beleza`

## Incluído

- Conteúdo específico e compartilhado entre React e prerender.
- Metadata, canonical, sitemap, BreadcrumbList e FAQPage.
- Eventos de page view, CTA, demo e início de signup com first-touch.
- Regressão unitária e validação HTML/Googlebot local.

## Correção final de robots

### Causa

O prerender gerava `noindex` somente para páginas privadas estáticas como login, signup e reset. As rotas dinâmicas `/app`, `/manage`, `/c` e `/p` caíam no `dist/index.html`, que era a homepage pública e continha `index,follow`. O Nginx já aplicava `X-Robots-Tag`, mas HTML e header ficavam inconsistentes.

### Arquivos alterados nesta correção

- `index.html` — template base passa a declarar `noindex,follow`.
- `scripts/prerender.mjs` — gera `private-index.html` dedicado, mantendo páginas públicas prerenderizadas como `index,follow`.
- `nginx.conf` — mantém o header e amplia a defesa para login, signup e reset; rotas privadas dinâmicas passam a usar `private-index.html` como fallback.
- `scripts/validate-seo.mjs` — exige simultaneamente meta robots e `X-Robots-Tag` nas rotas privadas e rejeita `index,follow`.
- `IA/releases/seo-commercial-pages-release.md` — relatório atualizado.

### Comportamento antes/depois

| Escopo | Antes | Depois |
|---|---|---|
| `/login`, `/signup`, reset | meta noindex; header ausente | meta `noindex,follow` + header `noindex, follow` |
| `/app`, `/app/unknown` | fallback homepage com meta `index,follow`; header noindex | fallback privado com meta `noindex,follow` + header noindex |
| `/manage`, `/manage/unknown` | fallback homepage com meta `index,follow`; header noindex | fallback privado com meta `noindex,follow` + header noindex |
| comerciais e homepage | indexáveis | permanecem `index,follow`, conteúdo e canonical preservados |

## Validação integrada executada

Worktree: `/home/dauri/Projects/worktrees/flowagendaai/seo-commercial-pages`

Comandos principais:

- `docker build --no-cache -t agendoro-frontend-seo-validation:local .` — PASS; build Docker executou `npm ci`, `npm run build` e `postbuild`.
- `docker run --rm --name agendoro-frontend-seo-validation -p 18080:80 -d agendoro-frontend-seo-validation:local` — PASS; Nginx integrado ativo.
- `npm run validate:seo -- --base-url=http://127.0.0.1:18080` — PASS; 49 URLs canônicas.
- `npm test -- src/components/auth/signup-form.test.tsx src/services/signup-service.test.ts` — PASS; 2 arquivos, 6 testes.
- `E2E_AUTH_FILE=/tmp/seo-empty-auth.json npx playwright test e2e/public-mobile.smoke.spec.ts --project=public-mobile --no-deps` — PASS; catálogo/booking público mobile, 1 teste.
- `npm run test` — PASS; 75 arquivos, 387 testes.
- `docker rm -f agendoro-frontend-seo-validation` — PASS; container temporário removido.
- `ps -ef` e `ss -ltnp` — PASS; nenhum processo/porta residual de validação.

## Evidência HTTP com User-Agent Googlebot

Base: `http://127.0.0.1:18080`, imagem construída pelo `Dockerfile` e servida pelo `nginx:alpine`.

| Rota | Status | `X-Robots-Tag` | Meta robots | Title/canonical/conteúdo |
|---|---:|---|---|---|
| `/` | 200 | ausente | `index,follow` | homepage, H1 e canonical `/` |
| `/sistema-agendamento-online` | 200 | ausente | `index,follow` | title próprio, canonical próprio, HTML completo |
| `/agenda-online-estetica-automotiva` | 200 | ausente | `index,follow` | title próprio, canonical próprio, HTML completo |
| `/agenda-online-salao-beleza` | 200 | ausente | `index,follow` | title próprio, canonical próprio, HTML completo |
| `/sitemap.xml` | 200 | ausente | não aplicável | XML válido, 49 URLs públicas |
| `/login` | 200 | `noindex, follow` | `noindex,follow` | title e canonical presentes |
| `/signup` | 200 | `noindex, follow` | `noindex,follow` | title e canonical presentes |
| `/app` | 200 | `noindex, follow` | `noindex,follow` | fallback privado inicial |
| `/app/unknown` | 200 | `noindex, follow` | `noindex,follow` | fallback privado inicial |
| `/manage` | 200 | `noindex, follow` | `noindex,follow` | fallback privado inicial |
| `/manage/unknown` | 200 | `noindex, follow` | `noindex,follow` | fallback privado inicial |

Para as três páginas comerciais, a inspeção do HTML confirmou: exatamente um H1, title exclusivo, canonical absoluto próprio, `og:title`, `og:description`, `og:url`, `og:image`, Twitter Card, três blocos JSON-LD válidos (`WebPage`, `BreadcrumbList`, `FAQPage`), conteúdo inicial completo e três CTAs `/signup`.

O sitemap confirmou `public_urls=49`, `commercial_urls=3` e `private_urls=0`.

## Resultado por critério

- Páginas comerciais HTTP 200: PASS.
- HTML prerenderizado: PASS.
- Canonical próprio: PASS.
- JSON-LD válido: PASS.
- Todas as rotas privadas com meta e header noindex: PASS.
- Nenhuma rota privada com `index,follow`: PASS.
- Sitemap somente público/canônico: PASS.
- Signup smoke: PASS nos testes funcionais existentes de formulário e serviço.
- Catálogo público smoke: PASS no fluxo mobile existente.

## Limitações

- O container validado é local e temporário; ainda não há evidência de deploy ou produção.
- Não houve deploy, commit, PR, merge, migration ou alteração de dados reais.
- O smoke Playwright usa `/tmp/seo-empty-auth.json` para evitar setup autenticado e passou no fluxo público mockado.

## Gate antes de publicação

- Executar E2E/browser no candidato integrado.
- Revalidar Nginx, User-Agent Googlebot, rotas profundas e noindex de fluxos privados no candidato final antes do deploy.
- Confirmar visual responsivo nos quatro viewports definidos no plano.
- Obter aprovação operacional separada para commit, merge e deploy.
