import { describe, expect, it } from "vitest";
import { normalizeHelpText, searchHelpArticles } from "./search";

describe("help search", () => {
  it("normalizes accents and case", () => {
    expect(normalizeHelpText("Bloquear HORÁRIO")).toBe("bloquear horario");
  });

  it("finds articles by content and returns multiple matches", () => {
    const results = searchHelpArticles("notificações");
    expect(results.length).toBeGreaterThan(1);
    expect(results.map((article) => article.slug)).toContain("configurar-lembretes");
  });

  it("returns an empty list for unknown terms and empty query", () => {
    expect(searchHelpArticles("termo que não existe")).toEqual([]);
    expect(searchHelpArticles("   ")).toEqual([]);
  });
});
