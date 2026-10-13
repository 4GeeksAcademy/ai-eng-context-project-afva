import type { BusinessType, CategoryEntry, FacetsResponse, TopCategoriesResponse } from "@/../specs/api-types";
import type { DateRangeFilter as DateRangeFilterValue } from "@/../specs/param-types";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/financial-utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BusinessComparisonViewProps {
  facets: FacetsResponse | null;
  dateRange: DateRangeFilterValue;
  onDateRangeChange: (value: DateRangeFilterValue) => void;
  b2bCategories: TopCategoriesResponse;
  b2cCategories: TopCategoriesResponse;
  b2bIncomeTotal: number;
  b2cIncomeTotal: number;
  loading?: boolean;
}

interface CategoryIncomeTableProps {
  businessType: BusinessType;
  categories: TopCategoriesResponse;
  groupIncomeTotal: number;
  loading: boolean;
}

interface IncomeComparisonChartProps {
  b2bIncomeTotal: number;
  b2cIncomeTotal: number;
  loading: boolean;
}

function CategoryIncomeTable({
  businessType,
  categories,
  groupIncomeTotal,
  loading,
}: CategoryIncomeTableProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{businessType} income categories</CardTitle>
        <CardDescription>Top income categories and share of segment income</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground" role="status">
            Loading categories…
          </p>
        ) : categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground" role="status">
            No income categories available for this range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <caption className="sr-only">{businessType} income categories and share of segment income</caption>
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3">Category</th>
                  <th scope="col" className="px-3 py-3 text-right">Income</th>
                  <th scope="col" className="px-3 py-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category: CategoryEntry) => (
                  <tr key={category.category}>
                    <th scope="row" className="px-3 py-3 font-medium capitalize text-foreground">
                      {category.category}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatCurrency(category.total_amount)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {groupIncomeTotal > 0
                        ? formatPercent((category.total_amount / groupIncomeTotal) * 100)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeComparisonChart({
  b2bIncomeTotal,
  b2cIncomeTotal,
  loading,
}: IncomeComparisonChartProps) {
  const data = [
    { businessType: "B2B", income: b2bIncomeTotal },
    { businessType: "B2C", income: b2cIncomeTotal },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Income by business line</CardTitle>
        <CardDescription>Total income for the selected comparison range</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground" role="status">
            Loading comparison…
          </p>
        ) : b2bIncomeTotal === 0 && b2cIncomeTotal === 0 ? (
          <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground" role="status">
            No income available for this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
              <XAxis dataKey="businessType" tick={{ fill: "var(--color-muted-foreground)" }} />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)" }}
                tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="income" name="Income" fill="var(--chart-income)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {!loading && (b2bIncomeTotal > 0 || b2cIncomeTotal > 0) ? (
          <table className="sr-only">
            <caption>Income by business line</caption>
            <thead>
              <tr>
                <th scope="col">Business line</th>
                <th scope="col">Income</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">B2B</th>
                <td>{formatCurrency(b2bIncomeTotal)}</td>
              </tr>
              <tr>
                <th scope="row">B2C</th>
                <td>{formatCurrency(b2cIncomeTotal)}</td>
              </tr>
            </tbody>
          </table>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function BusinessComparisonView({
  facets,
  dateRange,
  onDateRangeChange,
  b2bCategories,
  b2cCategories,
  b2bIncomeTotal,
  b2cIncomeTotal,
  loading = false,
}: BusinessComparisonViewProps) {
  return (
    <section aria-labelledby="business-comparison-heading" className="flex flex-col gap-6">
      <header>
        <h1 id="business-comparison-heading" className="text-xl font-semibold text-foreground">
          B2B vs. B2C income
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare income categories and totals for each business line.
        </p>
      </header>

      <DateRangeFilter
        value={dateRange}
        facets={facets}
        onChange={onDateRangeChange}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CategoryIncomeTable
          businessType="B2B"
          categories={b2bCategories}
          groupIncomeTotal={b2bIncomeTotal}
          loading={loading}
        />
        <CategoryIncomeTable
          businessType="B2C"
          categories={b2cCategories}
          groupIncomeTotal={b2cIncomeTotal}
          loading={loading}
        />
      </div>

      <IncomeComparisonChart
        b2bIncomeTotal={b2bIncomeTotal}
        b2cIncomeTotal={b2cIncomeTotal}
        loading={loading}
      />
    </section>
  );
}