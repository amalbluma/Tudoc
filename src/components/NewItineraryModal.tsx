import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
  Car,
  DollarSign,
  Tag,
  ShieldCheck,
  Plane,
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { ClientQuotationInputs, ItineraryDay, ItineraryType, STOAccommodationProperty } from '../types/costing';
import { READY_MADE_ITINERARIES, ReadyMadeItinerary } from '../data/readyMadeItineraries';
import { DEFAULT_KENYA_ITINERARY } from '../data/defaultItineraries';
import { TusafiriLogo } from './TusafiriLogo';

interface NewItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateItinerary: (days: ItineraryDay[], inputs?: Partial<ClientQuotationInputs>) => void;
  stoProperties?: STOAccommodationProperty[];
}

export const NewItineraryModal: React.FC<NewItineraryModalProps> = ({
  isOpen,
  onClose,
  onCreateItinerary,
  stoProperties = []
}) => {
  const [creationMode, setCreationMode] = useState<'catalog' | 'upload' | 'blank'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fit' | 'group' | 'scheduled_departure'>('all');
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(READY_MADE_ITINERARIES[0].id);

  // Form Fields
  const [clientName, setClientName] = useState<string>('');
  const [agencyOrLead, setAgencyOrLead] = useState<string>('Direct Inbound Request');
  const [quoteReference, setQuoteReference] = useState<string>(`TAS-ITIN-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itineraryType, setItineraryType] = useState<ItineraryType>('fit');
  const [travelStartDate, setTravelStartDate] = useState<string>('2026-08-10');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [travelEndDate, setTravelEndDate] = useState<string>('2026-08-17');
  const [travelStyleTier, setTravelStyleTier] = useState<string>('Semi-Luxury / Premium Classic');
  const [paxAdults, setPaxAdults] = useState<number>(2);
  const [paxChildren, setPaxChildren] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [departureCode, setDepartureCode] = useState<string>('SCH-DEP-2026');

  // Upload Ready-Made Itinerary state
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<ItineraryType>('fit');
  const [uploadTier, setUploadTier] = useState<string>('Mid-Range / Standard Comfort');
  const [uploadDurationDays, setUploadDurationDays] = useState<number>(7);
  const [isParsingUpload, setIsParsingUpload] = useState<boolean>(false);
  const [parsedItineraryResult, setParsedItineraryResult] = useState<ReadyMadeItinerary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filtered Ready-Made Itineraries
  const filteredCircuits = categoryFilter === 'all'
    ? READY_MADE_ITINERARIES
    : READY_MADE_ITINERARIES.filter(c => c.category === categoryFilter);

  const selectedCircuit = READY_MADE_ITINERARIES.find(c => c.id === selectedCircuitId) || READY_MADE_ITINERARIES[0];

  // Auto-sync duration & end date when start date or duration changes
  useEffect(() => {
    if (travelStartDate && durationDays > 0) {
      const start = new Date(travelStartDate);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays);
        setTravelEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [travelStartDate, durationDays]);

  // When a preset circuit is selected, update fields
  const handleSelectCircuit = (circuit: ReadyMadeItinerary) => {
    setSelectedCircuitId(circuit.id);
    setDurationDays(circuit.durationDays);
    setItineraryType(circuit.category);
    setTravelStyleTier(circuit.travelStyleTier);
    if (!clientName) {
      setClientName(`${circuit.title.split('(')[0].trim()}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadError(null);
    setParsedItineraryResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setUploadedText(text || '');

      // Trigger Smart AI parsing
      setIsParsingUpload(true);
      try {
        const res = await fetch('/api/ai/parse-ready-made-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textContent: text,
            fileName: file.name,
            category: uploadCategory,
            durationDays: uploadDurationDays,
            travelStyleTier: uploadTier
          })
        });

        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          const readyMade: ReadyMadeItinerary = {
            id: `uploaded-${Date.now()}`,
            category: data.category || uploadCategory,
            categoryLabel: (data.category === 'scheduled_departure' ? 'Scheduled Departure' : data.category === 'group' ? 'Group Itinerary' : 'FIT Itinerary'),
            title: data.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            country: data.country || 'Kenya',
            durationDays: data.durationDays || uploadDurationDays || 7,
            durationNights: data.durationNights || Math.max(1, (data.durationDays || uploadDurationDays) - 1),
            travelStyleTier: data.travelStyleTier || uploadTier,
            summary: data.summary || 'Uploaded ready-made safari itinerary',
            destinations: data.destinations || ['East Africa'],
            recommendedPax: data.recommendedPax || (uploadCategory === 'group' ? '8-16 Pax' : '2-4 Pax'),
            defaultVehicle: data.defaultVehicle || '4x4 Safari Land Cruiser (Pop-up Roof)',
            startingPriceUsd: data.startingPriceUsd || 2400,
            days: data.days || []
          };

          setParsedItineraryResult(readyMade);
          setClientName(readyMade.title);
          setDurationDays(readyMade.durationDays);
          setItineraryType(readyMade.category);
          setTravelStyleTier(readyMade.travelStyleTier);
        } else {
          throw new Error(json.error || 'Failed to parse itinerary file');
        }
      } catch (err: any) {
        console.error('Error parsing ready-made itinerary:', err);
        setUploadError(err?.message || 'Smart parser encountered an issue, but you can still initialize the itinerary.');
      } finally {
        setIsParsingUpload(false);
      }
    };

    reader.readAsText(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    let itineraryDays: ItineraryDay[] = [];

    if (creationMode === 'catalog') {
      const template = READY_MADE_ITINERARIES.find(c => c.id === selectedCircuitId) || READY_MADE_ITINERARIES[0];
      itineraryDays = JSON.parse(JSON.stringify(template.days));
    } else if (creationMode === 'upload' && parsedItineraryResult) {
      itineraryDays = JSON.parse(JSON.stringify(parsedItineraryResult.days));
    } else if (creationMode === 'blank') {
      // Generate days based on durationDays
      itineraryDays = Array.from({ length: durationDays }, (_, i) => ({
        dayNumber: i + 1,
        title: `Day ${i + 1}: Safari Exploration`,
        destination: i === 0 ? 'Nairobi' : i === durationDays - 1 ? 'Nairobi / Departure' : 'Maasai Mara',
        country: 'Kenya',
        parkFeeId: i === 0 || i === durationDays - 1 ? '' : 'park-maasai-mara',
        propertyId: '',
        nights: i === durationDays - 1 ? 0 : 1,
        roomType: 'Twin/Double',
        numberOfRooms: 1,
        transportVehicleId: 'veh-land-cruiser-4x4',
        includeVehicleThisDay: true,
        activityIds: [],
        notes: `Day ${i + 1} custom itinerary program.`,
        highlightSummary: `Wildlife observation and wilderness exploration`,
        mealsIncluded: i === 0 ? 'Dinner' : i === durationDays - 1 ? 'Breakfast' : 'Full Board',
        distanceKm: 200,
        drivingTimeHours: '~4 hrs'
      }));
    } else {
      itineraryDays = JSON.parse(JSON.stringify(DEFAULT_KENYA_ITINERARY));
    }

    onCreateItinerary(
      itineraryDays,
      {
        clientName: clientName.trim() || (selectedCircuit ? selectedCircuit.title : 'New Safari Itinerary'),
        agencyOrLead: agencyOrLead.trim() || 'Direct Tusafiri Client',
        quoteReference: quoteReference.trim() || `TAS-${Date.now().toString().slice(-4)}`,
        itineraryType,
        travelStartDate,
        travelEndDate,
        durationDays,
        travelStyleTier,
        paxAdults,
        paxChildren,
        specialRequestsNotes: notes || (selectedCircuit ? selectedCircuit.summary : ''),
        scheduledDepartureCode: itineraryType === 'scheduled_departure' ? departureCode : undefined
      }
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <TusafiriLogo variant="icon" theme="dark" size="sm" />
            <div className="border-l border-slate-800 pl-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                New Safari Itinerary &amp; Ready-Made Circuits
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  Tusafiri Standards
                </span>
              </h3>
              <p className="text-xs text-slate-400">Load ready-made packages, upload RFP briefs, or build a custom circuit</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-900">
          
          {/* Main Mode Selector */}
          <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              id="mode-ready-made-catalog"
              onClick={() => setCreationMode('catalog')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ready-Made Itineraries</span>
            </button>

            <button
              type="button"
              id="mode-upload-itinerary"
              onClick={() => setCreationMode('upload')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Upload Ready-Made Brief</span>
            </button>

            <button
              type="button"
              id="mode-blank-itinerary"
              onClick={() => setCreationMode('blank')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'blank'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Custom Blank Itinerary</span>
            </button>
          </div>

          {/* 1. READY-MADE ITINERARY CATALOG BROWSER */}
          {creationMode === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Ready-Made Itinerary Package
                  </h4>
                  <p className="text-xs text-slate-500">Curated East Africa packages ready for 1-click costing and quotation</p>
                </div>

                {/* Sub-category Filter Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      categoryFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({READY_MADE_ITINERARIES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('fit')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      categoryFilter === 'fit' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FIT Itineraries
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('group')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      categoryFilter === 'group' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Group Itineraries
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('scheduled_departure')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      categoryFilter === 'scheduled_departure' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scheduled Departures
                  </button>
                </div>
              </div>

              {/* Ready-made circuits cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 custom-scrollbar">
                {filteredCircuits.map((circuit) => {
                  const isSelected = selectedCircuitId === circuit.id;
                  return (
                    <div
                      key={circuit.id}
                      onClick={() => handleSelectCircuit(circuit)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            circuit.category === 'scheduled_departure'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : circuit.category === 'group'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {circuit.categoryLabel}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700">
                            {circuit.durationDays} Days / {circuit.durationNights} Nights
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {circuit.country}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">{circuit.title}</h5>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5">{circuit.summary}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                        <span className="text-slate-500">Tier: <strong className="text-slate-800">{circuit.travelStyleTier.split('/')[0].trim()}</strong></span>
                        <span className="font-mono font-bold text-amber-700">From ${(circuit.startingPriceUsd ?? 0).toLocaleString()} /pp</span>
                      </div>

                      {circuit.departureDates && circuit.departureDates.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] text-blue-700 font-medium">
                          <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>Guaranteed: {circuit.departureDates.slice(0, 3).join(', ')} +more</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. UPLOAD READY-MADE ITINERARY MODE */}
          {creationMode === 'upload' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                <h4 className="text-xs font-bold text-purple-950 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-700" />
                  Upload Ready-Made Itinerary Document
                </h4>
                <p className="text-xs text-purple-800">
                  Upload an existing client RFP brief, Word/PDF itinerary proposal, or tariff document. Tusafiri's intelligent parser will extract day-by-day destinations, properties, vehicles, and schedules automatically.
                </p>

                {/* Upload Options Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-purple-200/60">
                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Itinerary Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as ItineraryType)}
                      className="w-full text-xs bg-white border border-purple-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="fit">FIT Itinerary (Tailormade)</option>
                      <option value="group">Group Itinerary (Private Charters)</option>
                      <option value="scheduled_departure">Scheduled Departure (Guaranteed Seat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Expected Tour Duration</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={uploadDurationDays}
                        onChange={(e) => setUploadDurationDays(parseInt(e.target.value) || 7)}
                        className="w-20 text-xs font-bold font-mono text-center bg-white border border-purple-300 rounded-xl py-1.5 text-slate-900"
                      />
                      <span className="text-xs text-purple-900 font-medium">Days</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Travel Style / Tier</label>
                    <select
                      value={uploadTier}
                      onChange={(e) => setUploadTier(e.target.value)}
                      className="w-full text-xs bg-white border border-purple-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Budget / Camping Safari">Budget / Camping Safari</option>
                      <option value="Mid-Range / Standard Comfort">Mid-Range / Standard Comfort</option>
                      <option value="Semi-Luxury / Premium Classic">Semi-Luxury / Premium Classic</option>
                      <option value="Luxury Tented Safari (5-Star)">Luxury Tented Safari (5-Star)</option>
                      <option value="Ultra-Luxury / Connoisseur VIP">Ultra-Luxury / Connoisseur VIP</option>
                      <option value="Flying Safari Express">Flying Safari Express</option>
                      <option value="Family & Conservation Safari">Family & Conservation Safari</option>
                      <option value="Photographic & Specialist Expedition">Photographic & Specialist</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-6 text-center transition-all bg-slate-50 relative cursor-pointer group">
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.csv,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {isParsingUpload ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-xs font-bold text-slate-900">Parsing & Structuring Itinerary with AI Intelligence...</p>
                    <p className="text-[11px] text-slate-500 mt-1">Extracting day highlights, destinations, routing & meals</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-900">
                      {uploadFileName ? `Loaded: ${uploadFileName}` : 'Click to browse or drag & drop ready-made itinerary document'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, TXT, CSV, or JSON client briefs</p>
                  </div>
                )}
              </div>

              {parsedItineraryResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ready-Made Itinerary Parsed Successfully: {parsedItineraryResult.title}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                      {parsedItineraryResult.days.length} Days Generated
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">{parsedItineraryResult.summary}</p>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. CLIENT DETAILS & ITINERARY PARAMETERS (Explicitly Addressing User Requests) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Itinerary Dates, Duration & Travel Style Tier
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              
              {/* Client Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Client / Lead Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dr. Eleanor Vance / Abercrombie Group"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quote Reference */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quote Reference Code *</label>
                <input
                  type="text"
                  required
                  value={quoteReference}
                  onChange={(e) => setQuoteReference(e.target.value)}
                  className="w-full font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Itinerary Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Itinerary Type</label>
                <select
                  value={itineraryType}
                  onChange={(e) => setItineraryType(e.target.value as ItineraryType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="fit">FIT Itinerary (Tailormade / Bespoke)</option>
                  <option value="group">Group Itinerary (Private Charter / Club)</option>
                  <option value="scheduled_departure">Scheduled Departure (Guaranteed Seat)</option>
                </select>
              </div>

              {/* Travel Start Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Travel Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={travelStartDate}
                  onChange={(e) => setTravelStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* NUMBER OF DAYS / DURATION OF TOUR (AFTER START DATE AS REQUESTED) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Number of Days / Duration of Tour *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 font-bold font-mono text-center bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    Days ({Math.max(1, durationDays - 1)} Nights)
                  </span>
                </div>
              </div>

              {/* Auto Calculated End Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Travel End Date (Auto)</label>
                <input
                  type="date"
                  value={travelEndDate}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              {/* TRAVEL STYLE AND TIERS (ALL TIERS INCLUDING BUDGET AND MID-RANGE) */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  Travel Style & Accommodation Tier *
                </label>
                <select
                  value={travelStyleTier}
                  onChange={(e) => setTravelStyleTier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Budget / Camping Safari">Budget / Camping Safari (Value Tier — Budget Camps & Minivan)</option>
                  <option value="Mid-Range / Standard Comfort">Mid-Range / Standard Comfort Tier (3-4 Star Lodges & Comfortable Tents)</option>
                  <option value="Semi-Luxury / Premium Classic">Semi-Luxury / Premium Classic Tier (4-4.5 Star Serena & Sarova)</option>
                  <option value="Luxury Tented Safari (5-Star)">Luxury Tented Safari (5-Star Signature Luxury Lodges & Camps)</option>
                  <option value="Ultra-Luxury / Connoisseur VIP">Ultra-Luxury / Connoisseur VIP (Singita, Angama & Private Reserves)</option>
                  <option value="Flying Safari Express">Flying Safari Express (Aero Wing Charters & Fly-In Bush Packages)</option>
                  <option value="Family & Conservation Safari">Family & Conservation Safari (Family Suites & Junior Ranger Program)</option>
                  <option value="Photographic & Specialist Expedition">Photographic & Specialist Expedition (Swivel Mounts & Expert Naturalist)</option>
                </select>
              </div>

              {/* Pax Adults */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Adult Guests (12+ yrs)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={paxAdults}
                  onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Pax Children */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Child Guests (3-11 yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={paxChildren}
                  onChange={(e) => setPaxChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Lead Agency / Source */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Agency / Lead Source</label>
                <input
                  type="text"
                  value={agencyOrLead}
                  onChange={(e) => setAgencyOrLead(e.target.value)}
                  placeholder="e.g. Abercrombie / Direct Inbound"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            {/* Special Notes */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Safari Focus, Client Wishes & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Great Migration river crossings, hot air balloon safari, private photography vehicle, guaranteed window seats..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-600">
            <span>Configuring </span>
            <strong className="text-slate-900">{durationDays} Days</strong>
            <span> · </span>
            <strong className="text-amber-700">{travelStyleTier.split('/')[0].trim()}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Initialize Itinerary & Rates</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
