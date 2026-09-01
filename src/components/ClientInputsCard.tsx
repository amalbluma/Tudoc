import React from 'react';
import { Calendar, CheckCircle2, DollarSign, HelpCircle, Percent, Users, BedDouble, FileText } from 'lucide-react';
import { ClientQuotationInputs } from '../types/costing';

export interface ClientInputsCardProps {
  inputs: ClientQuotationInputs;
  onChange?: (newInputs: ClientQuotationInputs) => void;
  setInputs?: React.Dispatch<React.SetStateAction<ClientQuotationInputs>> | ((newInputs: ClientQuotationInputs) => void);
  totalNights?: number;
  calculatedDaysCount?: number;
  onDaysChange?: (newDays: number) => void;
}

export const ClientInputsCard: React.FC<ClientInputsCardProps> = ({
  inputs,
  onChange,
  setInputs,
  totalNights,
  calculatedDaysCount,
  onDaysChange
}) => {
  const handleUpdate = (newInputs: ClientQuotationInputs) => {
    if (typeof onChange === 'function') {
      onChange(newInputs);
    } else if (typeof setInputs === 'function') {
      setInputs(newInputs);
    }
  };

  const updateField = <K extends keyof ClientQuotationInputs>(field: K, value: ClientQuotationInputs[K]) => {
    handleUpdate({
      ...inputs,
      [field]: value
    });
  };

  const updateRoomField = (roomType: keyof ClientQuotationInputs['roomConfig'], val: number) => {
    const safeVal = Math.max(0, val);
    handleUpdate({
      ...inputs,
      roomConfig: {
        ...inputs.roomConfig,
        [roomType]: safeVal
      }
    });
  };

  const totalPax = (inputs?.paxAdults || 1) + (inputs?.paxChildren || 0);
  const displayNights = totalNights ?? (calculatedDaysCount ? Math.max(1, calculatedDaysCount - 1) : 1);

  return (
    <div id="client-inputs-card" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="bg-slate-900 px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold tracking-wide">Client & Quotation Parameters</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>Total Safari Nights: <strong className="text-amber-400">{displayNights} Nights</strong></span>
          <span>•</span>
          <span>Total Pax: <strong className="text-white">{totalPax} Guests</strong></span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 text-slate-800">
        
        {/* Client Name & Reference */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Client / Party Name
            </label>
            <input
              id="input-client-name"
              type="text"
              value={inputs.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              placeholder="e.g. Dr. Alistair Vance Group"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Quotation Reference #
            </label>
            <input
              id="input-quote-ref"
              type="text"
              value={inputs.quoteReference}
              onChange={(e) => updateField('quoteReference', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-slate-700 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Itinerary Type
            </label>
            <select
              id="input-itinerary-type"
              value={inputs.itineraryType || 'fit'}
              onChange={(e) => updateField('itineraryType', e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold bg-white"
            >
              <option value="fit">FIT Itinerary (Tailormade)</option>
              <option value="group">Group Itinerary (Private Charter)</option>
              <option value="scheduled_departure">Scheduled Departure (Guaranteed Seat)</option>
            </select>
          </div>
        </div>

        {/* Travel Dates & Days & Tier */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Start Date
              </label>
              <input
                id="input-start-date"
                type="date"
                value={inputs.travelStartDate}
                onChange={(e) => updateField('travelStartDate', e.target.value)}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 whitespace-nowrap">
                Number of Days
              </label>
              <input
                id="input-number-days"
                type="number"
                min="1"
                max="30"
                value={inputs.durationDays || totalNights}
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  if (!isNaN(days) && days > 0) {
                    updateField('durationDays', days);
                    if (onDaysChange) {
                      onDaysChange(days);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Travel Style & Tier
            </label>
            <select
              id="input-travel-tier"
              value={inputs.travelStyleTier || 'Semi-Luxury / Premium Classic'}
              onChange={(e) => updateField('travelStyleTier', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold bg-white"
            >
              <option value="Budget / Camping Safari">Budget / Camping Safari (Value)</option>
              <option value="Mid-Range / Standard Comfort">Mid-Range / Standard Comfort (3-4 Star)</option>
              <option value="Semi-Luxury / Premium Classic">Semi-Luxury / Premium Classic (4.5 Star)</option>
              <option value="Luxury Tented Safari (5-Star)">Luxury Tented Safari (5-Star Signature)</option>
              <option value="Ultra-Luxury / Connoisseur VIP">Ultra-Luxury / Connoisseur VIP</option>
              <option value="Flying Safari Express">Flying Safari Express (Aero)</option>
              <option value="Family & Conservation Safari">Family & Conservation Safari</option>
              <option value="Photographic & Specialist Expedition">Photographic & Specialist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Lead Source / Agency
            </label>
            <input
              id="input-lead-source"
              type="text"
              value={inputs.agencyOrLead}
              onChange={(e) => updateField('agencyOrLead', e.target.value)}
              placeholder="Direct Tusafiri Client / Agent"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Passenger Numbers */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            Passenger Numbers
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Adults (12+)</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField('paxAdults', Math.max(1, inputs.paxAdults - 1))}
                  className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  id="input-pax-adults"
                  type="number"
                  min="1"
                  max="40"
                  value={inputs.paxAdults}
                  onChange={(e) => updateField('paxAdults', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center py-1 text-sm font-semibold border border-slate-300 rounded bg-white"
                />
                <button
                  type="button"
                  onClick={() => updateField('paxAdults', inputs.paxAdults + 1)}
                  className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Children (3-11)</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField('paxChildren', Math.max(0, inputs.paxChildren - 1))}
                  className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  id="input-pax-children"
                  type="number"
                  min="0"
                  max="20"
                  value={inputs.paxChildren}
                  onChange={(e) => updateField('paxChildren', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center py-1 text-sm font-semibold border border-slate-300 rounded bg-white"
                />
                <button
                  type="button"
                  onClick={() => updateField('paxChildren', inputs.paxChildren + 1)}
                  className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Room Configuration */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-slate-500" />
            Room Layout (SRS / Double)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-600">Single (SRS):</span>
              <input
                id="input-single-rooms"
                type="number"
                min="0"
                value={inputs.roomConfig.singleRooms}
                onChange={(e) => updateRoomField('singleRooms', parseInt(e.target.value) || 0)}
                className="w-12 text-center py-0.5 font-bold border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-600">Twin/Double:</span>
              <input
                id="input-double-rooms"
                type="number"
                min="0"
                value={inputs.roomConfig.doubleTwinRooms}
                onChange={(e) => updateRoomField('doubleTwinRooms', parseInt(e.target.value) || 0)}
                className="w-12 text-center py-0.5 font-bold border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-600">Triple:</span>
              <input
                id="input-triple-rooms"
                type="number"
                min="0"
                value={inputs.roomConfig.tripleRooms}
                onChange={(e) => updateRoomField('tripleRooms', parseInt(e.target.value) || 0)}
                className="w-12 text-center py-0.5 font-bold border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-600">Family:</span>
              <input
                id="input-family-rooms"
                type="number"
                min="0"
                value={inputs.roomConfig.familyRooms}
                onChange={(e) => updateRoomField('familyRooms', parseInt(e.target.value) || 0)}
                className="w-12 text-center py-0.5 font-bold border border-slate-300 rounded bg-white"
              />
            </div>
          </div>
        </div>

      </div>

      {/* OPERATOR MARKUP / MARGIN CONTROL (HIGHLIGHTED MANDATORY REQUIREMENT) */}
      <div className="bg-amber-50/70 border-t border-b border-amber-200/80 px-5 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center p-1 rounded bg-amber-500 text-slate-950 font-bold">
                <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Tusafiri Africa Safaris — Operator Markup / Margin %
              </h3>
              <span className="text-xs bg-amber-200/60 text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-300">
                Centralized Dynamic Input
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Default is <strong>10.0%</strong>. Changing this value instantly recalculates all downstream selling prices and per-person rates across the entire costing engine and client quote.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Quick preset buttons */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-amber-300/80 shadow-xs">
              {[
                { label: '10% (Default)', val: 10 },
                { label: '12% (Std)', val: 12 },
                { label: '15%', val: 15 },
                { label: '20% (VIP)', val: 20 }
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  id={`btn-preset-markup-${preset.val}`}
                  onClick={() => updateField('operatorMarkupPercent', preset.val)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    inputs.operatorMarkupPercent === preset.val
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-amber-100/60'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Direct Number Input */}
            <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-amber-400 shadow-xs">
              <span className="text-xs font-medium text-slate-500 mr-2">Custom %:</span>
              <input
                id="input-operator-markup"
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={inputs.operatorMarkupPercent}
                onChange={(e) => updateField('operatorMarkupPercent', Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 text-center font-bold text-base text-slate-900 border-b-2 border-amber-500 focus:outline-none"
              />
              <span className="text-sm font-bold text-amber-600 ml-1">%</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
