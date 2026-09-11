import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import TaxCalculator from "../pages/TaxCalculator";

import {
  getCurrentUser,
} from "../utils/auth";

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock(
  "../components/tax/TaxSettingsSection",
  () => ({
    default: ({
      selectedYear,
      onYearChange,
      onSettingSaved,
    }) => (
      <div>
        <p>
          Settings Year: {selectedYear}
        </p>

        <button
          type="button"
          onClick={() => onYearChange(2027)}
        >
          Change Tax Year
        </button>

        <button
          type="button"
          onClick={onSettingSaved}
        >
          Simulate Setting Saved
        </button>
      </div>
    ),
  })
);

vi.mock(
  "../components/tax/TaxCalculationSection",
  () => ({
    default: ({
      selectedYear,
      currency,
    }) => (
      <div>
        <p>
          Calculation Year: {selectedYear}
        </p>

        <p>
          Calculation Currency: {currency}
        </p>

        <input
          aria-label="Calculation Draft"
          defaultValue=""
        />
      </div>
    ),
  })
);

describe("TaxCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentUser.mockReturnValue({
      firstName: "Joe",
      lastName: "Doe",
      currency: "NGN",
    });
  });

  test("renders the tax calculator with the current year and user currency", () => {
    const currentYear =
      new Date().getFullYear();

    render(<TaxCalculator />);

    expect(
      screen.getByRole("heading", {
        name: "Tax Calculator",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `Settings Year: ${currentYear}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `Calculation Year: ${currentYear}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Calculation Currency: NGN"
      )
    ).toBeInTheDocument();
  });

  test("propagates a changed tax year to both sections", async () => {
    const user = userEvent.setup();

    render(<TaxCalculator />);

    await user.click(
      screen.getByRole("button", {
        name: "Change Tax Year",
      })
    );

    expect(
      screen.getByText(
        "Settings Year: 2027"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Calculation Year: 2027"
      )
    ).toBeInTheDocument();
  });

  test("remounts the calculation section after a tax setting is saved", async () => {
    const user = userEvent.setup();

    render(<TaxCalculator />);

    const draftInput =
      screen.getByLabelText(
        "Calculation Draft"
      );

    await user.type(
      draftInput,
      "stale calculation"
    );

    expect(draftInput).toHaveValue(
      "stale calculation"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Simulate Setting Saved",
      })
    );

    expect(
      screen.getByLabelText(
        "Calculation Draft"
      )
    ).toHaveValue("");
  });

  test("passes the user's configured currency to the calculation section", () => {
    getCurrentUser.mockReturnValue({
      firstName: "Joe",
      lastName: "Doe",
      currency: "USD",
    });

    render(<TaxCalculator />);

    expect(
      screen.getByText(
        "Calculation Currency: USD"
      )
    ).toBeInTheDocument();
  });
});