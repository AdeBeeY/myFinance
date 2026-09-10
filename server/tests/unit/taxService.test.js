const {
  calculateEstimatedTax,
} = require("../../src/services/taxService");

describe("calculateEstimatedTax", () => {
  test("calculates taxable income and estimated tax correctly", () => {
    const result = calculateEstimatedTax({
      totalIncome: 500000,
      totalExpense: 150000,
      taxRate: 10,
    });

    expect(result).toEqual({
      totalIncome: 500000,
      totalExpense: 150000,
      taxableIncome: 350000,
      taxRate: 10,
      estimatedTax: 35000,
    });
  });

  test("calculates tax when there are no expenses", () => {
    const result = calculateEstimatedTax({
      totalIncome: 200000,
      totalExpense: 0,
      taxRate: 15,
    });

    expect(result).toEqual({
      totalIncome: 200000,
      totalExpense: 0,
      taxableIncome: 200000,
      taxRate: 15,
      estimatedTax: 30000,
    });
  });

  test("prevents taxable income from becoming negative", () => {
    const result = calculateEstimatedTax({
      totalIncome: 100000,
      totalExpense: 150000,
      taxRate: 10,
    });

    expect(result).toEqual({
      totalIncome: 100000,
      totalExpense: 150000,
      taxableIncome: 0,
      taxRate: 10,
      estimatedTax: 0,
    });
  });

  test("returns zero estimated tax for a zero percent tax rate", () => {
    const result = calculateEstimatedTax({
      totalIncome: 400000,
      totalExpense: 100000,
      taxRate: 0,
    });

    expect(result).toEqual({
      totalIncome: 400000,
      totalExpense: 100000,
      taxableIncome: 300000,
      taxRate: 0,
      estimatedTax: 0,
    });
  });

  test("converts numeric string inputs to numbers", () => {
    const result = calculateEstimatedTax({
      totalIncome: "500000",
      totalExpense: "200000",
      taxRate: "20",
    });

    expect(result).toEqual({
      totalIncome: 500000,
      totalExpense: 200000,
      taxableIncome: 300000,
      taxRate: 20,
      estimatedTax: 60000,
    });
  });

  test("supports decimal tax rates", () => {
    const result = calculateEstimatedTax({
      totalIncome: 250000,
      totalExpense: 50000,
      taxRate: 7.5,
    });

    expect(result).toEqual({
      totalIncome: 250000,
      totalExpense: 50000,
      taxableIncome: 200000,
      taxRate: 7.5,
      estimatedTax: 15000,
    });
  });
});