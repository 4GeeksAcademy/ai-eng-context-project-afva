import type { FinancialMovement } from "./financial-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "../../specs/param-types";

export function buildQueryString(
  params: DateRangeFilter | AlertsParams | TopCategoriesParams,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function sumIncomeMovements(movements: FinancialMovement[]): number {
  return movements
    .filter((movement) => movement.operation_type === "income")
    .reduce((total, movement) => total + movement.amount, 0);
}