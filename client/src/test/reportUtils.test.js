import {
  describe,
  expect,
  test,
} from "vitest";

import {
  getReportPeriod,
} from "../utils/reportUtils";

describe("getReportPeriod", () => {
  const currentDate = new Date(
    2026,
    8,
    14
  );

  test("returns today as a single-day period", () => {
    expect(
      getReportPeriod("today", currentDate)
    ).toEqual({
      startDate: "2026-09-14",
      endDate: "2026-09-14",
    });
  });

  test("returns Monday through today for this week", () => {
    expect(
      getReportPeriod("week", currentDate)
    ).toEqual({
      startDate: "2026-09-14",
      endDate: "2026-09-14",
    });
  });

  test("returns the current month through today", () => {
    expect(
      getReportPeriod("month", currentDate)
    ).toEqual({
      startDate: "2026-09-01",
      endDate: "2026-09-14",
    });
  });

  test("returns the current year through today", () => {
    expect(
      getReportPeriod("year", currentDate)
    ).toEqual({
      startDate: "2026-01-01",
      endDate: "2026-09-14",
    });
  });

  test("calculates a week that crosses a month boundary", () => {
    const date = new Date(
      2026,
      8,
      3
    );

    expect(
      getReportPeriod("week", date)
    ).toEqual({
      startDate: "2026-08-31",
      endDate: "2026-09-03",
    });
  });

  test("returns null for an unknown period", () => {
    expect(
      getReportPeriod(
        "unknown",
        currentDate
      )
    ).toBeNull();
  });
});