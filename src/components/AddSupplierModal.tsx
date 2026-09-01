import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Info
} from 'lucide-react';
import { BoardBasis, STOAccommodationProperty, STOSeasonRate } from '../types/costing';
import {
  areSeasonRatesIdentical,
  deduplicateSeasonsForFacility,
  normalizeKey
} from '../utils/rateDeduplication';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: STOAccommodationProperty) => void;
  onOpenAiImporter?: () => void;
  existingProperties?: STOAccommodationProperty[];
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  onOpenAiImporter,
  existingProperties = []
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [country, setCountry] = useState<'Kenya' | 'Tanzania'>('Kenya');
  const [region, setRegion] = useState<string>('Maasai Mara');
  const [parkOrConservancyId, setParkOrConservancyId] = useState<string>('mara-nr');
  const [boardBasis, setBoardBasis] = useState<BoardBasis>('Full Board (FB)');
  const [roomCategory, setRoomCategory] = useState<string>('Luxury Tented Suite');
  const [sourceDocument, setSourceDocument] = useState<string>('Direct 2026 STO Partner Contract');

  // Season Fields
  const [seasonName, setSeasonName] = useState<string>('High Season 2026');
  const [startDate, setStartDate] = useState<string>('07-01');
  const [endDate, setEndDate] = useState<string>('10-31');
  const [ppsUsd, setPpsUsd] = useState<number>(550);
  const [srsUsd, setSrsUsd] = useState<number>(140);
  const [childRateFactor, setChildRateFactor] = useState<number>(50);
  const [minNights, setMinNights] = useState<number>(1);
  const [notes, setNotes] = useState<string>('Includes 3 meals daily, drinking water, teas & local taxes.');

  if (!isOpen) return null;

  // Check matching facility
  const matchingFacility = name.trim().length > 1
    ? existingProperties.find(p => normalizeKey(p.name) === normalizeKey(name) && p.country === country)
    : undefined;

  const draftSeason: STOSeasonRate = {
    id: 'draft-season',
    seasonName,
    startDate,
    endDate,
    description: `${seasonName} Rate (${startDate} to ${endDate})`,
    ppsUsd,
    srsUsd,
    childRateFactor: childRateFactor / 100,
    minNights,
    notes
  };

  const duplicateExistingSeason = matchingFacility
    ? (matchingFacility.seasons || []).find(s => areSeasonRatesIdentical(s, draftSeason))
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateExistingSeason) {
      alert(`Duplicate rate blocked: This exact rate tier (${duplicateExistingSeason.seasonName} at $${duplicateExistingSeason.ppsUsd} PPS) already exists for this facility.`);
      return;
    }

    const season: STOSeasonRate = {
      id: `season-${Date.now().toString()}`,
      seasonName,
      startDate,
      endDate,
      description: `${seasonName} Rate (${startDate} to ${endDate})`,
      ppsUsd,
      srsUsd,
      childRateFactor: childRateFactor / 100,
      minNights,
      notes
    };

    if (matchingFacility) {
      // Append season to existing facility without duplicates
      const combined = [...(matchingFacility.seasons || []), season];
      const { seasons: deduped } = deduplicateSeasonsForFacility(combined, matchingFacility.id);

      const updatedProp: STOAccommodationProperty = {
        ...matchingFacility,
        boardBasis: boardBasis || matchingFacility.boardBasis,
        roomCategory: roomCategory || matchingFacility.roomCategory,
        seasons: deduped,
        sourceDocument: sourceDocument || matchingFacility.sourceDocument,
        sourceDate: new Date().toISOString().split('T')[0],
      };

      onAddProperty(updatedProp);
    } else {
      const newProperty: STOAccommodationProperty = {
        id: `prop-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        name: name.trim() || 'New Safari Lodge',
        country,
        region: region.trim() || 'East Africa',
        parkOrConservancyId: parkOrConservancyId.trim() || 'mara-nr',
        boardBasis,
        roomCategory: roomCategory.trim() || 'Standard Suite',
        seasons: [season],
        sourceDocument: sourceDocument.trim() || '2026 STO Partner Agreement',
        sourceDate: new Date().toISOString().split('T')[0],
        sourceType: 'STO Rate Contract 2026',
        validityYear: 2026,
        status: 'Active'
      };

      onAddProperty(newProperty);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Add Safari Supplier / STO Property</h3>
              <p className="text-xs text-slate-400">Register wholesale lodge, tented camp or luxury accommodation</p>
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'border-amber-500 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenAiImporter) {
                onClose();
                onOpenAiImporter();
              } else {
                setActiveTab('upload');
              }
            }}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'border-amber-500 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Contract Ingestor (Upload PDF / Excel)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Lodge / Camp Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Governors' Il Moran Camp, Mara Bush Tops, Singita Faru Faru"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as 'Kenya' | 'Tanzania')}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
              >
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Region / Ecosystem</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Maasai Mara, Serengeti Central, Amboseli, Samburu"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Board Basis</label>
              <select
                value={boardBasis}
                onChange={(e) => setBoardBasis(e.target.value as BoardBasis)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Full Board (FB)">Full Board (FB)</option>
                <option value="Game Package (GP)">Game Package (GP)</option>
                <option value="All Inclusive (AI)">All Inclusive (AI)</option>
                <option value="Bed & Breakfast (BB)">Bed & Breakfast (BB)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Room Category</label>
              <input
                type="text"
                required
                value={roomCategory}
                onChange={(e) => setRoomCategory(e.target.value)}
                placeholder="e.g. Luxury Tent, River View Suite"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Park / Conservancy Key</label>
              <input
                type="text"
                value={parkOrConservancyId}
                onChange={(e) => setParkOrConservancyId(e.target.value)}
                placeholder="e.g. mara-nr, serengeti-np, amboseli-np"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Source Contract / Rate Doc</label>
              <input
                type="text"
                value={sourceDocument}
                onChange={(e) => setSourceDocument(e.target.value)}
                placeholder="e.g. 2026 STO Partner Rate Contract"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Season Tariff Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Primary Season Wholesale Rate (USD)</span>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                Net STO Tariff
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Net PPS ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={ppsUsd}
                  onChange={(e) => setPpsUsd(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-bold text-emerald-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Single Supp ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={srsUsd}
                  onChange={(e) => setSrsUsd(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Child %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={childRateFactor}
                  onChange={(e) => setChildRateFactor(parseInt(e.target.value) || 50)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Min Nights</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={minNights}
                  onChange={(e) => setMinNights(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Matching Facility Info or Duplicate Warning */}
          {matchingFacility && !duplicateExistingSeason && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Existing Facility Profile Matched</div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  "{matchingFacility.name}" ({matchingFacility.country}) is already in the supplier database with {matchingFacility.seasons.length} season tier(s). This new rate will be appended without creating duplicate facilities.
                </div>
              </div>
            </div>
          )}

          {duplicateExistingSeason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Duplicate Rate Detected for this Facility</div>
                <div className="text-[11px] text-red-600 mt-0.5">
                  "{matchingFacility?.name}" already has an identical rate tier for <strong>{duplicateExistingSeason.seasonName}</strong> (${duplicateExistingSeason.ppsUsd} PPS / ${duplicateExistingSeason.srsUsd || 0} SRS). Duplicate rates from the same facility are not permitted.
                </div>
              </div>
            </div>
          )}

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
              disabled={!!duplicateExistingSeason}
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all ${
                duplicateExistingSeason
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{duplicateExistingSeason ? 'Duplicate Rate Blocked' : 'Save Supplier to Registry'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
