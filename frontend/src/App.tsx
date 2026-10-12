import { useEffect, useState } from "react";
import { BarChart2, LayoutDashboard } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { AnomalyAlertsTable } from "@/components/dashboard/anomaly-alerts-table";
import { BusinessComparisonView } from "@/components/dashboard/business-comparison-view";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { buildQueryString, sumIncomeMovements } from "@/lib/api-utils";
import type {
  AlertsResponse,
  FacetsResponse,
  TopCategoriesResponse,
} from "@/../specs/api-types";
import type {
  AlertsParams,
  DateRangeFilter as DateRangeFilterValue,
  TopCategoriesParams,
} from "@/../specs/param-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatMovementPeriod,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
type DashboardView = "overview" | "comparison";

interface ComparisonData {
  b2bCategories: TopCategoriesResponse;
  b2cCategories: TopCategoriesResponse;
  b2bIncomeTotal: number;
  b2cIncomeTotal: number;
}

interface QueryError {
  query: string;
  message: string;
}

const EMPTY_COMPARISON_DATA: ComparisonData = {
  b2bCategories: [],
  b2cCategories: [],
  b2bIncomeTotal: 0,
  b2cIncomeTotal: 0,
};

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function App() {
  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [facetsError, setFacetsError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({});
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loadedMetricsQuery, setLoadedMetricsQuery] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<QueryError | null>(null);
  const [period, setPeriod] = useState("Loading...");
  const [alerts, setAlerts] = useState<AlertsResponse>([]);
  const [alertsThreshold, setAlertsThreshold] = useState(0.3);
  const [loadedAlertsQuery, setLoadedAlertsQuery] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<QueryError | null>(null);
  const [comparisonRange, setComparisonRange] = useState<DateRangeFilterValue>({});
  const [comparisonData, setComparisonData] = useState(EMPTY_COMPARISON_DATA);
  const [loadedComparisonQuery, setLoadedComparisonQuery] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<QueryError | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const startDate = dateRange.start_date;
  const endDate = dateRange.end_date;
  const comparisonStartDate = comparisonRange.start_date;
  const comparisonEndDate = comparisonRange.end_date;
  const metricsQuery = buildQueryString({ start_date: startDate, end_date: endDate });
  const alertsParams: AlertsParams = {
    threshold: alertsThreshold,
    start_date: startDate,
    end_date: endDate,
  };
  const alertsQuery = buildQueryString(alertsParams);
  const comparisonQuery = buildQueryString({
    start_date: comparisonStartDate,
    end_date: comparisonEndDate,
  });
  const metricsLoading = loadedMetricsQuery !== metricsQuery;
  const alertsLoading = loadedAlertsQuery !== alertsQuery;
  const comparisonLoading =
    activeView === "comparison" && loadedComparisonQuery !== comparisonQuery;
  const currentMetricsError = metricsError?.query === metricsQuery ? metricsError.message : null;
  const currentAlertsError = alertsError?.query === alertsQuery ? alertsError.message : null;
  const currentComparisonError =
    comparisonError?.query === comparisonQuery ? comparisonError.message : null;

  useEffect(() => {
    const controller = new AbortController();
    fetchJson<FacetsResponse>("/api/metrics/facets", controller.signal)
      .then(setFacets)
      .catch(() => {
        if (!controller.signal.aborted) {
          setFacetsError("Could not load available filters from the API.");
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson<FinancialMovement[]>(`/api/metrics${metricsQuery}`, controller.signal)
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setPeriod(formatMovementPeriod(movements));
        setMetricsError(null);
        setLoadedMetricsQuery(metricsQuery);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPeriod("Unavailable");
          setMetrics(null);
          setMonthlyData([]);
          setMetricsError({
            query: metricsQuery,
            message: "Could not load financial data. Check the backend API.",
          });
          setLoadedMetricsQuery(metricsQuery);
        }
      });
    return () => controller.abort();
  }, [metricsQuery]);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson<AlertsResponse>(`/api/metrics/alerts${alertsQuery}`, controller.signal)
      .then((response) => {
        setAlerts(response);
        setAlertsError(null);
        setLoadedAlertsQuery(alertsQuery);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAlerts([]);
          setAlertsError({
            query: alertsQuery,
            message: "Could not load spending anomalies from the API.",
          });
          setLoadedAlertsQuery(alertsQuery);
        }
      });

    return () => controller.abort();
  }, [alertsQuery]);

  useEffect(() => {
    if (activeView !== "comparison") return;

    const controller = new AbortController();
    const dateParams = { start_date: comparisonStartDate, end_date: comparisonEndDate };
    const b2bCategoryParams: TopCategoriesParams = {
      ...dateParams,
      operation_type: "income",
      limit: 5,
      business_type: "B2B",
    };
    const b2cCategoryParams: TopCategoriesParams = {
      ...dateParams,
      operation_type: "income",
      limit: 5,
      business_type: "B2C",
    };
    const movementQuery = comparisonQuery;

    Promise.all([
      fetchJson<TopCategoriesResponse>(
        `/api/metrics/categories/top${buildQueryString(b2bCategoryParams)}`,
        controller.signal,
      ),
      fetchJson<TopCategoriesResponse>(
        `/api/metrics/categories/top${buildQueryString(b2cCategoryParams)}`,
        controller.signal,
      ),
      fetchJson<FinancialMovement[]>(`/api/metrics/b2b${movementQuery}`, controller.signal),
      fetchJson<FinancialMovement[]>(`/api/metrics/b2c${movementQuery}`, controller.signal),
    ])
      .then(([b2bCategories, b2cCategories, b2bMovements, b2cMovements]) => {
        setComparisonData({
          b2bCategories,
          b2cCategories,
          b2bIncomeTotal: sumIncomeMovements(b2bMovements),
          b2cIncomeTotal: sumIncomeMovements(b2cMovements),
        });
        setComparisonError(null);
        setLoadedComparisonQuery(comparisonQuery);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setComparisonData(EMPTY_COMPARISON_DATA);
          setComparisonError({
            query: comparisonQuery,
            message: "Could not load the B2B vs. B2C comparison.",
          });
          setLoadedComparisonQuery(comparisonQuery);
        }
      });

    return () => controller.abort();
  }, [activeView, comparisonQuery, comparisonStartDate, comparisonEndDate]);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <nav aria-label="Dashboard views" className="flex gap-2 border-b border-border">
            <button
              type="button"
              aria-pressed={activeView === "overview"}
              onClick={() => setActiveView("overview")}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
                activeView === "overview"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              Overview
            </button>
            <button
              type="button"
              aria-pressed={activeView === "comparison"}
              onClick={() => setActiveView("comparison")}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
                activeView === "comparison"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 size={16} aria-hidden="true" />
              B2B vs B2C
            </button>
          </nav>

          {activeView === "overview" ? (
            <div className="flex flex-col gap-8">
              <DashboardHeader period={period} />
              {facetsError || currentMetricsError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground" role="alert">
                  {facetsError ?? currentMetricsError}
                </div>
              ) : null}
              <DateRangeFilter
                value={dateRange}
                facets={facets}
                onChange={setDateRange}
              />
              <section aria-label="Key performance indicators">
                <KPIRow metrics={metrics} loading={metricsLoading} />
              </section>
              <section
                aria-label="Financial charts"
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <IncomeOutcomeChart data={monthlyData} loading={metricsLoading} />
                <ProfitPercentChart data={monthlyData} loading={metricsLoading} />
              </section>
              {currentAlertsError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground" role="alert">
                  {currentAlertsError}
                </div>
              ) : null}
              <AnomalyAlertsTable
                alerts={alerts}
                threshold={alertsThreshold}
                onThresholdChange={(value) => setAlertsThreshold(value)}
                loading={alertsLoading}
              />
            </div>
          ) : (
            <>
              {facetsError || currentComparisonError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground" role="alert">
                  {facetsError ?? currentComparisonError}
                </div>
              ) : null}
              <BusinessComparisonView
                facets={facets}
                dateRange={comparisonRange}
                onDateRangeChange={setComparisonRange}
                b2bCategories={comparisonData.b2bCategories}
                b2cCategories={comparisonData.b2cCategories}
                b2bIncomeTotal={comparisonData.b2bIncomeTotal}
                b2cIncomeTotal={comparisonData.b2cIncomeTotal}
                loading={comparisonLoading}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
