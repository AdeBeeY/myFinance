export const CURRENCIES = {
  NGN: {
    code: "NGN",
    symbol: "₦",
    locale: "en-NG",
    name: "Nigerian Naira",
  },

  USD: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    name: "US Dollar",
  },

  GBP: {
    code: "GBP",
    symbol: "£",
    locale: "en-GB",
    name: "British Pound",
  },

  EUR: {
    code: "EUR",
    symbol: "€",
    locale: "en-IE",
    name: "Euro",
  },
};

export const DEFAULT_CURRENCY = "NGN";

export const formatCurrency = (
  amount,
  currencyCode = DEFAULT_CURRENCY
) => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
  }).format(Number(amount));
};