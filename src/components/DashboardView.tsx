import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Compass,
  Plus,
  ArrowUpRight,
  Sparkles,
  Download,
  Calendar,
  Building2,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sliders,
  Check,
  ShieldCheck,
  Plane,
  Truck,
  ArrowRight
} from 'lucide-react';
import {
  ActiveSafariExpedition,
  CurrencyCode,
  EnquiryItem,
  SavedQuote,
  UpcomingTripItem,
} from '../types/costing';
import {
  INITIAL_EXPEDITIONS,
  INITIAL_UPCOMING_TRIPS,
} from '../data/operationsData';
import { TusafiriLogo } from './TusafiriLogo';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  savedQuotes: SavedQuote[];
  onOpenNewEnquiry: () => void;
  onOpenAddTrip: () => void;
  onOpenRateImporter: () => void;
  onLoadQuoteIntoCosting?: (quote: SavedQuote) => void;
  selectedCurrency: CurrencyCode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  savedQuotes,
  onOpenNewEnquiry,
  onOpenAddTrip,
  onOpenRateImporter,
  onLoadQuoteIntoCosting,
  selectedCurrency,
}) => {
  const [tripFilter, setTripFilter] = useState<'All' | 'Kenya' | 'Tanzania'>('All');
  const [tripSort, setTripSort] = useState<'date' | 'pax' | 'amount'>('date');
  const [projectionSeason, setProjectionSeason] = useState<'Q4 2024' | 'Q1 2025' | 'Peak Wildebeest Migration'>('Q4 2024');
  const [migrationMultiplier, setMigrationMultiplier] = useState<number>(1.25);

  // Month Projection Data
  const monthlyData = [
    { month: 'May', bookings: 140, revenue: 180 },
    { month: 'Jun', bookings: 210, revenue: 260 },
    { month: 'Jul', bookings: 320, revenue: 410 },
    { month: 'Aug', bookings: 380, revenue: 490 },
    { month: 'Sep', bookings: 340, revenue: 440 },
    { month: 'Oct', bookings: 290, revenue: 380 },
    { month: 'Nov', bookings: 210, revenue: 270 },
    { month: 'Dec', bookings: 350, revenue: 460 },
    { month: 'Jan', bookings: 270, revenue: 350 },
    { month: 'Feb', bookings: 230, revenue: 300 },
    { month: 'Mar', bookings: 180, revenue: 230 },
    { month: 'Apr', bookings: 150, revenue: 190 },
  ];

  // Volume Bar Data for Simulation
  const baseVolumeBars = [
    { id: 1, height: 45, label: 'Oct W1' },
    { id: 2, height: 55, label: 'Oct W2' },
    { id: 3, height: 75, label: 'Oct W3', peak: true },
    { id: 4, height: 85, label: 'Oct W4', peak: true },
    { id: 5, height: 60, label: 'Nov W1' },
    { id: 6, height: 50, label: 'Nov W2' },
    { id: 7, height: 65, label: 'Nov W3' },
    { id: 8, height: 80, label: 'Nov W4' },
    { id: 9, height: 95, label: 'Dec W1', peak: true },
    { id: 10, height: 100, label: 'Dec W2', peak: true },
    { id: 11, height: 90, label: 'Dec W3', peak: true },
    { id: 12, height: 70, label: 'Dec W4' },
  ];

  const filteredTrips = INITIAL_UPCOMING_TRIPS.filter((t) => {
    if (tripFilter === 'Kenya') return t.destination.toLowerCase().includes('mara') || t.destination.toLowerCase().includes('kenya');
    if (tripFilter === 'Tanzania') return t.destination.toLowerCase().includes('serengeti') || t.destination.toLowerCase().includes('zanzibar');
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <TusafiriLogo variant="icon" theme="dark" size="sm" />
          <div className="border-l border-slate-800 pl-3.5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Operations Briefing</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-amber-400 font-semibold">Tusafiri Live Dispatch</span>
            </h2>
            <p className="text-xs text-slate-400">East Africa Operations Center • Nairobi &amp; Arusha Hubs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
              KK
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-200 leading-tight">Kato K.</div>
              <div className="text-[10px] text-amber-400 font-medium">Head Tracker</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE PORTFOLIO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-lg">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold text-amber-400 mb-1">
              Active Portfolio
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                $482,900
              </h2>
              <span className="text-sm font-semibold text-slate-400">USD</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Outstanding balance · 45 active bookings across Kenya, Tanzania & Rwanda
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenNewEnquiry}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Enquiry</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('itineraries')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Itinerary</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('costing')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Costing</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('quote')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>New Quote</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('suppliers')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700/80 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Supplier</span>
            </button>

            <button
              type="button"
              onClick={onOpenRateImporter}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700/80 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Rate</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLUID CREATION PIPELINE BANNER & LAUNCHER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Safari Creation & Curation Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500">
              Fluid end-to-end workflow: from client inquiry to itinerary design, live costing, and luxury quotation
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewEnquiry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start New Client Pipeline</span>
          </button>
        </div>

        {/* 4-Step Interactive Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Step 1 */}
          <div
            onClick={onOpenNewEnquiry}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-400 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Step 1
              </span>
              <Users className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                Client Intake & Specs
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Log lead, travel dates, pax, travel tier, and estimated budget
              </p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>+ Log Lead & Proceed</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigateTab('itineraries')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-400 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Step 2
              </span>
              <Compass className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                Itinerary & Quote Curation
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Design day-by-day experience, STO lodges, activities & AI narratives
              </p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Open Curation Workspace</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigateTab('costing')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-400 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Step 3
              </span>
              <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                Master Costing & Rates
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Audit STO rates, park fees, 4x4 transport, markups & gross margins
              </p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Open Costing Engine</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => onNavigateTab('quote')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-400 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Step 4
              </span>
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                Client Proposal & Export
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Generate luxury branded quote document, PDF export & print
              </p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Preview Proposal</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 8 METRIC KPI CARDS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">New Enquiries</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +12%
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">24</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Quotes Pending</span>
          <div className="text-2xl font-black text-amber-600 mt-2">18</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Quotes Accepted</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">32</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Active Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-2">45</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Upcoming Departures</span>
          <div className="text-2xl font-black text-indigo-600 mt-2">12</div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Revenue</span>
          <div className="text-2xl font-black text-slate-900 mt-2">$482.9K</div>
        </div>

        {/* Metric 7 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Expected Profit</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">$118.5K</div>
        </div>

        {/* Metric 8 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Outstanding Payments</span>
          <div className="text-2xl font-black text-rose-600 mt-2">$94.2K</div>
        </div>
      </div>

      {/* ANALYTICS ROW: Projections Chart + Inquiry Conversion Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Booking Projections (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Booking Projections</h3>
              <p className="text-xs text-slate-500">Monthly bookings vs. projected revenue (USD)</p>
            </div>
            <select
              aria-label="Timeframe"
              className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option>This Year</option>
              <option>Q4 2024</option>
              <option>2025 Forecast</option>
            </select>
          </div>

          {/* Simple Visual Line & Area Graph */}
          <div className="h-56 w-full flex flex-col justify-end pt-4">
            <div className="flex-1 flex items-end justify-between gap-2 px-2 border-b border-slate-200 pb-2">
              {monthlyData.map((d, i) => {
                const heightPercent = (d.revenue / 500) * 100;
                const bookingHeight = (d.bookings / 500) * 100;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ${d.revenue}k Rev • {d.bookings} Bookings
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Booking bar */}
                      <div
                        style={{ height: `${bookingHeight}%` }}
                        className="w-2.5 bg-amber-400/80 rounded-t-sm group-hover:bg-amber-500 transition-all"
                      />
                      {/* Revenue bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-2.5 bg-slate-800 rounded-t-sm group-hover:bg-slate-900 transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{d.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-400" />
                <span>Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-800" />
                <span>Projected Revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Conversion Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inquiry Conversion</h3>
            <p className="text-xs text-slate-500">Quote acceptance ratio</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            {/* Conversion Donut Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 stroke-current"
                  strokeWidth="3.8"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 stroke-current"
                  strokeDasharray="78, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">78%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ratio</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around border-t border-slate-100 pt-3 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Quotes Pending
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">18</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Quotes Accepted
              </div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">32</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE SAFARI EXPEDITIONS (Live fleet dispatch) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm font-bold text-white">Active Safari Expeditions</h3>
            </div>
            <p className="text-xs text-slate-400">Live fleet dispatch · 6 safaris in motion</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('fleet')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Full Dispatch Board</span>
          </button>
        </div>

        {/* 3 Expedition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_EXPEDITIONS.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-850 p-4 rounded-xl border border-slate-750 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{exp.destination} · Day {exp.currentDay}/{exp.totalDays}</span>
                <span className="text-slate-300 font-medium">Guide: {exp.guideName}</span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">{exp.name}</h4>

              <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                <span>Departure: {exp.departureTime}</span>
                <span className="font-mono text-[11px] text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {exp.vehiclePlate}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-amber-400">{exp.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${exp.progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN BOTTOM GRID: Upcoming Trips + Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Trips</h3>
              <p className="text-xs text-slate-500">Scheduled departures and guest manifests</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Filter trips by country"
                value={tripFilter}
                onChange={(e) => setTripFilter(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                <option value="All">All</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
              </select>

              <button
                type="button"
                onClick={onOpenAddTrip}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Trip</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Travel Date</th>
                  <th className="py-2.5 px-3">Pax</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Consultant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{trip.client}</td>
                    <td className="py-3 px-3 text-slate-600">{trip.destination}</td>
                    <td className="py-3 px-3 text-slate-500">{trip.travelDate}</td>
                    <td className="py-3 px-3 font-medium">{trip.pax} Pax</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trip.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : trip.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            trip.status === 'Confirmed'
                              ? 'bg-emerald-500'
                              : trip.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{trip.consultant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Quotations (1 Col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Quotations</h3>
              <button
                type="button"
                onClick={() => onNavigateTab('costing')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Quote 1 */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">#QT-9082</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Accepted
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Miller Family · Rwanda Gorilla Trekking
                </div>
                <div className="text-[11px] text-slate-500 mb-2">Travel Nov 04, 2024</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">$18,400</span>
                  <span className="text-emerald-600 font-semibold">$3,680 profit</span>
                </div>
              </div>

              {/* Quote 2 */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">#QT-9081</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Chen Wei · Masai Mara Migration
                </div>
                <div className="text-[11px] text-slate-500 mb-2">Travel Oct 29, 2024</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">$12,750</span>
                  <span className="text-amber-600 font-semibold">$2,550 profit</span>
                </div>
              </div>

              {/* Quote 3 */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">#QT-9080</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Accepted
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Okafor Group · Kruger Big Five
                </div>
                <div className="text-[11px] text-slate-500 mb-2">Travel Dec 01, 2024</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">$24,900</span>
                  <span className="text-emerald-600 font-semibold">$5,976 profit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING VOLUME PROJECTION (Interactive migration demand simulator) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Booking Volume Projection</h3>
            <p className="text-xs text-slate-500">
              Drag to simulate peak wildebeest migration demand & seasonal pricing elasticity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulation Factor:</span>
              <strong className="text-slate-900 font-bold">{migrationMultiplier.toFixed(2)}x</strong>
            </div>

            <select
              aria-label="Season selection"
              value={projectionSeason}
              onChange={(e) => setProjectionSeason(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option value="Q4 2024">Q4 2024</option>
              <option value="Q1 2025">Q1 2025</option>
              <option value="Peak Wildebeest Migration">Peak Season</option>
            </select>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center gap-4">
          <span className="text-xs text-slate-600 font-medium shrink-0">Demand Surge Simulator:</span>
          <input
            type="range"
            min="0.8"
            max="1.8"
            step="0.05"
            value={migrationMultiplier}
            onChange={(e) => setMigrationMultiplier(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded shrink-0">
            {Math.round((migrationMultiplier - 1) * 100)}% Surge
          </span>
        </div>

        {/* Bar Visualizer */}
        <div className="h-32 flex items-end justify-between gap-2 pt-2 px-4 border-b border-slate-100 pb-2">
          {baseVolumeBars.map((bar) => {
            const calculatedHeight = Math.min(100, Math.round(bar.height * migrationMultiplier));
            return (
              <div key={bar.id} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    style={{ height: `${calculatedHeight}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      bar.peak
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 shadow-xs'
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{bar.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 px-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-amber-500" />
            <span>Peak Wildebeest Migration Weeks (High Demand / Full Board STO Required)</span>
          </div>
          <span className="text-emerald-700 font-semibold">Projected Capacity: 94%</span>
        </div>
      </div>
    </div>
  );
};
