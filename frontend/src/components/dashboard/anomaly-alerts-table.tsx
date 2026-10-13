import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { AlertsResponse } from "@/../specs/api-types";
import { formatCurrency, formatPercent } from "@/lib/financial-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnomalyAlertsTableProps {
  alerts: AlertsResponse;
  threshold: number;
  onThresholdChange: (value: number) => void;
  loading?: boolean;
}

export function AnomalyAlertsTable({
  alerts,
  threshold,
  onThresholdChange,
  loading = false,
}: AnomalyAlertsTableProps) {
  const [thresholdInput, setThresholdInput] = useState(String(threshold));

  useEffect(() => {
    setThresholdInput(String(threshold));
  }, [threshold]);

  function updateThreshold(event: ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value;
    setThresholdInput(rawValue);
    if (rawValue === "") return;

    const nextThreshold = Number(rawValue);
    if (Number.isFinite(nextThreshold) && nextThreshold >= 0.01 && nextThreshold <= 1) {
      onThresholdChange(nextThreshold);
    }
  }

  function restoreThreshold() {
    const nextThreshold = Number(thresholdInput);
    if (!Number.isFinite(nextThreshold) || nextThreshold < 0.01 || nextThreshold > 1) {
      setThresholdInput(String(threshold));
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Spending anomalies</CardTitle>
          <CardDescription className="mt-1">
            Periods with outcome above the average of preceding periods in the selected range.
          </CardDescription>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <span>Alert threshold</span>
          <input
            aria-label="Alert threshold ratio"
            type="number"
            min="0.01"
            max="1"
            step="0.01"
            value={thresholdInput}
            onChange={updateThreshold}
            onBlur={restoreThreshold}
            className="h-9 w-24 rounded-md border border-input bg-background px-2 text-foreground"
          />
        </label>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground" role="status">
            Loading anomalies…
          </p>
        ) : alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground" role="status">
            No spending anomalies found for this range and threshold.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <caption className="sr-only">Spending anomalies by period</caption>
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3">Period</th>
                  <th scope="col" className="px-3 py-3 text-right">Recorded outcome</th>
                  <th scope="col" className="px-3 py-3 text-right">Prior-period average</th>
                  <th scope="col" className="px-3 py-3 text-right">Increase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <tr key={alert.period}>
                    <th scope="row" className="px-3 py-3 font-medium text-foreground">
                      {alert.period}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatCurrency(alert.outcome_total)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatCurrency(alert.baseline_average)}
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-[var(--outcome-badge-fg)]">
                      {formatPercent(alert.increase_ratio * 100)}
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