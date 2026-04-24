# Frontend Tests

## Comandos

- `npm run test`: executa a suite uma vez
- `npm run test:watch`: executa em watch mode
- `npm run e2e`: smoke E2E do dashboard com Playwright (headless por padrao)
- `npm run e2e:ui`: runner interativo do Playwright
- `npm run e2e:report`: abre o report HTML do Playwright

## Playwright (E2E)

### Instalar

1. `npm i -D @playwright/test`
2. `npx playwright install`

### Variaveis de ambiente

Defina no shell antes de rodar:

- `E2E_EMAIL` (ex.: `admin@agendoro.com`)
- `E2E_PASSWORD`
- `E2E_BASE_URL` (opcional; default `http://localhost:5173`)

### Rodar

- Com frontend ja rodando: `npm run e2e`
- Sem frontend rodando: `npm run e2e` (o `webServer` do Playwright sobe o Vite automaticamente)

## Quando usar `renderWithProviders`

Use `renderWithProviders` em testes que dependem de `React Query` e, quando necessario, de roteamento com `MemoryRouter`.

Arquivo:

- `src/test/render.tsx`

Regras do helper:

- cria um `QueryClient` novo por render
- usa `retry: false` para queries e mutations
- aceita `withRouter: true` e `route` apenas quando o teste precisa de roteamento

## Padrao De Mocks

- para pagina e fluxo, mocke modulos de `services` com `vi.mock`
- nao use `fetch` global como padrao
- nao mocke hooks internos sem necessidade

## Escopo Atual

A infraestrutura foi introduzida para destravar os testes da booking foundation com `Vitest + jsdom + Testing Library`, sem `MSW` e sem E2E.
