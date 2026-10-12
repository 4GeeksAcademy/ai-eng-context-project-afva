import type { ChangeEvent } from "react";
import type { FacetsResponse } from "@/../specs/api-types";
import type { DateRangeFilter as DateRangeFilterValue } from "@/../specs/param-types";

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  facets: FacetsResponse | null;
  onChange: (value: DateRangeFilterValue) => void;
  disabled?: boolean;
}

export function DateRangeFilter({
  value,
  facets,
  onChange,
  disabled = false,
}: DateRangeFilterProps) {
  const minDate = facets?.min_date ?? undefined;
  const maxDate = facets?.max_date ?? undefined;
  const hasDateRange = minDate !== undefined && maxDate !== undefined;
  const availableRangeLabel =
    facets === null
      ? "Loading available range..."
      : hasDateRange
        ? `${minDate} – ${maxDate}`
        : "no data";

  function updateDate(key: "start_date" | "end_date", event: ChangeEvent<HTMLInputElement>) {
    const nextValue = { ...value };
    if (event.target.value) {
      nextValue[key] = event.target.value;
    } else {
      delete nextValue[key];
    }
    onChange(nextValue);
  }

  return (
    <section
      aria-label="Date range filter"
      className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Start date</span>
          <input
            type="date"
            value={value.start_date ?? ""}
            min={minDate}
            max={value.end_date ?? maxDate}
            disabled={disabled || !hasDateRange}
            onChange={(event) => updateDate("start_date", event)}
            className="h-10 rounded-md border border-input bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">End date</span>
          <input
            type="date"
            value={value.end_date ?? ""}
            min={value.start_date ?? minDate}
            max={maxDate}
            disabled={disabled || !hasDateRange}
            onChange={(event) => updateDate("end_date", event)}
            className="h-10 rounded-md border border-input bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Available: {availableRangeLabel}
      </p>
    </section>
  );
}