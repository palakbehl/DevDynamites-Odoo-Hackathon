// Currency conversion utilities
interface ExchangeRates {
  [currency: string]: number;
}

interface CurrencyInfo {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

// Common currency information
export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: {
    symbol: "$",
    name: "US Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "USD",
    name_plural: "US dollars"
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    symbol_native: "€",
    decimal_digits: 2,
    rounding: 0,
    code: "EUR",
    name_plural: "euros"
  },
  GBP: {
    symbol: "£",
    name: "British Pound Sterling",
    symbol_native: "£",
    decimal_digits: 2,
    rounding: 0,
    code: "GBP",
    name_plural: "British pounds sterling"
  },
  JPY: {
    symbol: "¥",
    name: "Japanese Yen",
    symbol_native: "￥",
    decimal_digits: 0,
    rounding: 0,
    code: "JPY",
    name_plural: "Japanese yen"
  },
  CAD: {
    symbol: "CA$",
    name: "Canadian Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "CAD",
    name_plural: "Canadian dollars"
  },
  AUD: {
    symbol: "AU$",
    name: "Australian Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "AUD",
    name_plural: "Australian dollars"
  },
  CHF: {
    symbol: "CHF",
    name: "Swiss Franc",
    symbol_native: "CHF",
    decimal_digits: 2,
    rounding: 0.05,
    code: "CHF",
    name_plural: "Swiss francs"
  },
  CNY: {
    symbol: "CN¥",
    name: "Chinese Yuan",
    symbol_native: "CN¥",
    decimal_digits: 2,
    rounding: 0,
    code: "CNY",
    name_plural: "Chinese yuan"
  },
  INR: {
    symbol: "₹",
    name: "Indian Rupee",
    symbol_native: "₹",
    decimal_digits: 2,
    rounding: 0,
    code: "INR",
    name_plural: "Indian rupees"
  },
  BRL: {
    symbol: "R$",
    name: "Brazilian Real",
    symbol_native: "R$",
    decimal_digits: 2,
    rounding: 0,
    code: "BRL",
    name_plural: "Brazilian reals"
  },
  KRW: {
    symbol: "₩",
    name: "South Korean Won",
    symbol_native: "₩",
    decimal_digits: 0,
    rounding: 0,
    code: "KRW",
    name_plural: "South Korean won"
  },
  MXN: {
    symbol: "MX$",
    name: "Mexican Peso",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "MXN",
    name_plural: "Mexican pesos"
  },
  SGD: {
    symbol: "S$",
    name: "Singapore Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "SGD",
    name_plural: "Singapore dollars"
  },
  NZD: {
    symbol: "NZ$",
    name: "New Zealand Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "NZD",
    name_plural: "New Zealand dollars"
  },
  SEK: {
    symbol: "kr",
    name: "Swedish Krona",
    symbol_native: "kr",
    decimal_digits: 2,
    rounding: 0,
    code: "SEK",
    name_plural: "Swedish kronor"
  },
  NOK: {
    symbol: "Nkr",
    name: "Norwegian Krone",
    symbol_native: "kr",
    decimal_digits: 2,
    rounding: 0,
    code: "NOK",
    name_plural: "Norwegian kroner"
  },
  DKK: {
    symbol: "Dkr",
    name: "Danish Krone",
    symbol_native: "kr",
    decimal_digits: 2,
    rounding: 0,
    code: "DKK",
    name_plural: "Danish kroner"
  },
  RUB: {
    symbol: "RUB",
    name: "Russian Ruble",
    symbol_native: "₽",
    decimal_digits: 2,
    rounding: 0,
    code: "RUB",
    name_plural: "Russian rubles"
  },
  ZAR: {
    symbol: "R",
    name: "South African Rand",
    symbol_native: "R",
    decimal_digits: 2,
    rounding: 0,
    code: "ZAR",
    name_plural: "South African rand"
  },
  HKD: {
    symbol: "HK$",
    name: "Hong Kong Dollar",
    symbol_native: "$",
    decimal_digits: 2,
    rounding: 0,
    code: "HKD",
    name_plural: "Hong Kong dollars"
  }
};

// Fetch real currency data from API
export const fetchCurrencyData = async (): Promise<Record<string, any>> => {
  try {
    // Fetch countries and currencies data
    const countriesResponse = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
    const countriesData = await countriesResponse.json();
    
    // Process the data to create a currency map
    const currencyMap: Record<string, any> = {};
    
    countriesData.forEach((country: any) => {
      if (country.currencies) {
        Object.keys(country.currencies).forEach(currencyCode => {
          const currency = country.currencies[currencyCode];
          if (!currencyMap[currencyCode]) {
            currencyMap[currencyCode] = {
              code: currencyCode,
              name: currency.name || currencyCode,
              symbol: currency.symbol || currencyCode,
              countries: []
            };
          }
          currencyMap[currencyCode].countries.push(country.name.common);
        });
      }
    });
    
    return currencyMap;
  } catch (error) {
    console.error("Error fetching currency data:", error);
    return {};
  }
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_INFO[currencyCode]?.symbol || currencyCode;
};

// Format currency amount
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currencyInfo = CURRENCY_INFO[currencyCode];
  if (!currencyInfo) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyInfo.decimal_digits,
    maximumFractionDigits: currencyInfo.decimal_digits
  }).format(amount);
};

// Convert currency using exchange rates
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) return amount;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    const data = await response.json();
    const rate = data.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }
    
    return amount * rate;
  } catch (error) {
    console.error("Error converting currency:", error);
    // Return original amount if conversion fails
    return amount;
  }
};

// Get list of supported currencies
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(CURRENCY_INFO);
};

// Get currency name
export const getCurrencyName = (currencyCode: string): string => {
  return CURRENCY_INFO[currencyCode]?.name || currencyCode;
};

// Currency converter hook
export const useCurrencyConverter = () => {
  const convert = async (amount: number, from: string, to: string): Promise<number> => {
    return convertCurrency(amount, from, to);
  };
  
  const format = (amount: number, currency: string): string => {
    return formatCurrency(amount, currency);
  };
  
  return { convert, format };
};