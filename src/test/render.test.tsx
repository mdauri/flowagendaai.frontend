import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useLocation } from "react-router-dom";
import { renderWithProviders } from "@/test/render";

function RouterProbe() {
  const location = useLocation();

  return <div>{location.pathname}</div>;
}

describe("renderWithProviders", () => {
  test("cria um QueryClient novo por render e nao compartilha cache entre testes", () => {
    const firstRender = renderWithProviders(<div>first render</div>);
    firstRender.queryClient.setQueryData(["test-cache"], "filled");

    firstRender.unmount();

    const secondRender = renderWithProviders(<div>second render</div>);

    expect(secondRender.queryClient).not.toBe(firstRender.queryClient);
    expect(secondRender.queryClient.getQueryData(["test-cache"])).toBeUndefined();
  });

  test("permite habilitar MemoryRouter apenas quando necessario", () => {
    renderWithProviders(<RouterProbe />, {
      withRouter: true,
      route: "/slots",
    });

    expect(screen.getByText("/slots")).toBeInTheDocument();
  });
});
