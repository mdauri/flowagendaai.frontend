# Frontend Tests

## Comandos

- `npm run test`: executa a suite uma vez
- `npm run test:watch`: executa em watch mode

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
