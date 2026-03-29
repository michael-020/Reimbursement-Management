// Currency conversion utility using real-time exchange rates

interface ConversionResult {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      amount,
      fromCurrency,
      toCurrency,
      rate: 1,
      convertedAmount: amount,
    };
  }

  try {
    // Use a free currency conversion API (you can replace with your preferred API)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate for ${toCurrency} not found`);
    }

    const convertedAmount = amount * rate;

    return {
      amount,
      fromCurrency,
      toCurrency,
      rate,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    
    // Fallback to a default rate or throw error
    throw new Error(`Failed to convert ${fromCurrency} to ${toCurrency}`);
  }
}

// Helper function to get supported currencies
export function getSupportedCurrencies(): string[] {
  return [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD',
    'HKD', 'NZD', 'ZAR', 'MXN', 'BRL', 'RUB', 'KRW', 'IDR', 'THB', 'MYR'
  ];
}

// Helper function to format currency display
export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}
