import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Check,
  Coins,
  Copy,
  DollarSign,
  FileCheck2,
  Percent,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { ClientQuotationInputs, CostingTotals } from '../types/costing';
import { formatCurrency } from '../utils/costingEngine';

interface FinancialSummaryPanelProps {
  totals: CostingTotals;
  clientInputs: ClientQuotationInputs;
  onMarkupChange: (newMarkup: number) => void;
}

export const FinancialSummaryPanel: React.FC<FinancialSummaryPanelProps> = ({
  totals,
  clientInputs,
  onMarkupChange
}) => {
  const [copied, setCopied] = useState(false);
  const totalPax = clientInputs.paxAdults + clientInputs.paxChildren;

  const categories = [
    {
      name: 'STO Accommodation',
      amount: totals.totalAccommodationNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalAccommodationNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-amber-500'
    },
    {
      name: 'Park & Conservancies',
      amount: totals.totalParkFeesNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalParkFeesNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-emerald-500'
    },
    {
      name: '4x4 Transport & Guide',
      amount: totals.totalTransportNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalTransportNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-blue-500'
    },
    {
      name: 'Domestic Flights',
      amount: totals.totalFlightsNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalFlightsNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-sky-500'
    },
    {
      name: 'Activities & Excursions',
      amount: totals.totalActivitiesNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalActivitiesNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-indigo-500'
    },
    {
      name: 'AMREF & Operational',
      amount: totals.totalOperationalExtrasNetUsd,
      pct: totals.totalDirectNetCostUsd > 0 ? (totals.totalOperationalExtrasNetUsd / totals.totalDirectNetCostUsd) * 100 : 0,
      color: 'bg-slate-400'
    }
  ];

  const handleCopySummary = () => {
    const summaryText = `
TUSAFIRI AFRICA SAFARIS — COSTING & QUOTE SUMMARY
Ref: ${clientInputs?.quoteReference || 'N/A'}
Client: ${clientInputs?.clientName || 'Valued Guest'}
Travel Dates: ${clientInputs?.travelStartDate || 'TBD'} to ${clientInputs?.travelEndDate || 'TBD'} (${totalPax} Guests)

--- COSTING BREAKDOWN (USD) ---
• STO Accommodation Net: $${(totals?.totalAccommodationNetUsd ?? 0).toLocaleString()}
• Park & Conservancy Fees: $${(totals?.totalParkFeesNetUsd ?? 0).toLocaleString()}
• 4x4 Transport & Guide: $${(totals?.totalTransportNetUsd ?? 0).toLocaleString()}
• Domestic Scheduled Flights: $${(totals?.totalFlightsNetUsd ?? 0).toLocaleString()}
• Safari Activities: $${(totals?.totalActivitiesNetUsd ?? 0).toLocaleString()}
• Operational Extras & AMREF: $${(totals?.totalOperationalExtrasNetUsd ?? 0).toLocaleString()}

TOTAL DIRECT NET OPERATIONAL COST: $${(totals?.totalDirectNetCostUsd ?? 0).toLocaleString()}
TUSAFIRI OPERATOR MARKUP (${totals?.operatorMarkupPercent ?? 15}%): +$${(totals?.operatorMarkupAmountUsd ?? 0).toLocaleString()}
------------------------------------------------
FINAL CLIENT SELLING PRICE: $${(totals?.grandSellingPriceUsd ?? 0).toLocaleString()} USD
PRICE PER PERSON (${totalPax} Pax): $${(totals?.pricePerPersonUsd ?? 0).toLocaleString()} USD
(${totals?.selectedCurrency || 'USD'} Converted: ${totals?.selectedCurrency || 'USD'} ${(totals?.grandSellingPriceConverted ?? 0).toLocaleString()} / Per Person: ${totals?.selectedCurrency || 'USD'} ${(totals?.pricePerPersonConverted ?? 0).toLocaleString()})
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="financial-summary-panel" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-6">
      
      {/* Header with Commercial KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            Commercial Pricing & Margin Summary
          </h3>
          <p className="text-xs text-slate-500">
            Real-time audit calculation from individual STO rates through to client selling price.
          </p>
        </div>

        <button
          id="btn-copy-quote-summary"
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Summary!' : 'Copy Summary'}
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Net Cost Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Net Operational Cost
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            ${(totals?.totalDirectNetCostUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Pure direct cost across all {categories.length} operational categories
          </span>
        </div>

        {/* Tusafiri Operator Markup Card */}
        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Operator Markup ({totals?.operatorMarkupPercent ?? 15}%)
            </span>
            <span className="text-xs bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded font-bold">
              Dynamic
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-900">
            +${(totals?.operatorMarkupAmountUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-amber-800/80 mt-1 block">
            Net × {totals?.operatorMarkupPercent ?? 15}% margin
          </span>
        </div>

        {/* Final Selling Price Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Final Client Selling Price
            </span>
            <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
              Audited
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ${(totals?.grandSellingPriceUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
            <span>Per Person ({totalPax} Pax):</span>
            <strong className="text-amber-300 text-sm font-bold">
              ${(totals?.pricePerPersonUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

      </div>

      {/* FX Converted Box if non-USD selected */}
      {(totals?.selectedCurrency && totals.selectedCurrency !== 'USD') && (
        <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <span>
              Converted to <strong>{totals.selectedCurrency}</strong> (Exchange Rate: 1 USD = {totals.fxRateToBase} {totals.selectedCurrency}):
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold block">
              {formatCurrency(totals.grandSellingPriceConverted, totals.selectedCurrency)}
            </span>
            <span className="text-[11px] text-indigo-700">
              ({formatCurrency(totals.pricePerPersonConverted, totals.selectedCurrency)} / person)
            </span>
          </div>
        </div>
      )}

      {/* Detailed Net Cost Breakdown Category Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-slate-500" />
          Net Operational Cost Distribution
        </h4>

        {/* Visual Stacked Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.color} transition-all`}
              style={{ width: `${cat.pct}%` }}
              title={`${cat.name}: $${cat.amount.toFixed(2)} (${cat.pct.toFixed(1)}%)`}
            />
          ))}
        </div>

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-slate-600 font-medium">{cat.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">${(cat.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-slate-400 block">{cat.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Step-by-Step Audit Flow Trace */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          Line-Item-to-Selling-Price Audit Flow
        </span>
        <div className="font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/90 leading-relaxed overflow-x-auto">
          <div>1. Direct Net Operational Cost = $<strong>{(totals?.totalDirectNetCostUsd ?? 0).toLocaleString()}</strong></div>
          <div className="text-amber-800">
            2. Operator Markup ({totals?.operatorMarkupPercent ?? 15}%) = $<strong>{(totals?.totalDirectNetCostUsd ?? 0).toLocaleString()}</strong> × ({totals?.operatorMarkupPercent ?? 15}/100) = $<strong>{(totals?.operatorMarkupAmountUsd ?? 0).toLocaleString()}</strong>
          </div>
          <div>
            3. Gross Client Selling Price = $<strong>{(totals?.totalDirectNetCostUsd ?? 0).toLocaleString()}</strong> + $<strong>{(totals?.operatorMarkupAmountUsd ?? 0).toLocaleString()}</strong> = $<strong>{(totals?.grandSellingPriceUsd ?? 0).toLocaleString()}</strong>
          </div>
          <div className="text-emerald-700 font-bold">
            4. Price Per Person = $<strong>{(totals?.grandSellingPriceUsd ?? 0).toLocaleString()}</strong> ÷ {totalPax} Guests = $<strong>{(totals?.pricePerPersonUsd ?? 0).toLocaleString()}</strong> / person
          </div>
        </div>
      </div>

    </div>
  );
};
