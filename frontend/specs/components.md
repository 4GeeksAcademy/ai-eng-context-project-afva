# Dashboard Component Specifications

## Scope and Existing Patterns

This document specifies component boundaries and props for the three dashboard features. It is a frontend implementation spec, not a change to the API or an assertion that these components already exist.

The current `App` owns data loading and page composition. Components are functional React components with a local `*Props` interface; charts receive prepared data and an optional `loading` prop. Keep API requests and shared date-filter state in the page owner, and pass typed data and callbacks to presentational components. Use the existing `fetch` pattern: `VITE_API_BASE_URL`, check `response.ok`, and render explicit loading/error states.

Use the Phase 2 contracts from `./api-types` and `./param-types`; use the existing `FinancialMovement` type from `src/lib/financial-types` for B2B/B2C movement responses. Do not rename API response fields in component contracts.

## Feature 1: Main Dashboard Date Filter

### `DateRangeFilter`

Controlled input component placed near the dashboard header. It renders optional start and end date inputs, each submitted as the `YYYY-MM-DD` string provided by an HTML date input.

```ts
import type { FacetsResponse } from "./api-types"
import type { DateRangeFilter as DateRangeFilterValue } from "./param-types"

interface DateRangeFilterProps {
  value: DateRangeFilterValue
  facets: FacetsResponse
  onChange: (value: DateRangeFilterValue) => void
  disabled?: boolean
}
```

- Read the reference bounds from `facets.min_date` and `facets.max_date`; either may be `null` for an empty dataset.
- Empty inputs mean no corresponding query parameter is sent. With both empty, request the complete available dataset.
- If only `start_date` is set, include movements from that date onward; if only `end_date` is set, include movements through that date. The supplied boundary is inclusive in either case.
- Do not send dates outside the available bounds. Do not apply an invalid range where `start_date` is later than `end_date`.
- The page owner passes the same date range to the existing metrics request and the alerts request so all main-dashboard metrics, charts, and alerts stay in sync.

## Feature 2: Anomaly Alerts Table

### `AnomalyAlertsTable`

Renders below the existing charts with columns for period, recorded outcome, baseline average, and increase percentage.

```ts
import type { AlertsResponse } from "./api-types"

interface AnomalyAlertsTableProps {
  alerts: AlertsResponse
  threshold: number
  onThresholdChange: (value: number) => void
  loading?: boolean
}
```

- The numeric threshold control defaults to `0.3` and constrains user input to `0.01–1.0`. Pass the ratio as `threshold` to the alerts query; the UI constraint is stricter than the backend's `threshold >= 0` constraint.
- Render `outcome_total` and `baseline_average` as currency. Render `increase_ratio * 100` with a percent sign; the API returns a ratio, not a percentage value.
- Follow the current API behavior: `baseline_average` is the mean of all preceding grouped periods remaining after date filtering, not specifically the three immediately preceding periods. Do not label it as a three-period rolling average.
- An empty `AlertsResponse` must render an explicit no-anomalies message. Keep a visible loading state while the request is pending.
- The page owner supplies the selected main-dashboard date range to this request.

## Feature 3: B2B vs B2C Comparison View

### Navigation and Ownership

Treat the comparison as a second dashboard view. The current frontend has no router dependency, so implement the view switch as local page state in `App` with a keyboard-accessible tab or segmented navigation control; do not add URL-routing behavior as part of this spec. Both views must use the same `DateRangeFilter` state owned by `App`; do not keep a separate comparison range. Render the filter in each view, and changing it in either tab must update the range used by both analyses.

### `BusinessComparisonView`

The view owner renders two category tables in parallel and one income comparison chart beneath them.

```ts
import type { BusinessType } from "./api-types"
import type { FacetsResponse, TopCategoriesResponse } from "./api-types"
import type { DateRangeFilter } from "./param-types"

interface BusinessComparisonViewProps {
  facets: FacetsResponse
  /** Shared range also used by the main dashboard and its alerts. */
  dateRange: DateRangeFilter
  /** Updates the shared range regardless of which dashboard view is active. */
  onDateRangeChange: (value: DateRangeFilter) => void
  b2bCategories: TopCategoriesResponse
  b2cCategories: TopCategoriesResponse
  b2bIncomeTotal: number
  b2cIncomeTotal: number
  loading?: boolean
}
```

### `CategoryIncomeTable`

Render one instance for each business segment inside `BusinessComparisonView`.

```ts
import type { BusinessType, TopCategoriesResponse } from "./api-types"

interface CategoryIncomeTableProps {
  businessType: BusinessType
  categories: TopCategoriesResponse
  groupIncomeTotal: number
  loading?: boolean
}
```

### `IncomeComparisonChart`

Render one chart below the two category tables.

```ts
interface IncomeComparisonChartProps {
  b2bIncomeTotal: number
  b2cIncomeTotal: number
  loading?: boolean
}
```

- Query `GET /api/metrics/categories/top` separately for `business_type=B2B` and `business_type=B2C`, using `operation_type=income`, `limit=5`, and the shared date range. Use the same `start_date` and `end_date` values for the main metrics, alerts, category requests, and B2B/B2C movement requests.
- `facets.categories` is a global category list, not a per-business list. Use the returned `TopCategoriesResponse` entries to decide which rows each table actually displays; do not infer that every global category exists for both segments.
- The mock dataset currently has only `sales` and `others` as income categories. Show the categories returned by the API (up to five); do not pad the tables with fabricated entries.
- Obtain each group income total from its date-filtered `GET /api/metrics/b2b` or `/api/metrics/b2c` `FinancialMovement[]` response by summing `amount` where `operation_type === "income"`. These existing responses use the Phase 2 movement shape; no new API response fields are introduced by this spec.
- For each category, calculate percentage as `total_amount / groupIncomeTotal * 100`. If `groupIncomeTotal` is zero, display `—` rather than divide by zero. The API's `total_amount` is the row amount; it is not itself the percentage or group total.
- The chart compares `b2bIncomeTotal` and `b2cIncomeTotal` for the same shared selected date range as the main dashboard. Use one chart below both tables, not one chart per segment.
- Show an explicit empty state for a segment whose category response is empty, and a loading state while its data is being fetched.

## Contract Decisions

- Date query fields remain optional and retain the API names `start_date` and `end_date` from `DateRangeFilter`.
- Both dashboard views bind to one shared `DateRangeFilter` state. A change in either view updates all requests and displayed analyses; there is no independent comparison range.
- `AlertsParams` and `TopCategoriesParams` include all supported query parameters from Phase 2, including `group_by` and `business_type` for alerts, and `business_type` for top categories.
- Table data uses `AlertEntry[]` / `AlertsResponse` and `CategoryEntry[]` / `TopCategoriesResponse` as defined by the API contracts. Percentages and group totals are frontend-derived display values, not fields claimed to be present in those API responses.
- No backend changes, new response properties, or extra router dependency are implied by this component spec.