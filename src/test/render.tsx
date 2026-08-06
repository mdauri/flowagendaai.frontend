import type { PropsWithChildren, ReactElement } from "react";
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/theme/theme-provider";

interface RenderWithProvidersOptions {
  route?: string;
  withRouter?: boolean;
}

const testQueryDefaults: DefaultOptions = {
  queries: {
    retry: false,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: testQueryDefaults,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", withRouter = false }: RenderWithProvidersOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    const content = withRouter ? (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    ) : (
      children
    );

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{content}</ThemeProvider>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
}
