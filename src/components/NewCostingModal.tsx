import React, { useState } from 'react';
import {
  X,
  DollarSign,
  Percent,
  Calendar,
  Users,
  Upload,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { ClientQuotationInputs, CurrencyCode, ItineraryDay } from '../types/costing';
import { DEFAULT_KENYA_ITINERARY } from '../data/defaultItineraries';

interface NewCostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCosting: (inputs: ClientQuotationInputs, days?: ItineraryDay[]) => void;
}

export const NewCostingModal: React.FC<NewCostingModalProps> = ({
  isOpen,
  onClose,
  onCreateCosting
}) => {
  const [clientName, setClientName] = useState<string>('');
  const [agencyOrLead, setAgencyOrLead] = useState<string>('Direct Inbound Lead');
  const [quoteReference, setQuoteReference] = useState<string>(`TAS-CST-${Math.floor(1000 + Math.random() * 9000)}`);
  const [travelStartDate, setTravelStartDate] = useState<string>('2026-08-15');
  const [travelEndDate, setTravelEndDate] = useState<string>('2026-08-22');
  const [paxAdults, setPaxAdults] = useState<number>(2);
  const [paxChildren, setPaxChildren] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [operatorMarkupPercent, setOperatorMarkupPercent] = useState<number>(20);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [selectedCircuit, setSelectedCircuit] = useState<'kenya-7d' | 'serengeti-8d' | 'blank'>('kenya-7d');

  // File upload state
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedSuccess, setUploadedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setUploadedSuccess(true);
      if (!clientName) {
        setClientName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInputs: ClientQuotationInputs = {
      quoteReference: quoteReference.trim() || `TAS-CST-${Date.now().toString().slice(-4)}`,
      clientName: clientName.trim() || 'Valued Safari Client',
      clientEmail: '',
      agencyOrLead: agencyOrLead.trim() || 'Direct Inbound',
      travelStartDate,
      travelEndDate,
      paxAdults,
      paxChildren,
      paxInfants: 0,
      roomConfig: {
        singleRooms: 0,
        doubleTwinRooms: Math.max(1, Math.ceil(paxAdults / 2)),
        tripleRooms: 0,
        familyRooms: 0,
      },
      operatorMarkupPercent,
      agencyCommissionPercent: 0,
      vatTaxPercent: 0,
      selectedCurrency,
      specialRequestsNotes: ''
    };

    let daysToUse: ItineraryDay[] | undefined = undefined;
    if (selectedCircuit === 'kenya-7d') {
      daysToUse = JSON.parse(JSON.stringify(DEFAULT_KENYA_ITINERARY));
    } else if (selectedCircuit === 'blank') {
      daysToUse = [
        {
          dayNumber: 1,
          title: 'Arrival in Nairobi & Safari Briefing',
          destination: 'Nairobi',
          country: 'Kenya',
          parkFeeId: '',
          propertyId: '',
          nights: 1,
          roomType: 'Twin/Double',
          numberOfRooms: roomsCount,
          transportVehicleId: 'safari-cruiser-4x4',
          includeVehicleThisDay: true,
          activityIds: [],
          notes: 'Arrival transfer & hotel check-in.',
          highlightSummary: 'Airport reception & private transfer'
        }
      ];
    }

    onCreateCosting(newInputs, daysToUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">New Safari Costing Sheet</h3>
              <p className="text-xs text-slate-400">Configure client rates, wholesale STO markup & pax structure</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Upload Box */}
          <div className="border border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 bg-slate-50 relative flex items-center justify-between transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Import Existing Costing / Rate Sheet'}
                </div>
                <div className="text-[10px] text-slate-500">Upload Excel, CSV, or RFP sheet to pre-fill</div>
              </div>
            </div>
            {uploadedSuccess && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Client Name / Group Lead</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sterling Family Safari"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quote Reference</label>
              <input
                type="text"
                required
                value={quoteReference}
                onChange={(e) => setQuoteReference(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Source / Agent</label>
              <input
                type="text"
                value={agencyOrLead}
                onChange={(e) => setAgencyOrLead(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="KES">KES (KSh) — Kenya Shilling</option>
                <option value="TZS">TZS (TSh) — Tanzania Shilling</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Travel Start Date</label>
              <input
                type="date"
                required
                value={travelStartDate}
                onChange={(e) => setTravelStartDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Operator Markup (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={operatorMarkupPercent}
                  onChange={(e) => setOperatorMarkupPercent(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-7 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Adult Pax (12+)</label>
              <input
                type="number"
                min="1"
                max="40"
                value={paxAdults}
                onChange={(e) => setPaxAdults(parseInt(e.target.value) || 1)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Child Pax (&lt;12)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={paxChildren}
                onChange={(e) => setPaxChildren(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Starting Safari Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCircuit('kenya-7d')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedCircuit === 'kenya-7d'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 font-bold text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div>7-Day Kenya Classic Spec</div>
                <div className="text-[10px] text-slate-500 font-normal">Pre-filled lodges, parks & 4x4 cruiser</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCircuit('blank')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedCircuit === 'blank'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 font-bold text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div>Blank Costing Canvas</div>
                <div className="text-[10px] text-slate-500 font-normal">Start completely fresh with custom days</div>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Launch Costing Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
