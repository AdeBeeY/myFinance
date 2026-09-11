import {
  describe,
  expect,
  test,
} from "vitest";

import {
  formatCurrency,
} from "../utils/currency";

describe("formatCurrency", () => {
  test("formats Nigerian Naira correctly", () => {
    expect(
      formatCurrency(386000, "NGN")
    ).toBe("₦386,000.00");
  });

  test("formats US Dollars correctly", () => {
    expect(
      formatCurrency(1250.5, "USD")
    ).toBe("$1,250.50");
  });

  test("falls back to NGN for an unsupported currency", () => {
    expect(
      formatCurrency(1000, "INVALID")
    ).toBe("₦1,000.00");
  });
});