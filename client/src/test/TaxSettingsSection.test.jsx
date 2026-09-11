import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import TaxSettingsSection from "../components/tax/TaxSettingsSection";

import {
  getTaxSettings,
  updateTaxSetting,
} from "../api/taxApi";

vi.mock("../api/taxApi", () => ({
  getTaxSettings: vi.fn(),
  updateTaxSetting: vi.fn(),
}));

describe("TaxSettingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and displays the saved tax rate for the selected year", async () => {
    getTaxSettings.mockResolvedValue({
      data: [
        {
          id: "setting-2026",
          year: 2026,
          taxRate: 15.5,
        },
        {
          id: "setting-2025",
          year: 2025,
          taxRate: 10,
        },
      ],
    });

    render(
      <TaxSettingsSection
        selectedYear={2026}
        onYearChange={vi.fn()}
        onSettingSaved={vi.fn()}
      />
    );

    expect(
      screen.getByText(
        "Loading tax settings..."
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Tax Settings",
      })
    ).toBeInTheDocument();

    expect(getTaxSettings)
      .toHaveBeenCalledTimes(1);

    expect(
      screen.getByLabelText("Tax Year")
    ).toHaveValue(2026);

    expect(
      screen.getByLabelText("Tax Rate (%)")
    ).toHaveValue(15.5);
  });

  test("saves the tax rate and notifies the parent", async () => {
    const user = userEvent.setup();

    const onSettingSaved = vi.fn();

    getTaxSettings.mockResolvedValue({
      data: [],
    });

    updateTaxSetting.mockResolvedValue({
      data: {
        id: "setting-2026",
        year: 2026,
        taxRate: 12.5,
      },
    });

    render(
      <TaxSettingsSection
        selectedYear={2026}
        onYearChange={vi.fn()}
        onSettingSaved={onSettingSaved}
      />
    );

    await screen.findByRole("heading", {
      name: "Tax Settings",
    });

    const rateInput =
      screen.getByLabelText("Tax Rate (%)");

    await user.type(rateInput, "12.5");

    await user.click(
      screen.getByRole("button", {
        name: "Save Tax Setting",
      })
    );

    expect(updateTaxSetting)
      .toHaveBeenCalledWith({
        year: 2026,
        taxRate: 12.5,
      });

    expect(onSettingSaved)
      .toHaveBeenCalledTimes(1);

    expect(
      await screen.findByText(
        "Tax setting saved successfully."
      )
    ).toBeInTheDocument();

    expect(rateInput).toHaveValue(12.5);
  });

  test("shows an error when tax settings cannot be loaded", async () => {
    getTaxSettings.mockRejectedValue(
      new Error(
        "Unable to retrieve tax settings"
      )
    );

    render(
      <TaxSettingsSection
        selectedYear={2026}
        onYearChange={vi.fn()}
        onSettingSaved={vi.fn()}
      />
    );

    expect(
      await screen.findByText(
        "Unable to retrieve tax settings"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Save Tax Setting",
      })
    ).toBeInTheDocument();
  });

  test("shows an error when a tax setting cannot be saved", async () => {
    const user = userEvent.setup();

    const onSettingSaved = vi.fn();

    getTaxSettings.mockResolvedValue({
      data: [],
    });

    updateTaxSetting.mockRejectedValue(
      new Error(
        "Unable to save tax setting"
      )
    );

    render(
      <TaxSettingsSection
        selectedYear={2026}
        onYearChange={vi.fn()}
        onSettingSaved={onSettingSaved}
      />
    );

    await screen.findByRole("heading", {
      name: "Tax Settings",
    });

    await user.type(
      screen.getByLabelText("Tax Rate (%)"),
      "20"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Tax Setting",
      })
    );

    expect(
      await screen.findByText(
        "Unable to save tax setting"
      )
    ).toBeInTheDocument();

    expect(onSettingSaved)
      .not.toHaveBeenCalled();

    expect(
      screen.queryByText(
        "Tax setting saved successfully."
      )
    ).not.toBeInTheDocument();
  });

 test("calls onYearChange when the tax year changes", async () => {
    const onYearChange = vi.fn();

    getTaxSettings.mockResolvedValue({
      data: [],
    });

    render(
      <TaxSettingsSection
        selectedYear={2026}
        onYearChange={onYearChange}
        onSettingSaved={vi.fn()}
      />
    );

    await screen.findByRole("heading", {
      name: "Tax Settings",
    });

    const yearInput =
      screen.getByLabelText("Tax Year");

    fireEvent.change(yearInput, {
      target: {
        value: "2027",
      },
    });

    expect(onYearChange)
      .toHaveBeenCalledTimes(1);

    expect(onYearChange)
      .toHaveBeenCalledWith(2027);
  });
});