/** Operation values defined by the backend API. */
export type OperationType = "income" | "outcome"

/** Business segment values defined by the backend API. */
export type BusinessType = "B2B" | "B2C"

/** Category values defined by the backend API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others"

/** Grouping intervals accepted by the alerts endpoint. */
export type AlertGroupBy = "day" | "week" | "month"

/** Response body returned by GET /api/metrics/facets. */
export interface FacetsResponse {
  /** Operation types present in the dataset. */
  operation_types: OperationType[]
  /** Business segments present in the dataset. */
  business_types: BusinessType[]
  /** Categories present in the dataset, not separated by business segment. */
  categories: Category[]
  /** Earliest dataset date in YYYY-MM-DD format, or null when there is no data. */
  min_date: string | null
  /** Latest dataset date in YYYY-MM-DD format, or null when there is no data. */
  max_date: string | null
}

/** One anomalous grouped period returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Grouped period: YYYY-MM-DD for day, YYYY-Www for week, or YYYY-MM for month. */
  period: string
  /** Total outcome amount recorded in this period. */
  outcome_total: number
  /** Mean outcome amount across preceding periods in the filtered series. */
  baseline_average: number
  /** Increase over the baseline as a ratio; for example, 0.3 represents 30%. */
  increase_ratio: number
}

/** Response body returned by GET /api/metrics/alerts; it can be empty. */
export type AlertsResponse = AlertEntry[]

/** One category total returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Category whose amount is reported. */
  category: Category
  /** Operation type used to calculate total_amount. */
  operation_type: OperationType
  /** Sum of amounts for this category and operation type after query filters. */
  total_amount: number
}

/** Response body returned by GET /api/metrics/categories/top, sorted by total_amount descending. */
export type TopCategoriesResponse = CategoryEntry[]