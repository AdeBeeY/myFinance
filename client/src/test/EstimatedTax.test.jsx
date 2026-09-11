import {
  describe,
  expect,
  test,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
} from "react-router-dom";

import EstimatedTax from "../components/dashboard/EstimatedTax";

const renderEstimatedTax = (props) => {
  render(
    <MemoryRouter>
      <EstimatedTax {...props} />
    </MemoryRouter>
  );
};

describe("EstimatedTax", () => {
  test("renders the estimated tax when a tax summary is available", () => {
    renderEstimatedTax({
      taxSummary: {
        estimatedTax: 37000,
        taxRate: 10,
      },
      taxError: "",
      currency: "NGN",
      year: 2026,
    });

    expect(
      screen.getByText("Estimated Tax")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦37,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2026 estimate at 10%")
    ).toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: "View tax calculator",
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/tax"
    );
  });

  test("shows the not configured state when no tax summary exists", () => {
    renderEstimatedTax({
      taxSummary: null,
      taxError: "",
      currency: "NGN",
      year: 2026,
    });

    expect(
      screen.getByText("Not configured")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Add a tax rate for 2026 to see your estimated tax."
      )
    ).toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: "Configure tax",
    });

    expect(link).toHaveAttribute(
      "href",
      "/tax"
    );
  });

  test("shows the tax error without displaying the normal estimate", () => {
    renderEstimatedTax({
      taxSummary: null,
      taxError: "Tax service unavailable",
      currency: "NGN",
      year: 2026,
    });

    expect(
      screen.getByText("Unable to load estimate")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Tax service unavailable"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Not configured")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: "View tax calculator",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Configure tax",
      })
    ).toHaveAttribute("href", "/tax");
  });

  test("formats the estimate using the user's currency", () => {
    renderEstimatedTax({
      taxSummary: {
        estimatedTax: 1250.5,
        taxRate: 7.5,
      },
      taxError: "",
      currency: "USD",
      year: 2026,
    });

    expect(
      screen.getByText("$1,250.50")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "2026 estimate at 7.5%"
      )
    ).toBeInTheDocument();
  });
});