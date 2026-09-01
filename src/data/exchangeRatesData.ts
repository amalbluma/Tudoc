import { CurrencyCode } from '../types/costing';

export interface FXRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUsd: number; // e.g. 1 USD = 129.5 KES, 1 USD = 0.92 EUR
  formatDecimals: number;
}

export const FX_RATES_DATABASE: Record<CurrencyCode, FXRate> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (Base)',
    rateFromUsd: 1.0,
    formatDecimals: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromUsd: 0.92,
    formatDecimals: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromUsd: 0.78,
    formatDecimals: 2
  },
  KES: {
    code: 'KES',
    symbol: 'KSh ',
    name: 'Kenyan Shilling',
    rateFromUsd: 129.50,
    formatDecimals: 0
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh ',
    name: 'Tanzanian Shilling',
    rateFromUsd: 2620.00,
    formatDecimals: 0
  }
};
