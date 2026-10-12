import { describe, expect, it } from "vitest";

import { buildQueryString, sumIncomeMovements } from "./api-utils";
import type { FinancialMovement } from "./financial-types";

describe("buildQueryString", () => {
  it("omits date filters that are not set", () => {
    expect(buildQueryString({ start_date: "2025-01-01", end_date: "" })).toBe(
      "?start_date=2025-01-01",
    );
    expect(buildQueryString({})).toBe("");
  });

  it("preserves alert and category query parameters", () => {
    expect(
      buildQueryString({ threshold: 0.3, start_date: "2025-01-01" }),
    ).toBe("?threshold=0.3&start_date=2025-01-01");
    expect(
      buildQueryString({
        operation_type: "income",
        limit: 5,
        business_type: "B2B",
      }),
    ).toBe("?operation_type=income&limit=5&business_type=B2B");
  });
});

describe("sumIncomeMovements", () => {
  it("sums income movements and excludes outcomes", () => {
    const movements: FinancialMovement[] = [
      {
        create_date: "2025-01-05",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
      {
        create_date: "2025-01-10",
        amount: 250,
        operation_type: "outcome",
        category: "suppliers",
        business_type: "B2B",
      },
      {
        create_date: "2025-01-15",
        amount: 500,
        operation_type: "income",
        category: "others",
        business_type: "B2B",
      },
    ];

    expect(sumIncomeMovements(movements)).toBe(1500);
    expect(sumIncomeMovements([])).toBe(0);
  });
});