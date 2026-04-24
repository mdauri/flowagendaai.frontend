import { describe, expect, it } from "vitest";
import { formatIsoDateTimeToBrDate, parseBrDateToIsoDate } from "@/lib/date-br";

describe("date-br", () => {
  it("parses dd/mm/yyyy to yyyy-MM-dd", () => {
    expect(parseBrDateToIsoDate("24/04/2026")).toBe("2026-04-24");
  });

  it("returns null for invalid dates", () => {
    expect(parseBrDateToIsoDate("31/02/2026")).toBeNull();
    expect(parseBrDateToIsoDate("2026-04-24")).toBeNull();
  });

  it("formats ISO datetime to dd/MM/yyyy in tenant timezone", () => {
    expect(formatIsoDateTimeToBrDate("2026-04-24T03:00:00.000Z", "America/Sao_Paulo")).toBe(
      "24/04/2026"
    );
  });
});

