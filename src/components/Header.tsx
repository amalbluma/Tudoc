import React from 'react';
import { Compass, Download, FilePlus, FileSpreadsheet, Printer, RotateCcw, ShieldCheck, Sparkles, Briefcase, Settings, Save, Cloud, History } from 'lucide-react';
import { CurrencyCode } from '../types/costing';
import { FX_RATES_DATABASE } from '../data/exchangeRatesData';
import { TusafiriLogo } from './TusafiriLogo';

interface HeaderProps {
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onExportExcel: () => void;
  onOpenScenarioModal: () => void;
  onPrintQuote: () => void;
  onResetDefaults: () => void;
  onNewItinerary: () => void;
  onSaveQuote: () => void;
  activeTab: 'costing' | 'quote' | 'database' | 'scenarios' | 'pipeline' | 'settings';
  setActiveTab: (tab: 'costing' | 'quote' | 'database' | 'scenarios' | 'pipeline' | 'settings') => void;
  quoteRef: string;
  markupPercent: number;
  draftsCount?: number;
  autoSaveStatus?: 'saved' | 'saving' | 'unsaved' | 'disabled';
  lastAutoSavedAt?: Date | null;
  onOpenDrafts?: () => void;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline';
  totalPropertiesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCurrency,
  onCurrencyChange,
  onExportExcel,
  onOpenScenarioModal,
  onPrintQuote,
  onResetDefaults,
  onNewItinerary,
  onSaveQuote,
  activeTab,
  setActiveTab,
  quoteRef,
  markupPercent,
  draftsCount = 0,
  autoSaveStatus = 'saved',
  lastAutoSavedAt = null,
  onOpenDrafts,
  cloudSyncStatus = 'synced',
  totalPropertiesCount
}) => {
  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3.5">
            <TusafiriLogo variant="full" theme="dark" size="md" />
            <div className="hidden lg:block pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Master Costing Engine
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Ref: <strong className="text-slate-200 font-mono">{quoteRef}</strong></span>
                <span>•</span>
                <span className="inline-flex items-center text-emerald-400 gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Markup: {markupPercent}%
                </span>
                <span>•</span>
                {/* Auto-Save Live Status Pill */}
                <button
                  type="button"
                  onClick={onOpenDrafts}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition-colors"
                  title="View Auto-Saved Drafts in Database"
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      autoSaveStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      autoSaveStatus === 'saving' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  </span>
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>
                    {autoSaveStatus === 'saving'
                      ? 'Auto-saving...'
                      : lastAutoSavedAt
                      ? `Draft Saved (${draftsCount})`
                      : 'Auto-save Ready'}
                  </span>
                </button>
                <span>•</span>
                {/* Cloud Master Database Live Sync Indicator */}
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors"
                  title="Master Safari Database Persisted on Server & Live Across All Sessions"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    cloudSyncStatus === 'synced' ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' :
                    cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span>
                    {cloudSyncStatus === 'syncing'
                      ? 'Syncing Cloud DB...'
                      : totalPropertiesCount
                      ? `Master DB: ${totalPropertiesCount} Lodges`
                      : 'Cloud DB Connected'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-costing"
              onClick={() => setActiveTab('costing')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'costing'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Master Costing
            </button>
            <button
              id="nav-tab-quote"
              onClick={() => setActiveTab('quote')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quote'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Printer className="w-4 h-4" />
              Client Itinerary Quote
            </button>
            <button
              id="nav-tab-database"
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              STO & Park Fee Databases
            </button>
            <button
              id="nav-tab-scenarios"
              onClick={() => setActiveTab('scenarios')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Scenario Auditor
            </button>
            <button
              id="nav-tab-pipeline"
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pipeline'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Pipeline
            </button>
            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Quick Actions & Currency Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2 py-1">
              <span className="text-xs text-slate-400 mr-1.5 font-medium">FX:</span>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-none cursor-pointer"
              >
                {(Object.keys(FX_RATES_DATABASE) as CurrencyCode[]).map((code) => (
                  <option key={code} value={code} className="bg-slate-800 text-white">
                    {code} ({FX_RATES_DATABASE[code].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Save Quote */}
            <button
              id="btn-save-quote"
              onClick={onSaveQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              title="Save to Pipeline"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            {/* Export Excel Workbook */}
            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              title="Download full multi-tab Master Costing Excel Workbook"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span> .xlsx
            </button>

            {/* New Client Itinerary */}
            <button
              id="btn-new-itinerary"
              onClick={onNewItinerary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              title="Start a new blank itinerary from scratch"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Client</span>
            </button>

            {/* Print Quote */}
            <button
              id="btn-print-quote"
              onClick={onPrintQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              title="Print client quotation or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Reset Defaults */}
            <button
              id="btn-reset-defaults"
              onClick={onResetDefaults}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
              title="Reset itinerary and quotation to standard default template"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
