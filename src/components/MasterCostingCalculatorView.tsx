import React, { useState } from 'react';
import { SearchableSelect } from './ui/SearchableSelect';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  Check,
  Sliders,
  Calendar,
  Building2,
  Truck,
  TreePine,
  Activity,
  Utensils,
  Plane,
  Calculator
} from 'lucide-react';
import {
  ActivityOption,
  ClientQuotationInputs,
  CostingTotals,
  DayCostBreakdown,
  ExtraOperationalCost,
  FlightOption,
  ItineraryDay,
  ParkFeeRecord,
  STOAccommodationProperty,
  TransportOption,
  ValidationItem,
} from '../types/costing';
import { ClientInputsCard } from './ClientInputsCard';
import { ScenarioAuditor } from './ScenarioAuditor';
import { FinancialSummaryPanel } from './FinancialSummaryPanel';

export type CostingCategoryTab =
  | 'setup'
  | 'accommodation'
  | 'transport'
  | 'park_fees'
  | 'activities'
  | 'meals'
  | 'flights'
  | 'markup_engine'
  | 'financial_summary';

interface MasterCostingCalculatorViewProps {
  clientInputs: ClientQuotationInputs;
  setClientInputs: React.Dispatch<React.SetStateAction<ClientQuotationInputs>>;
  itinerary: ItineraryDay[];
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryDay[]>>;
  dayBreakdowns: DayCostBreakdown[];
  totals: CostingTotals;
  validations: ValidationItem[];
  stoDatabase: STOAccommodationProperty[];
  setStoDatabase: React.Dispatch<React.SetStateAction<STOAccommodationProperty[]>>;
  parkFeesDatabase: ParkFeeRecord[];
  transportDatabase: TransportOption[];
  flightsDatabase: FlightOption[];
  activitiesDatabase: ActivityOption[];
  extrasDatabase: ExtraOperationalCost[];
  onConvertToQuote: () => void;
  onExportCsv: () => void;
  onOpenNewCosting?: () => void;
}

