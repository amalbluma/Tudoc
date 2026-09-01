import React, { useState } from 'react';
import { SearchableSelect } from './ui/SearchableSelect';
import {
  Bookmark,
  Building2,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Cloud,
  Copy,
  Flame,
  Info,
  Layers,
  MapPin,
  Palmtree,
  Plane,
  Plus,
  Trash2,
  Trees,
  Users
} from 'lucide-react';
import {
  ActivityOption,
  ClientQuotationInputs,
  DayCostBreakdown,
  FlightOption,
  ItineraryDay,
  ParkFeeRecord,
  STOAccommodationProperty,
  TransportOption
} from '../types/costing';
import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import { ACTIVITY_OPTIONS, FLIGHT_OPTIONS, TRANSPORT_OPTIONS } from '../data/transportAndExtrasData';
import { getSeasonForDate } from '../utils/costingEngine';

interface MasterCostingGridProps {
  itinerary: ItineraryDay[];
  breakdowns: DayCostBreakdown[];
  clientInputs: ClientQuotationInputs;
  stoProperties?: STOAccommodationProperty[];
  parkFees?: ParkFeeRecord[];
  transportOptions?: TransportOption[];
  flightOptions?: FlightOption[];
  activityOptions?: ActivityOption[];
  onUpdateItinerary: (newItinerary: ItineraryDay[]) => void;
  onSaveManualSnapshot?: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'unsaved' | 'disabled';
  lastAutoSavedAt?: Date | null;
}

