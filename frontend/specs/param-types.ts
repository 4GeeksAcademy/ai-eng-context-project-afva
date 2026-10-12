import type {
  AlertGroupBy,
  BusinessType,
  OperationType,
} from "./api-types"

/** Optional date query parameters accepted by the relevant metrics endpoints. */
export interface DateRangeFilter {
  /** Inclusive start date in YYYY-MM-DD format; omit it to leave the start unbounded. */
  start_date?: string
  /** Inclusive end date in YYYY-MM-DD format; omit it to leave the end unbounded. */
  end_date?: string
}

/** Optional query parameters accepted by GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /** Alert threshold ratio; backend default is 0.3 and the API minimum is 0, with no maximum. */
  threshold?: number
  /** Period grouping; backend default is month. */
  group_by?: AlertGroupBy
  /** Restricts alerts to one business segment when supplied. */
  business_type?: BusinessType
}

/** Optional query parameters accepted by GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to rank; backend default is outcome. */
  operation_type?: OperationType
  /** Maximum number of categories; backend default is 5 and valid values are integers from 1 through 20. */
  limit?: number
  /** Restricts the ranking to one business segment; required by the comparison view to query B2B and B2C separately. */
  business_type?: BusinessType
}