export const MasterCostingCalculatorView: React.FC<MasterCostingCalculatorViewProps> = ({
  clientInputs,
  setClientInputs,
  itinerary,
  setItinerary,
  dayBreakdowns,
  totals,
  validations,
  stoDatabase,
  setStoDatabase,
  parkFeesDatabase,
  transportDatabase,
  flightsDatabase,
  activitiesDatabase,
  extrasDatabase,
  onConvertToQuote,
  onExportCsv,
  onOpenNewCosting,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<CostingCategoryTab>('accommodation');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [editingMarkup, setEditingMarkup] = useState(false);

  // Category Tabs Configuration matching Wireframe Page 1
  const categoryTabs = [
    { id: 'setup' as CostingCategoryTab, label: 'Trip Setup', icon: Calendar },
    { id: 'accommodation' as CostingCategoryTab, label: 'Accommodation', icon: Building2 },
    { id: 'transport' as CostingCategoryTab, label: 'Transport', icon: Truck },
    { id: 'park_fees' as CostingCategoryTab, label: 'Park Fees', icon: TreePine },
    { id: 'activities' as CostingCategoryTab, label: 'Activities', icon: Activity },
    { id: 'meals' as CostingCategoryTab, label: 'Meals', icon: Utensils },
    { id: 'flights' as CostingCategoryTab, label: 'Flights', icon: Plane },
    { id: 'markup_engine' as CostingCategoryTab, label: 'Markup Engine', icon: Sliders },
    { id: 'financial_summary' as CostingCategoryTab, label: 'Financial Summary', icon: Calculator },
  ];

  // Helper to update an itinerary day's property
  const handleUpdateDayProperty = (dayIndex: number, propertyId: string) => {
    setItinerary(prev => {
      const updated = [...prev];
      if (updated[dayIndex]) {
        updated[dayIndex] = {
          ...updated[dayIndex],
          propertyId,
        };
      }
      return updated;
    });
  };

  const handleUpdateDayRoomType = (dayIndex: number, roomType: any) => {
    setItinerary(prev => {
      const updated = [...prev];
      if (updated[dayIndex]) {
        updated[dayIndex] = {
          ...updated[dayIndex],
          roomType,
        };
      }
      return updated;
    });
  };

  const handleUpdateDayRooms = (dayIndex: number, numberOfRooms: number) => {
    setItinerary(prev => {
      const updated = [...prev];
      if (updated[dayIndex]) {
        updated[dayIndex] = {
          ...updated[dayIndex],
          numberOfRooms: Math.max(1, numberOfRooms),
        };
      }
      return updated;
    });
  };

  const handleUpdateDayNights = (dayIndex: number, nights: number) => {
    setItinerary(prev => {
      const updated = [...prev];
      if (updated[dayIndex]) {
        updated[dayIndex] = {
          ...updated[dayIndex],
          nights: Math.max(1, nights),
        };
      }
      return updated;
    });
  };

  const handleAddItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    const defaultProp = stoDatabase[0]?.id || 'prop-angama-mara';
    const defaultPark = parkFeesDatabase[0]?.id || 'park-maasai-mara-nr';
    const defaultVehicle = transportDatabase[0]?.id || 'veh-land-cruiser-4x4';

    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} — Safari Exploration`,
      destination: itinerary[itinerary.length - 1]?.destination || 'Maasai Mara',
      country: itinerary[itinerary.length - 1]?.country || 'Kenya',
      parkFeeId: defaultPark,
      propertyId: defaultProp,
      nights: 1,
      roomType: 'Twin/Double',
      numberOfRooms: 2,
      transportVehicleId: defaultVehicle,
      includeVehicleThisDay: true,
      activityIds: [],
      notes: 'Game drive with professional driver-guide.',
    };

    setItinerary(prev => [...prev, newDay]);
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (itinerary.length <= 1) {
      alert('Itinerary must have at least 1 day.');
      return;
    }
    setItinerary(prev => prev.filter((_, idx) => idx !== dayIndex).map((d, i) => ({ ...d, dayNumber: i + 1 })));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOP BREADCRUMB & HEADER BAR (Matching Page 1 wireframe) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Financials</span>
          <span className="text-slate-300">›</span>
          <h2 className="text-sm font-bold text-slate-900">Master Costing Calculator</h2>

          {/* Reference Badge */}
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {clientInputs.quoteReference || '#C-9082'}
          </span>

          {/* Client Name & Travel Date */}
          <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {clientInputs.clientName || 'Aris Thorne'}
          </span>
          <span className="text-xs text-slate-400">
            {clientInputs.travelStartDate ? new Date(clientInputs.travelStartDate).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Oct 2024'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNewCosting && (
            <button
              id="btn-open-new-costing-modal"
              type="button"
              onClick={onOpenNewCosting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Costing</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onConvertToQuote}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-colors active:scale-95"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Convert to Quote</span>
          </button>
        </div>
      </div>

      {/* DARK KPI SUMMARY STRIP (Matching Page 1 wireframe) */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Net Cost */}
          <div className="border-r border-slate-800/80 pr-3">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              TOTAL NET COST
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ${totals.totalDirectNetCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Total Markup */}
          <div className="border-r border-slate-800/80 pr-3">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              TOTAL MARKUP
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-baseline gap-1">
              +${totals.operatorMarkupAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-emerald-500/90 font-medium">({totals.operatorMarkupPercent}%)</span>
            </div>
          </div>

          {/* Selling Price */}
          <div className="border-r border-slate-800/80 pr-3">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1">
              SELLING PRICE
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              ${totals.grandSellingPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Price Per Pax */}
          <div className="border-r border-slate-800/80 pr-3">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              PRICE PER PAX
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ${totals.pricePerPersonUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Expected Profit */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              EXPECTED PROFIT
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ${totals.operatorMarkupAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* COSTING CATEGORY TABS (Matching Page 1 wireframe) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`costing-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TAB CONTENT AREA */}
      {activeCategoryTab === 'accommodation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Accommodation Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Accommodation Costing</h3>
              <p className="text-xs text-slate-500">
                Rates pulled from Master Rate Database (Peak Season 2024 / STO Wholesale)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategoryTab('markup_engine')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                Bulk Edit Rates
              </button>
              <button
                type="button"
                onClick={handleAddItineraryDay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Property</span>
              </button>
            </div>
          </div>

          {/* Interactive Accommodation Costing Table (Page 1 Grid) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Room Type</th>
                  <th className="py-3 px-3">Basis</th>
                  <th className="py-3 px-3 text-center">Rooms</th>
                  <th className="py-3 px-3 text-center">Nights</th>
                  <th className="py-3 px-3 text-center">Pax</th>
                  <th className="py-3 px-3 text-right">Rate (Net)</th>
                  <th className="py-3 px-3 text-right">Total (Net)</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itinerary.map((day, idx) => {
                  const prop = stoDatabase.find(p => p.id === day.propertyId) || stoDatabase[0];
                  const season = prop?.seasons[0];
                  const ppsRate = season?.ppsUsd || 850;
                  const totalPax = (clientInputs.paxAdults || 4) + (clientInputs.paxChildren || 0);
                  const calculatedRowTotal = dayBreakdowns[idx]?.accommodationNetUsd || (ppsRate * totalPax * day.nights);

                  return (
                    <tr key={day.dayNumber} className="hover:bg-slate-50/80 transition-colors">
                      {/* Destination */}
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {day.destination}
                      </td>

                      {/* Property Selector */}
                      <td className="py-3 px-3">
                        <div className="w-[200px]">
                          <SearchableSelect
                            value={day.propertyId}
                            onChange={(val) => handleUpdateDayProperty(idx, val)}
                            options={stoDatabase.map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: p.region
                            }))}
                            placeholder="-- Select Property --"
                            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                          />
                        </div>
                      </td>

                      {/* Room Type */}
                      <td className="py-3 px-3">
                        <select
                          aria-label={`Room type for day ${day.dayNumber}`}
                          value={day.roomType}
                          onChange={(e) => handleUpdateDayRoomType(idx, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:outline-hidden focus:border-amber-500"
                        >
                          <option value="Twin/Double">Luxury Tented Suite</option>
                          <option value="Single">Single Deluxe Suite</option>
                          <option value="Triple">Horizon Room</option>
                          <option value="Family">Family Villa Suite</option>
                        </select>
                      </td>

                      {/* Board Basis */}
                      <td className="py-3 px-3 font-medium text-slate-600">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                          {prop?.boardBasis?.split(' ')[0] || 'Full Board'}
                        </span>
                      </td>

                      {/* Rooms */}
                      <td className="py-3 px-3 text-center">
                        <input
                          aria-label={`Number of rooms for day ${day.dayNumber}`}
                          type="number"
                          min="1"
                          max="10"
                          value={day.numberOfRooms || 2}
                          onChange={(e) => handleUpdateDayRooms(idx, parseInt(e.target.value) || 1)}
                          className="w-12 text-center bg-slate-50 border border-slate-200 rounded px-1 py-1 font-semibold"
                        />
                      </td>

                      {/* Nights */}
                      <td className="py-3 px-3 text-center">
                        <input
                          aria-label={`Number of nights for day ${day.dayNumber}`}
                          type="number"
                          min="1"
                          max="14"
                          value={day.nights || 1}
                          onChange={(e) => handleUpdateDayNights(idx, parseInt(e.target.value) || 1)}
                          className="w-12 text-center bg-slate-50 border border-slate-200 rounded px-1 py-1 font-semibold"
                        />
                      </td>

                      {/* Pax */}
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {totalPax}
                      </td>

                      {/* Rate (Net) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                        ${ppsRate.toFixed(2)}
                      </td>

                      {/* Total Net */}
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        ${calculatedRowTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotal Accommodation Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-600">
              Subtotal Accommodation (Net)
            </span>
            <span className="text-lg font-black text-slate-900 font-mono">
              ${totals.totalAccommodationNetUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* TRIP SETUP TAB */}
      {activeCategoryTab === 'setup' && (
        <ClientInputsCard
          inputs={clientInputs}
          setInputs={setClientInputs}
          onChange={setClientInputs}
          totalNights={Math.max(1, itinerary.length - 1)}
          calculatedDaysCount={itinerary.length}
        />
      )}

      {/* TRANSPORT TAB */}
      {activeCategoryTab === 'transport' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transport & Safari Vehicles</h3>
              <p className="text-xs text-slate-500">4x4 Safari Land Cruisers, Fuel, Driver-Guide Allowances</p>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">
              Subtotal: ${totals.totalTransportNetUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {transportDatabase.map((veh, idx) => (
              <div key={`${veh.id}-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{veh.name}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    ${veh.dailyRateHighUsd}/day
                  </span>
                </div>
                <p className="text-xs text-slate-500">{veh.includes}</p>
                <div className="text-[11px] text-slate-600 font-medium">
                  Driver Allowance: ${veh.driverAllowanceDailyUsd}/day • Capacity: {veh.maxCapacity} window seats
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARK FEES TAB */}
      {activeCategoryTab === 'park_fees' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Park & Conservancy Tariffs</h3>
              <p className="text-xs text-slate-500">KWS, Narok County, TANAPA 2024-2026 Official Tariffs</p>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">
              Subtotal: ${(totals?.totalParkFeesNetUsd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Park / Conservancy</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Authority</th>
                  <th className="py-2.5 px-3 text-right">Adult High Fee</th>
                  <th className="py-2.5 px-3 text-right">Adult Low Fee</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parkFeesDatabase.map((park, idx) => (
                  <tr key={`${park.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{park.parkName}</td>
                    <td className="py-2.5 px-3">{park.country}</td>
                    <td className="py-2.5 px-3 text-slate-500">{park.officialAuthority}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">${park.highSeasonFeeUsd}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">${park.lowSeasonFeeUsd}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVITIES TAB */}
      {activeCategoryTab === 'activities' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Activities & Excursions</h3>
              <p className="text-xs text-slate-500">Hot Air Balloons, Walking Safaris, Dhow Cruises</p>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">
              Subtotal: ${(totals?.totalActivitiesNetUsd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activitiesDatabase.map((act, idx) => (
              <div key={`${act.id}-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{act.name}</span>
                  <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    ${act.ratePerPaxUsd}/pax
                  </span>
                </div>
                <p className="text-xs text-slate-500">{act.description}</p>
                <div className="text-[11px] text-slate-400 font-medium">{act.location} • {act.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEALS TAB */}
      {activeCategoryTab === 'meals' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Meals & Special Bush Dining</h3>
            <p className="text-xs text-slate-500">Full Board Lodge Inclusions vs Special Bush Dinners / Sundowners</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Full Board / All Inclusive Rates Active:</strong> All standard meals (Breakfast, Lunch, Dinner) are directly included in the contracted STO accommodation rates.
            </div>
          </div>
        </div>
      )}

      {/* FLIGHTS TAB */}
      {activeCategoryTab === 'flights' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bush Flights & Airstrip Transfers</h3>
              <p className="text-xs text-slate-500">Safarilink, AirKenya, Coastal Aviation scheduled flights</p>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">
              Subtotal: ${(totals?.totalFlightsNetUsd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flightsDatabase.map((flt, idx) => (
              <div key={`${flt.id}-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{flt.route}</div>
                  <div className="text-[11px] text-slate-500">{flt.airline} • {flt.baggageLimitKg}kg soft bag limit</div>
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">
                  ${flt.oneWayRateUsd}/pax
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MARKUP ENGINE TAB */}
      {activeCategoryTab === 'markup_engine' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Dynamic Markup & Profit Margin Engine</h3>
            <p className="text-xs text-slate-500">Set commercial margins, agency commissions, and VAT rules</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Operator Markup:</span>
              <span className="text-lg font-black text-amber-600">{clientInputs.operatorMarkupPercent}%</span>
            </div>

            <input
              aria-label="Operator markup percentage slider"
              type="range"
              min="5"
              max="35"
              step="0.5"
              value={clientInputs.operatorMarkupPercent}
              onChange={(e) => setClientInputs(prev => ({ ...prev, operatorMarkupPercent: parseFloat(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Net Cost</span>
                <strong className="text-slate-900">${totals.totalDirectNetCostUsd.toFixed(0)}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Profit Margin</span>
                <strong className="text-emerald-600">+${totals.operatorMarkupAmountUsd.toFixed(0)}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Selling Total</span>
                <strong className="text-amber-600">${totals.grandSellingPriceUsd.toFixed(0)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL SUMMARY TAB */}
      {activeCategoryTab === 'financial_summary' && (
        <FinancialSummaryPanel
          totals={totals}
          clientInputs={clientInputs}
          setClientInputs={setClientInputs}
          dayBreakdowns={dayBreakdowns}
          onSaveQuote={() => onConvertToQuote()}
          onOpenQuotePreview={() => onConvertToQuote()}
        />
      )}

      {/* BOTTOM PANELS: PRICING HIERARCHY + FINANCIAL ALERTS & VALIDATION (Page 1 Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRICING HIERARCHY (1 Col) */}
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Pricing Hierarchy</span>
            </h4>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Supplier Net Rates</div>
                  <div className="text-[11px] text-slate-500">Contracted STO & Park wholesale fees</div>
                </div>
              </div>

              <div className="pl-3 text-amber-400 text-xs">↓</div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Internal Cost Aggregation</div>
                  <div className="text-[11px] text-slate-500">Accommodation, transport, flights & extras</div>
                </div>
              </div>

              <div className="pl-3 text-amber-400 text-xs">↓</div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dynamic Markup Engine</div>
                  <div className="text-[11px] text-slate-500">Commercial margin + currency FX output</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] text-amber-900/80 font-medium">
            Strict separation maintained: Client quotes never expose Supplier Net STO figures.
          </div>
        </div>

        {/* FINANCIAL ALERTS & VALIDATION (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Financial Alerts & Validation</span>
            </h4>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Audit Clear
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Alert 1 */}
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-900">Missing supplier rate for 'Ngorongoro Transfer'</div>
                <div className="text-[11px] text-rose-700 mt-0.5">Applied default 4x4 standard tariff ($180.00).</div>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-amber-900">Expired rate: Angama Mara (Valid to Oct 2024)</div>
                <div className="text-[11px] text-amber-700 mt-0.5">2025/2026 STO rate updated automatically.</div>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-blue-900">Park fees automatically updated for Nov 2024</div>
                <div className="text-[11px] text-blue-700 mt-0.5">KWS non-resident seasonal rates synchronized.</div>
              </div>
            </div>

            {/* Alert 4 */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-emerald-900">All taxes and seasonal supplements applied</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Single supplements and child factors calculated.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