export const MasterCostingGrid: React.FC<MasterCostingGridProps> = ({
  itinerary,
  breakdowns,
  clientInputs,
  stoProperties = STO_ACCOMMODATION_DATABASE,
  parkFees = PARK_FEES_DATABASE,
  transportOptions = TRANSPORT_OPTIONS,
  flightOptions = FLIGHT_OPTIONS,
  activityOptions = ACTIVITY_OPTIONS,
  onUpdateItinerary,
  onSaveManualSnapshot,
  autoSaveStatus = 'saved',
  lastAutoSavedAt = null
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const totalPax = clientInputs.paxAdults + clientInputs.paxChildren;

  const updateDay = (index: number, updates: Partial<ItineraryDay>) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], ...updates };
    onUpdateItinerary(updated);
  };

  const addDay = () => {
    const nextDayNum = itinerary.length + 1;
    const lastDay = itinerary[itinerary.length - 1] || {
      destination: 'Maasai Mara',
      country: 'Kenya',
      parkFeeId: 'park-maasai-mara',
      propertyId: 'prop-kichwa-tembo',
      transportVehicleId: 'veh-land-cruiser-4x4'
    };

    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} — Safari in ${lastDay.destination}`,
      destination: lastDay.destination,
      country: lastDay.country as any,
      parkFeeId: lastDay.parkFeeId,
      propertyId: lastDay.propertyId,
      nights: 1,
      roomType: 'Twin/Double',
      numberOfRooms: Math.max(1, clientInputs.roomConfig.doubleTwinRooms + clientInputs.roomConfig.singleRooms),
      transportVehicleId: lastDay.transportVehicleId,
      includeVehicleThisDay: true,
      activityIds: [],
      notes: 'Morning and afternoon game drives with dedicated driver-guide.',
      highlightSummary: 'Wildlife viewing and scenic savanna exploration.'
    };

    onUpdateItinerary([...itinerary, newDay]);
  };

  const duplicateDay = (index: number) => {
    const sourceDay = itinerary[index];
    const newDay: ItineraryDay = {
      ...sourceDay,
      dayNumber: itinerary.length + 1,
      title: `${sourceDay.title} (Additional Day)`
    };
    const updated = [...itinerary];
    updated.splice(index + 1, 0, newDay);
    // Renumber days
    const renumbered = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    onUpdateItinerary(renumbered);
  };

  const removeDay = (index: number) => {
    if (itinerary.length <= 1) return;
    const filtered = itinerary.filter((_, i) => i !== index);
    const renumbered = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    onUpdateItinerary(renumbered);
  };

  const toggleActivity = (dayIndex: number, actId: string) => {
    const currentDay = itinerary[dayIndex];
    const currentActs = currentDay.activityIds || [];
    const exists = currentActs.includes(actId);
    const newActs = exists
      ? currentActs.filter(id => id !== actId)
      : [...currentActs, actId];
    updateDay(dayIndex, { activityIds: newActs });
  };

  return (
    <div id="master-costing-grid" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Day-by-Day Master Costing Breakdown
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>
                {autoSaveStatus === 'saving'
                  ? 'Saving changes...'
                  : lastAutoSavedAt
                  ? 'Auto-Save Active'
                  : 'Auto-Save Ready'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula-driven line items pulling directly from the STO Rate & Park Fee databases.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveManualSnapshot && (
            <button
              id="btn-grid-snapshot"
              type="button"
              onClick={onSaveManualSnapshot}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
              title="Save a point-in-time draft snapshot to the database"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span>Snapshot Draft</span>
            </button>
          )}
          <button
            id="btn-add-day"
            type="button"
            onClick={addDay}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Safari Day
          </button>
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-3.5">
        {itinerary.map((day, index) => {
          const breakdown = breakdowns[index] || {
            dayTotalNetUsd: 0,
            accommodationNetUsd: 0,
            parkFeesNetUsd: 0,
            transportNetUsd: 0,
            flightNetUsd: 0,
            activitiesNetUsd: 0,
            formulaAuditText: ''
          };

          const isExpanded = expandedDay === day.dayNumber;
          const property = stoProperties.find(p => p.id === day.propertyId);
          const parkRecord = PARK_FEES_DATABASE.find(p => p.id === day.parkFeeId);
          
          // Compute season preview
          const { season } = getSeasonForDate(day.propertyId, clientInputs.travelStartDate, day.selectedSeasonId, stoProperties);

          return (
            <div
              key={day.dayNumber}
              id={`costing-day-${day.dayNumber}`}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Day Header Row */}
              <div className="p-4 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
                    D{day.dayNumber}
                  </span>
                  <div>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(index, { title: e.target.value })}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-500 focus:outline-none w-full sm:w-80"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {day.destination} ({day.country})
                      </span>
                      <span>•</span>
                      <span>{breakdown.accommodationName}</span>
                    </div>
                  </div>
                </div>

                {/* Day Net Financial Pill & Expand */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Day Net Cost</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ${(breakdown?.dayTotalNetUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <button
                      type="button"
                      onClick={() => duplicateDay(index)}
                      title="Duplicate Day"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDay(index)}
                      title="Delete Day"
                      disabled={itinerary.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Day Cost Summary Matrix (Always Visible) */}
              <div className="px-4 py-3 bg-white grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">STO Lodge</span>
                  <span className="font-bold text-slate-800">${breakdown.accommodationNetUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{season?.seasonName || 'Season'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Park / Fees</span>
                  <span className="font-bold text-slate-800">${breakdown.parkFeesNetUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{parkRecord?.parkName || 'None'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">4x4 Transport</span>
                  <span className="font-bold text-slate-800">${breakdown.transportNetUsd.toFixed(2)}</span>
                  {day.includeVehicleThisDay && totalPax > 0 ? (
                    <span className="text-[10px] font-medium text-emerald-600 block">
                      (${ (breakdown.transportNetUsd / totalPax).toFixed(0) } / pax)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">{day.includeVehicleThisDay ? 'Active' : 'No vehicle'}</span>
                  )}
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bush Flight</span>
                  <span className="font-bold text-slate-800">${breakdown.flightNetUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">{day.flightId ? 'Included' : 'None'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Activities</span>
                  <span className="font-bold text-slate-800">${breakdown.activitiesNetUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">{day.activityIds.length} experiences</span>
                </div>
              </div>

              {/* Audit Formula Trace Ribbon */}
              <div className="px-4 py-1.5 bg-amber-50/40 text-[11px] font-mono text-amber-900 border-b border-amber-100 flex items-center gap-1.5 overflow-x-auto">
                <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="whitespace-nowrap font-medium text-slate-600">Formula Audit:</span>
                <span className="whitespace-nowrap">{breakdown.formulaAuditText}</span>
              </div>

              {/* Detailed Configuration (Expanded View) */}
              {isExpanded && (
                <div className="p-5 bg-slate-50/50 space-y-4 text-xs">
                  
                  {/* Selectors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Destination & Country */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        Destination & Region
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={day.destination}
                          onChange={(e) => updateDay(index, { destination: e.target.value })}
                          placeholder="e.g. Maasai Mara"
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                        <select
                          value={day.country}
                          onChange={(e) => updateDay(index, { country: e.target.value as any })}
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option value="Kenya">Kenya</option>
                          <option value="Tanzania">Tanzania</option>
                        </select>
                      </div>

                      {/* Park / Conservancy Fee Database Selector */}
                      <div className="pt-2">
                        <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                          <Trees className="w-3.5 h-3.5 text-emerald-600" />
                          Park & Conservancy Fee
                        </label>
                        <SearchableSelect
                          value={day.parkFeeId || ''}
                          onChange={(val) => updateDay(index, { parkFeeId: val })}
                          options={parkFees.map(p => ({
                            value: p.id,
                            label: p.parkName,
                            subLabel: `${p.country} — High: $${p.highSeasonFeeUsd}/d | Low: $${p.lowSeasonFeeUsd}/d`
                          }))}
                          placeholder="No Park Fee"
                        />
                        {parkRecord && (
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Auth: {parkRecord.officialAuthority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* STO Accommodation Selector */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        STO Accommodation Property
                      </label>
                      <SearchableSelect
                        value={day.propertyId}
                        onChange={(val) => {
                          const newProp = stoProperties.find(p => p.id === val);
                          updateDay(index, {
                            propertyId: val,
                            selectedSeasonId: newProp?.seasons[0]?.id
                          });
                        }}
                        options={stoProperties.map(prop => ({
                          value: prop.id,
                          label: prop.name,
                          subLabel: `${prop.region} (${prop.boardBasis})`
                        }))}
                        placeholder="-- Select Property --"
                      />

                      {/* Manual Season Override if needed */}
                      {property && (
                        <div className="pt-1">
                          <label className="text-[11px] text-slate-500 block mb-0.5">
                            STO Season Rate ({property.sourceType}):
                          </label>
                          <select
                            value={day.selectedSeasonId || season?.id}
                            onChange={(e) => updateDay(index, { selectedSeasonId: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-amber-50/50 text-slate-800"
                          >
                            {property.seasons.map((s, sIdx) => (
                              <option key={`${s.id || 'season'}-${sIdx}`} value={s.id}>
                                {s.seasonName}: PPS ${s.ppsUsd} | SRS ${s.srsUsd} ({s.description})
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-emerald-700 block mt-1 font-medium">
                            Source Doc: {property.sourceDocument}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Transport & Flights */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-600" />
                          Vehicle & Driver Guide
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.includeVehicleThisDay}
                            onChange={(e) => updateDay(index, { includeVehicleThisDay: e.target.checked })}
                            className="rounded text-amber-500"
                          />
                          <span className="text-[10px] text-slate-500">Include Vehicle</span>
                        </label>
                      </div>

                      <div className={!day.includeVehicleThisDay ? 'opacity-50 pointer-events-none' : ''}>
                        <SearchableSelect
                          value={day.transportVehicleId}
                          onChange={(val) => updateDay(index, { transportVehicleId: val })}
                          options={transportOptions.map(v => ({
                            value: v.id,
                            label: v.name,
                            subLabel: `$${v.dailyRateHighUsd}/day`
                          }))}
                        />
                      </div>

                      {/* Flight Selector */}
                      <div className="pt-2">
                        <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                          <Plane className="w-3.5 h-3.5 text-sky-600" />
                          Bush / Scheduled Flights (Optional)
                        </label>
                        <SearchableSelect
                          value={day.flightId || ''}
                          onChange={(val) => updateDay(index, { flightId: val || undefined })}
                          options={flightOptions.map(f => ({
                            value: f.id,
                            label: f.route,
                            subLabel: `$${f.oneWayRateUsd}/pax (${f.airline})`
                          }))}
                          placeholder="No Domestic Flight"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Activities Checklist */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <label className="font-semibold text-slate-700 flex items-center gap-1 mb-2">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Add Activities & Excursions for Day {day.dayNumber}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {activityOptions.map((act, aIdx) => {
                        const isChecked = (day.activityIds || []).includes(act.id);
                        return (
                          <button
                            key={`${act.id}-${aIdx}`}
                            type="button"
                            onClick={() => toggleActivity(index, act.id)}
                            className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                              isChecked
                                ? 'bg-amber-500/15 border-amber-500 text-slate-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-semibold leading-tight">{act.name}</span>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>{act.location}</span>
                              <strong className="text-slate-800">
                                {act.ratePerVehicleUsd ? `$${act.ratePerVehicleUsd}/veh` : `$${act.ratePerPaxUsd}/pax`}
                              </strong>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Notes & Highlights for Client Quote */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Client Quotation Description & Highlights
                      </label>
                      <textarea
                        rows={2}
                        value={day.highlightSummary || ''}
                        onChange={(e) => updateDay(index, { highlightSummary: e.target.value })}
                        placeholder="Key wildlife experiences and safari highlights for the client quote document..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white mb-2"
                      />
                      <label className="font-semibold text-slate-700 block mb-1">
                        Cover Photo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={day.dayImage || ''}
                        onChange={(e) => updateDay(index, { dayImage: e.target.value })}
                        placeholder="https://example.com/safari-image.jpg"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Internal Operational Notes
                      </label>
                      <textarea
                        rows={2}
                        value={day.notes || ''}
                        onChange={(e) => updateDay(index, { notes: e.target.value })}
                        placeholder="Logistics, transfer timings, special dietary alerts..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
