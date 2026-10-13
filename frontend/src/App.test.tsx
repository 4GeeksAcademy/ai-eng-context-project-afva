// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const facets = {
  operation_types: ["income", "outcome"],
  business_types: ["B2B", "B2C"],
  categories: ["sales", "suppliers"],
  min_date: "2024-01-01",
  max_date: "2024-12-31",
};

const movements = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 200,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
];

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, ok = true): Promise<Response> {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as Response);
}

function responseFor(path: string): Promise<Response> {
  if (path.endsWith("/api/metrics/facets")) return jsonResponse(facets);
  if (path.includes("/api/metrics/alerts")) return jsonResponse([]);
  if (path.includes("/api/metrics/categories/top")) return jsonResponse([]);
  if (path.includes("/api/metrics/b2b") || path.includes("/api/metrics/b2c")) {
    return jsonResponse([]);
  }
  if (path === "/api/metrics") return jsonResponse(movements);

  throw new Error(`Unexpected API request: ${path}`);
}

beforeEach(() => {
  fetchMock.mockImplementation((input) => responseFor(String(input)));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("dashboard API workflow", () => {
  it("shows loading, then the empty state when the API returns no movements", async () => {
    let resolveMetrics!: (response: Response) => void;
    const metricsResponse = new Promise<Response>((resolve) => {
      resolveMetrics = resolve;
    });
    fetchMock.mockImplementation((input) => {
      return String(input) === "/api/metrics"
        ? metricsResponse
        : responseFor(String(input));
    });

    render(<App />);

    expect(screen.getByText("Loading key performance indicators")).toBeTruthy();
    await act(async () => resolveMetrics(await jsonResponse([])));
    expect(await screen.findAllByText("No data available to display")).toHaveLength(2);
  });

  it("renders the calculated financial metrics after a successful response", async () => {
    render(<App />);

    expect(await screen.findByText("$1,000", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("$200", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("$800", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("80.0%", { selector: "p" })).toBeTruthy();
  });

  it("announces a failed metrics request", async () => {
    fetchMock.mockImplementation((input) =>
      String(input) === "/api/metrics"
        ? jsonResponse({}, false)
        : responseFor(String(input)),
    );

    render(<App />);

    expect(
      await screen.findByText("Could not load financial data. Check the backend API."),
    ).toBeTruthy();
  });

  it("loads comparison data when its view is selected", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "B2B vs B2C" }));

    expect(await screen.findByRole("heading", { name: "B2B vs. B2C income" })).toBeTruthy();
    expect(await screen.findAllByText("No income categories available for this range."))
      .toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/metrics/categories/top"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});