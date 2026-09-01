import React, { useState } from 'react';
import { SearchableSelect } from './ui/SearchableSelect';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Plus,
  Save,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Building2,
  Car,
  Plane,
  Camera,
  Coffee,
  Sun,
  Moon,
  Info,
  ExternalLink,
  Edit3,
  Copy,
  AlertCircle,
  Tag,
  Upload,
  Check,
  Percent,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import {
  ClientQuotationInputs,
  ItineraryDay,
  DayCostBreakdown,
  CostingTotals,
  STOAccommodationProperty,
  ItineraryType,
} from '../types/costing';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import { ACTIVITY_OPTIONS, TRANSPORT_OPTIONS, FLIGHT_OPTIONS } from '../data/transportAndExtrasData';
import { READY_MADE_ITINERARIES, ReadyMadeItinerary } from '../data/readyMadeItineraries';
import { EastAfricaRouteVisualSummary } from './EastAfricaRouteVisualSummary';

interface ItineraryDesignerViewProps {
  clientInputs: ClientQuotationInputs;
  setClientInputs: React.Dispatch<React.SetStateAction<ClientQuotationInputs>>;
  itinerary: ItineraryDay[];
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryDay[]>>;
  dayBreakdowns: DayCostBreakdown[];
  totals: CostingTotals;
  stoDatabase: STOAccommodationProperty[];
  onNavigateToCosting: () => void;
  onPreviewQuote: () => void;
  onSaveCurrentDraft: () => void;
  onOpenNewItinerary?: () => void;
}

export const ItineraryDesignerView: React.FC<ItineraryDesignerViewProps> = ({
  clientInputs,
  setClientInputs,
  itinerary,
  setItinerary,
  dayBreakdowns,
  totals,
  stoDatabase,
  onNavigateToCosting,
  onPreviewQuote,
  onSaveCurrentDraft,
  onOpenNewItinerary,
}) => {
  // Navigation tab within Itinerary View
  const [activeTab, setActiveTab] = useState<'designer' | 'fit' | 'group' | 'scheduled' | 'upload'>('designer');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isCuratingEntireCircuit, setIsCuratingEntireCircuit] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [newItemSlot, setNewItemSlot] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemTime, setNewItemTime] = useState('09:00 AM');
  const [newItemType, setNewItemType] = useState('activity');
  const [isEditingClientSpecs, setIsEditingClientSpecs] = useState<boolean>(false);
  const [showVisualSummaryMap, setShowVisualSummaryMap] = useState<boolean>(true);

  // Upload Studio state
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<ItineraryType>('fit');
  const [uploadTier, setUploadTier] = useState<string>('Mid-Range / Standard Comfort');
  const [uploadDurationDays, setUploadDurationDays] = useState<number>(7);
  const [isParsingUpload, setIsParsingUpload] = useState<boolean>(false);
  const [parsedItineraryResult, setParsedItineraryResult] = useState<ReadyMadeItinerary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentDay = itinerary[activeDayIndex] || itinerary[0];
  const currentBreakdown = dayBreakdowns[activeDayIndex] || dayBreakdowns[0];
  const currentProp = stoDatabase.find(p => p.id === currentDay?.propertyId);

  // Default rich schedule fallback if not yet initialized on day
  const morningItems = currentDay?.detailedSchedule?.morning || [
    {
      id: 'm-1',
      time: '06:30 AM',
      title: 'Dawn Wilderness Game Drive',
      subtitle: 'Track active big cats during crisp morning light',
      type: 'game_drive',
    },
    {
      id: 'm-2',
      time: '09:00 AM',
      title: 'Bush Breakfast under Acacia',
      subtitle: 'Fresh hot breakfast served in the open savannah',
      type: 'meal',
    },
  ];

  const afternoonItems = currentDay?.detailedSchedule?.afternoon || [
    {
      id: 'a-1',
      time: '01:30 PM',
      title: `Lunch at ${currentProp?.name || 'Safari Camp'}`,
      subtitle: 'Relaxation and poolside viewing deck',
      type: 'meal',
    },
    {
      id: 'a-2',
      time: '04:00 PM',
      title: 'Golden Hour Safari & Predators',
      subtitle: 'Traverse prime wildlife corridors with expert guide',
      type: 'game_drive',
    },
  ];

  const eveningItems = currentDay?.detailedSchedule?.evening || [
    {
      id: 'e-1',
      time: '06:30 PM',
      title: 'Scenic Sundowner Experience',
      subtitle: 'Cocktails and canapés atop the escarpment',
      type: 'sundowner',
    },
    {
      id: 'e-2',
      time: '08:00 PM',
      title: 'Boma Dinner & Star Gazing',
      subtitle: 'Multi-course gourmet dinner under African skies',
      type: 'dinner',
    },
  ];

  // Helper to load a ready-made circuit directly into the builder
  const handleLoadCircuit = (circuit: ReadyMadeItinerary) => {
    setItinerary(JSON.parse(JSON.stringify(circuit.days)));
    setClientInputs(prev => ({
      ...prev,
      clientName: prev.clientName || circuit.title,
      durationDays: circuit.durationDays,
      travelStyleTier: circuit.travelStyleTier,
      itineraryType: circuit.category,
      specialRequestsNotes: circuit.summary,
      quoteReference: prev.quoteReference || `TAS-${Math.floor(1000 + Math.random() * 9000)}`
    }));
    setActiveTab('designer');
    setActiveDayIndex(0);
    setAiSuccessMessage(`Loaded ready-made circuit: "${circuit.title}" into Curation Workspace!`);
    setTimeout(() => setAiSuccessMessage(null), 4500);
  };

  // AI Single Day Description Generator
  const handleGenerateAiDayDescription = async () => {
    if (!currentDay) return;
    setIsGeneratingAi(true);
    setAiErrorMessage(null);
    setAiSuccessMessage(null);

    try {
      const selectedActivities = ACTIVITY_OPTIONS.filter(a =>
        currentDay.activityIds?.includes(a.id)
      ).map(a => a.name);

      const res = await fetch('/api/ai/generate-day-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: currentDay.dayNumber,
          destination: currentDay.destination || 'Maasai Mara',
          propertyName: currentProp?.name || 'Luxury Safari Camp',
          activityNames: selectedActivities,
          country: currentDay.country || 'Kenya',
          clientName: clientInputs.clientName || 'Valued Guests',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;

        setItinerary(prev => {
          const updated = [...prev];
          if (updated[activeDayIndex]) {
            updated[activeDayIndex] = {
              ...updated[activeDayIndex],
              title: data.title || updated[activeDayIndex].title,
              highlightSummary: data.subtitle || data.description,
              notes: data.description,
              distanceKm: data.estimatedDistanceKm || 245,
              drivingTimeHours: data.estimatedDrivingTime || '~5.5 hrs',
              mealsIncluded: data.meals || 'B, L, D',
              detailedSchedule: {
                morning: (data.morningItems || []).map((m: any, i: number) => ({
                  id: `ai-m-${Date.now()}-${i}`,
                  time: m.time,
                  title: m.title,
                  subtitle: m.subtitle,
                  type: m.type,
                })),
                afternoon: (data.afternoonItems || []).map((a: any, i: number) => ({
                  id: `ai-a-${Date.now()}-${i}`,
                  time: a.time,
                  title: a.title,
                  subtitle: a.subtitle,
                  type: a.type,
                })),
                evening: (data.eveningItems || []).map((e: any, i: number) => ({
                  id: `ai-e-${Date.now()}-${i}`,
                  time: e.time,
                  title: e.title,
                  subtitle: e.subtitle,
                  type: e.type,
                })),
              },
            };
          }
          return updated;
        });

        const successMsg = json.notice
          ? json.notice
          : 'Day narrative, distances, and timeline curated with Gemini AI!';
        setAiSuccessMessage(successMsg);
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error(json.error || 'Failed to generate day description');
      }
    } catch (err: any) {
      console.error('Failed to generate day description:', err);
      setAiErrorMessage(err?.message || 'Unable to contact AI generator. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Multi-Day Entire Circuit Auto-Curator
  const handleAutoCurateEntireCircuit = async () => {
    setIsCuratingEntireCircuit(true);
    setAiErrorMessage(null);
    setAiSuccessMessage(null);

    try {
      const res = await fetch('/api/ai/curate-safari-circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientInputs,
          days: itinerary,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data && json.data.days) {
        const aiDays = json.data.days;

        setItinerary(prev => {
          return prev.map((day, idx) => {
            const aiDay = aiDays[idx] || aiDays.find((d: any) => d.dayNumber === day.dayNumber);
            if (!aiDay) return day;

            return {
              ...day,
              title: aiDay.title || day.title,
              highlightSummary: aiDay.subtitle || aiDay.description || day.highlightSummary,
              notes: aiDay.description || day.notes,
              distanceKm: aiDay.estimatedDistanceKm || day.distanceKm || 220,
              drivingTimeHours: aiDay.estimatedDrivingTime || day.drivingTimeHours || '~4.5 hrs',
              mealsIncluded: aiDay.meals || day.mealsIncluded || 'B, L, D',
              detailedSchedule: {
                morning: (aiDay.morningItems || []).map((m: any, i: number) => ({
                  id: `cur-m-${Date.now()}-${idx}-${i}`,
                  time: m.time,
                  title: m.title,
                  subtitle: m.subtitle,
                  type: m.type,
                })),
                afternoon: (aiDay.afternoonItems || []).map((a: any, i: number) => ({
                  id: `cur-a-${Date.now()}-${idx}-${i}`,
                  time: a.time,
                  title: a.title,
                  subtitle: a.subtitle,
                  type: a.type,
                })),
                evening: (aiDay.eveningItems || []).map((e: any, i: number) => ({
                  id: `cur-e-${Date.now()}-${idx}-${i}`,
                  time: e.time,
                  title: e.title,
                  subtitle: e.subtitle,
                  type: e.type,
                })),
              },
            };
          });
        });

        setAiSuccessMessage(
          json.notice || `Complete ${itinerary.length}-Day Safari Circuit masterfully curated with AI!`
        );
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error(json.error || 'Failed to curate circuit');
      }
    } catch (err: any) {
      console.error('Failed to auto-curate circuit:', err);
      setAiErrorMessage(err?.message || 'Unable to auto-curate circuit. Please try again.');
    } finally {
      setIsCuratingEntireCircuit(false);
    }
  };

  const handleAddNewItem = () => {
    if (!newItemSlot || !newItemTitle) return;

    const newItem = {
      id: `item-${Date.now()}`,
      time: newItemTime || '10:00 AM',
      title: newItemTitle,
      subtitle: newItemSubtitle || 'Curated safari experience',
      type: newItemType,
    };

    setItinerary(prev => {
      const updated = [...prev];
      const day = updated[activeDayIndex];
      if (day) {
        const schedule = day.detailedSchedule || {
          morning: [...morningItems],
          afternoon: [...afternoonItems],
          evening: [...eveningItems],
        };

        schedule[newItemSlot] = [...schedule[newItemSlot], newItem];
        updated[activeDayIndex] = { ...day, detailedSchedule: schedule };
      }
      return updated;
    });

    setNewItemSlot(null);
    setNewItemTitle('');
    setNewItemSubtitle('');
  };

  const handleRemoveItem = (slot: 'morning' | 'afternoon' | 'evening', itemId: string) => {
    setItinerary(prev => {
      const updated = [...prev];
      const day = updated[activeDayIndex];
      if (day && day.detailedSchedule) {
        const schedule = { ...day.detailedSchedule };
        schedule[slot] = schedule[slot].filter(item => item.id !== itemId);
        updated[activeDayIndex] = { ...day, detailedSchedule: schedule };
      }
      return updated;
    });
  };

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const defaultProp = stoDatabase[0]?.id || 'prop-angama-mara';
    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} — Exploration & Game Drives`,
      destination: itinerary[itinerary.length - 1]?.destination || 'Maasai Mara',
      country: 'Kenya',
      parkFeeId: 'park-maasai-mara-nr',
      propertyId: defaultProp,
      nights: 1,
      roomType: 'Twin/Double',
      numberOfRooms: 2,
      transportVehicleId: 'veh-land-cruiser-4x4',
      includeVehicleThisDay: true,
      activityIds: [],
      notes: 'Morning and afternoon game drives in search of the Big Five.',
      distanceKm: 180,
      drivingTimeHours: '~4 hrs',
      mealsIncluded: 'B, L, D',
    };

    setItinerary(prev => [...prev, newDay]);
    setClientInputs(prev => ({ ...prev, durationDays: prev.durationDays + 1 }));
    setActiveDayIndex(itinerary.length);
  };

  const handleDuplicateDay = (index: number) => {
    const sourceDay = itinerary[index];
    if (!sourceDay) return;

    const duplicatedDay: ItineraryDay = {
      ...JSON.parse(JSON.stringify(sourceDay)),
      dayNumber: sourceDay.dayNumber + 1,
      title: `${sourceDay.title} (Extended)`
    };

    setItinerary(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicatedDay);
      return copy.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    });
    setClientInputs(prev => ({ ...prev, durationDays: prev.durationDays + 1 }));
    setActiveDayIndex(index + 1);
  };

  const handleDeleteDay = (index: number) => {
    if (itinerary.length <= 1) {
      alert('Itinerary must have at least one day.');
      return;
    }

    setItinerary(prev => {
      const copy = prev.filter((_, i) => i !== index);
      return copy.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    });
    setClientInputs(prev => ({ ...prev, durationDays: Math.max(1, prev.durationDays - 1) }));
    setActiveDayIndex(Math.max(0, index - 1));
  };

  // Upload parser handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsParsingUpload(true);
    setUploadError(null);
    setParsedItineraryResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setUploadedText(text);

      try {
        const res = await fetch('/api/ai/parse-ready-made-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
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
        } else {
          throw new Error(json.error || 'Failed to parse itinerary file');
        }
      } catch (err: any) {
        console.error('Error parsing ready-made itinerary:', err);
        setUploadError(err?.message || 'Smart parser encountered an issue, but you can still review.');
      } finally {
        setIsParsingUpload(false);
      }
    };

    reader.readAsText(file);
  };

  // Day costing calculations
  const dayInternalCost = currentBreakdown?.dayTotalNetUsd || 1240;
  const markupPercent = clientInputs.operatorMarkupPercent || 15;
  const dayMarkupAmount = (dayInternalCost * markupPercent) / 100;
  const daySellingPrice = dayInternalCost + dayMarkupAmount;

  // Filter ready made by category
  const fitItineraries = READY_MADE_ITINERARIES.filter(i => i.category === 'fit');
  const groupItineraries = READY_MADE_ITINERARIES.filter(i => i.category === 'group');
  const scheduledItineraries = READY_MADE_ITINERARIES.filter(i => i.category === 'scheduled_departure');

  return (
    <div className="space-y-6 pb-12">
      {/* 1. INTERACTIVE SAFARI PIPELINE STEP NAVIGATION BAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setIsEditingClientSpecs(!isEditingClientSpecs)}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
              isEditingClientSpecs
                ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Client & Scope</div>
                <div className="text-xs font-bold truncate max-w-[120px]">
                  {clientInputs.clientName || 'Add Specs'}
                </div>
              </div>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Step 2 (Active) */}
          <div className="p-2.5 rounded-xl border border-amber-500 bg-amber-500 text-slate-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-900">Active Builder</div>
                <div className="text-xs font-black">Curation Workspace ({itinerary.length}D)</div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* Step 3 */}
          <button
            type="button"
            onClick={onNavigateToCosting}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 text-slate-700 flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 group-hover:bg-emerald-200 group-hover:text-emerald-900 text-[10px] font-black flex items-center justify-center">
                3
              </span>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Costing & Margins</div>
                <div className="text-xs font-bold text-emerald-800 font-mono">
                  ${(totals?.grandTotalCostUsd ?? 0).toLocaleString()} Cost
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={onPreviewQuote}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 text-slate-700 flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 group-hover:bg-blue-200 group-hover:text-blue-900 text-[10px] font-black flex items-center justify-center">
                4
              </span>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Proposal & Quote</div>
                <div className="text-xs font-bold text-blue-800 font-mono">
                  ${(totals?.grandSellingPriceConverted ?? 0).toLocaleString()} Quote
                </div>
              </div>
            </div>
            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. INLINE CLIENT SPECS QUICK-EDITOR (EXPANDABLE) */}
      {isEditingClientSpecs && (
        <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Client Specs & Safari Scope
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingClientSpecs(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Done Editing ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Client / Lead Name</label>
              <input
                type="text"
                value={clientInputs.clientName}
                onChange={(e) => setClientInputs(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Quote Reference Code</label>
              <input
                type="text"
                value={clientInputs.quoteReference}
                onChange={(e) => setClientInputs(prev => ({ ...prev, quoteReference: e.target.value }))}
                className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={clientInputs.travelStartDate}
                onChange={(e) => setClientInputs(prev => ({ ...prev, travelStartDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Duration (Days)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={clientInputs.durationDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 1;
                    setClientInputs(prev => ({ ...prev, durationDays: days }));
                  }}
                  className="w-20 font-bold font-mono text-center bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Days</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Adults (12+)</label>
              <input
                type="number"
                min="1"
                max="40"
                value={clientInputs.paxAdults}
                onChange={(e) => setClientInputs(prev => ({ ...prev, paxAdults: parseInt(e.target.value) || 1 }))}
                className="w-full font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Children (2-11)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={clientInputs.paxChildren}
                onChange={(e) => setClientInputs(prev => ({ ...prev, paxChildren: parseInt(e.target.value) || 0 }))}
                className="w-full font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Travel Style & Tier</label>
              <select
                value={clientInputs.travelStyleTier}
                onChange={(e) => setClientInputs(prev => ({ ...prev, travelStyleTier: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
              >
                <option value="Budget / Camping Safari">Budget / Camping Safari</option>
                <option value="Mid-Range / Standard Comfort">Mid-Range / Standard Comfort</option>
                <option value="Semi-Luxury / Premium Classic">Semi-Luxury / Premium Classic</option>
                <option value="Luxury Tented Safari (5-Star)">Luxury Tented Safari (5-Star)</option>
                <option value="Ultra-Luxury / Connoisseur VIP">Ultra-Luxury / Connoisseur VIP</option>
                <option value="Flying Safari Express">Flying Safari Express</option>
                <option value="Family & Conservation Safari">Family & Conservation</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Markup Percentage (%)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={clientInputs.operatorMarkupPercent}
                  onChange={(e) => setClientInputs(prev => ({ ...prev, operatorMarkupPercent: parseFloat(e.target.value) || 15 }))}
                  className="w-full font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                />
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOP HEADER BAR WITH ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Workspace</span>
          <span className="text-slate-300">›</span>
          <h2 className="text-sm font-bold text-slate-900">
            {clientInputs.clientName ? `${clientInputs.clientName}` : 'Bespoke Safari'} — {itinerary.length} Days
          </h2>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            clientInputs.itineraryType === 'scheduled_departure'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : clientInputs.itineraryType === 'group'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : 'bg-amber-100 text-amber-900 border-amber-200'
          }`}>
            {clientInputs.itineraryType === 'scheduled_departure' ? 'Scheduled Departure' : clientInputs.itineraryType === 'group' ? 'Group Itinerary' : 'FIT Itinerary'}
          </span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {clientInputs.travelStyleTier?.split('/')[0].trim() || 'Semi-Luxury'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Multi-Day AI Circuit Curator Button */}
          <button
            type="button"
            onClick={handleAutoCurateEntireCircuit}
            disabled={isCuratingEntireCircuit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isCuratingEntireCircuit ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Curating Circuit with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>🪄 Auto-Curate Entire Circuit (AI)</span>
              </>
            )}
          </button>

          {onOpenNewItinerary && (
            <button
              id="btn-create-new-itinerary-header"
              type="button"
              onClick={onOpenNewItinerary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Circuit</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddDay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day</span>
          </button>

          <button
            type="button"
            onClick={onPreviewQuote}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Preview Quote</span>
          </button>

          <button
            type="button"
            onClick={onSaveCurrentDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* AI NOTICES */}
      {aiSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{aiSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiSuccessMessage(null)}
            className="text-xs text-emerald-700 font-bold hover:text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {aiErrorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{aiErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiErrorMessage(null)}
            className="text-xs text-rose-700 font-bold hover:text-rose-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. ITINERARIES MODULE NAVIGATION TABS */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('designer')}
          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'designer'
              ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Active Curation Studio ({itinerary.length} Days)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fit')}
          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'fit'
              ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-600" />
          <span>FIT Itineraries ({fitItineraries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('group')}
          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'group'
              ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>Group Itineraries ({groupItineraries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'scheduled'
              ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Scheduled Departures ({scheduledItineraries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>Upload Ready-Made Studio</span>
        </button>
      </div>

      {/* 5. TAB VIEW ROUTING */}
      {activeTab === 'designer' && (
        <div className="space-y-6">
          {/* INTERACTIVE EAST AFRICA VISUAL ROUTE MAP SUMMARY */}
          {showVisualSummaryMap && (
            <EastAfricaRouteVisualSummary
              itinerary={itinerary}
              stoDatabase={stoDatabase}
              clientInputs={clientInputs}
              activeDayIndex={activeDayIndex}
              onSelectDayIndex={setActiveDayIndex}
              onAddDay={handleAddDay}
              onAutoCurate={handleAutoCurateEntireCircuit}
            />
          )}

          {/* DAY TIMELINE NAVIGATION STRIP */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Day Sequence ({itinerary.length} Days Total)
                  </span>
                </div>

                {/* Toggle Map View button */}
                <button
                  type="button"
                  onClick={() => setShowVisualSummaryMap(!showVisualSummaryMap)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    showVisualSummaryMap
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showVisualSummaryMap ? 'Hide Route Map' : 'Show East Africa Route Map'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDayIndex(Math.max(0, activeDayIndex - 1))}
                  disabled={activeDayIndex === 0}
                  className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700">
                  Day {activeDayIndex + 1} of {itinerary.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDayIndex(Math.min(itinerary.length - 1, activeDayIndex + 1))}
                  disabled={activeDayIndex === itinerary.length - 1}
                  className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Day Badges Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {itinerary.map((day, idx) => {
                const isActive = idx === activeDayIndex;
                const prop = stoDatabase.find(p => p.id === day.propertyId);
                return (
                  <button
                    key={day.dayNumber || idx}
                    type="button"
                    onClick={() => setActiveDayIndex(idx)}
                    className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer min-w-[130px] ${
                      isActive
                        ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm scale-102 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                      <span>Day {idx + 1}</span>
                      <span>{day.distanceKm ? `${day.distanceKm}km` : '~'}</span>
                    </div>
                    <div className="text-xs font-bold truncate max-w-[120px] mt-0.5">
                      {day.destination || 'Destination'}
                    </div>
                    <div className="text-[10px] opacity-75 truncate max-w-[120px]">
                      {prop?.name || 'Camp/Lodge'}
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleAddDay}
                className="shrink-0 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/50 flex flex-col items-center justify-center min-w-[110px] transition-all cursor-pointer text-xs font-bold"
              >
                <Plus className="w-4 h-4 mb-0.5" />
                <span>+ Add Day</span>
              </button>
            </div>
          </div>

          {/* MAIN 2-COLUMN CURATION WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: ACTIVE DAY CURATION STUDIO (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Active Day Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Day {activeDayIndex + 1} Curation
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {currentDay.country || 'Kenya'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {currentDay.title || `Day ${activeDayIndex + 1}`}
                    </h3>
                  </div>

                  {/* Day Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiDayDescription}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold border border-purple-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAi ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>✨ AI Enhance Day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateDay(activeDayIndex)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Duplicate Day"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDay(activeDayIndex)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scope & Logistics Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Destination */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destination</label>
                    <input
                      type="text"
                      value={currentDay.destination}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItinerary(prev => {
                          const updated = [...prev];
                          if (updated[activeDayIndex]) {
                            updated[activeDayIndex] = { ...updated[activeDayIndex], destination: val };
                          }
                          return updated;
                        });
                      }}
                      placeholder="e.g. Maasai Mara National Reserve"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Day Title */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Day Heading / Title</label>
                    <input
                      type="text"
                      value={currentDay.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItinerary(prev => {
                          const updated = [...prev];
                          if (updated[activeDayIndex]) {
                            updated[activeDayIndex] = { ...updated[activeDayIndex], title: val };
                          }
                          return updated;
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Day Image Upload */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Day Feature Photo</span>
                      {currentDay.dayImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setItinerary(prev => {
                              const updated = [...prev];
                              if (updated[activeDayIndex]) {
                                updated[activeDayIndex] = { ...updated[activeDayIndex], dayImage: undefined };
                              }
                              return updated;
                            });
                          }}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove Photo
                        </button>
                      )}
                    </label>
                    <div className="flex items-center gap-4">
                      {currentDay.dayImage && (
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-slate-200">
                          <img src={currentDay.dayImage} className="w-full h-full object-cover" alt="Day feature" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setItinerary(prev => {
                                const updated = [...prev];
                                if (updated[activeDayIndex]) {
                                  updated[activeDayIndex] = { ...updated[activeDayIndex], dayImage: base64 };
                                }
                                return updated;
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* STO Property & Camp Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Lodge / Safari Camp (STO Database)</span>
                      {currentProp && (
                        <span className="text-[10px] text-amber-700 font-mono font-bold">
                          Rack ${currentProp.rackRateHighSeasonUsd}/nt · STO ${currentProp.stoRateHighSeasonUsd}/nt
                        </span>
                      )}
                    </label>
                    <SearchableSelect
                      value={currentDay.propertyId}
                      onChange={(val) => {
                        setItinerary(prev => {
                          const updated = [...prev];
                          if (updated[activeDayIndex]) {
                            updated[activeDayIndex] = { ...updated[activeDayIndex], propertyId: val };
                          }
                          return updated;
                        });
                      }}
                      options={stoDatabase.map(p => ({
                        value: p.id,
                        label: `${p.name} — ${p.boardBasis}`,
                        subLabel: `${p.country} · ${p.region}`
                      }))}
                      placeholder="-- Select Accommodation Property --"
                      className="font-semibold"
                    />
                  </div>

                  {/* Park Entry & Conservancy Fees */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Park Entry / Conservancy Fee</span>
                      {currentDay.parkFeeId && (
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">
                          ${PARK_FEES_DATABASE.find(pf => pf.id === currentDay.parkFeeId)?.highSeasonFeeUsd || 0}/pax
                        </span>
                      )}
                    </label>
                    <SearchableSelect
                      value={currentDay.parkFeeId || ''}
                      onChange={(val) => {
                        setItinerary(prev => {
                          const updated = [...prev];
                          if (updated[activeDayIndex]) {
                            updated[activeDayIndex] = { ...updated[activeDayIndex], parkFeeId: val };
                          }
                          return updated;
                        });
                      }}
                      options={PARK_FEES_DATABASE.map(pf => ({
                        value: pf.id,
                        label: pf.parkName,
                        subLabel: `${pf.country} — $${pf.highSeasonFeeUsd} Non-Resident`
                      }))}
                      placeholder="-- No Park Fee This Day --"
                    />
                  </div>

                  {/* Transport Option */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Transport Vehicle</label>
                    <SearchableSelect
                      value={currentDay.transportVehicleId}
                      onChange={(val) => {
                        setItinerary(prev => {
                          const updated = [...prev];
                          if (updated[activeDayIndex]) {
                            updated[activeDayIndex] = { ...updated[activeDayIndex], transportVehicleId: val };
                          }
                          return updated;
                        });
                      }}
                      options={TRANSPORT_OPTIONS.map(tr => ({
                        value: tr.id,
                        label: tr.name,
                        subLabel: `$${tr.dailyRateHighUsd}/day`
                      }))}
                    />
                  </div>

                  {/* Route Logistics: Distance & Driving Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Distance (km)</label>
                      <input
                        type="number"
                        value={currentDay.distanceKm || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setItinerary(prev => {
                            const updated = [...prev];
                            if (updated[activeDayIndex]) {
                              updated[activeDayIndex] = { ...updated[activeDayIndex], distanceKm: val };
                            }
                            return updated;
                          });
                        }}
                        className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Drive Time</label>
                      <input
                        type="text"
                        value={currentDay.drivingTimeHours || '~4 hrs'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItinerary(prev => {
                            const updated = [...prev];
                            if (updated[activeDayIndex]) {
                              updated[activeDayIndex] = { ...updated[activeDayIndex], drivingTimeHours: val };
                            }
                            return updated;
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Activities Selection Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block text-xs">
                    Curated Safari Activities for Day {activeDayIndex + 1}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACTIVITY_OPTIONS.slice(0, 9).map(act => {
                      const isSelected = currentDay.activityIds?.includes(act.id);
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => {
                            setItinerary(prev => {
                              const updated = [...prev];
                              if (updated[activeDayIndex]) {
                                const currentActs = updated[activeDayIndex].activityIds || [];
                                const newActs = isSelected
                                  ? currentActs.filter(id => id !== act.id)
                                  : [...currentActs, act.id];
                                updated[activeDayIndex] = { ...updated[activeDayIndex], activityIds: newActs };
                              }
                              return updated;
                            });
                          }}
                          className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{act.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal shrink-0 ml-1">
                            +${act.ratePerPaxUsd}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Narrative Description & Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block text-xs">
                    Day Narrative Experience & Client Description
                  </label>
                  <textarea
                    rows={3}
                    value={currentDay.notes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItinerary(prev => {
                        const updated = [...prev];
                        if (updated[activeDayIndex]) {
                          updated[activeDayIndex] = { ...updated[activeDayIndex], notes: val };
                        }
                        return updated;
                      });
                    }}
                    placeholder="Enter detailed day narrative or click 'AI Enhance Day' above to auto-generate."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* DETAILED TIME-OF-DAY SCHEDULE TIMELINE */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Detailed Time-of-Day Schedule
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Morning · Afternoon · Evening
                    </span>
                  </div>

                  {/* Morning Segment */}
                  <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        Morning Program
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemSlot('morning');
                          setNewItemTime('08:00 AM');
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {morningItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white p-2.5 rounded-lg border border-amber-100 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              {item.time}
                            </span>
                            <div>
                              <strong className="text-slate-900">{item.title}</strong>
                              <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('morning', item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon Segment */}
                  <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-blue-600" />
                        Afternoon Program
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemSlot('afternoon');
                          setNewItemTime('02:00 PM');
                        }}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {afternoonItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.time}
                            </span>
                            <div>
                              <strong className="text-slate-900">{item.title}</strong>
                              <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('afternoon', item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evening Segment */}
                  <div className="bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        Evening Program
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemSlot('evening');
                          setNewItemTime('07:30 PM');
                        }}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {eveningItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {item.time}
                            </span>
                            <div>
                              <strong className="text-slate-900">{item.title}</strong>
                              <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('evening', item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Item Inline Dialog */}
                {newItemSlot && (
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 uppercase tracking-wider">
                        Add {newItemSlot} Activity Item
                      </h5>
                      <button
                        type="button"
                        onClick={() => setNewItemSlot(null)}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Time</label>
                        <input
                          type="text"
                          value={newItemTime}
                          onChange={(e) => setNewItemTime(e.target.value)}
                          placeholder="e.g. 08:30 AM"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Activity Title</label>
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="e.g. Great Migration Crossing Observation"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Description / Location</label>
                      <input
                        type="text"
                        value={newItemSubtitle}
                        onChange={(e) => setNewItemSubtitle(e.target.value)}
                        placeholder="e.g. Mara River crossing point #4 with bush coffee"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNewItemSlot(null)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewItem}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-xs cursor-pointer"
                      >
                        Add to Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE COSTING & QUOTE SIDEBAR (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Day Costing Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Day {activeDayIndex + 1} Cost Breakdown
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Net Internal
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Accommodation (STO):</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(currentBreakdown?.accommodationNetUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Park & Entry Fees:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(currentBreakdown?.parkFeesUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Vehicle & Transport:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(currentBreakdown?.transportNetUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Activities & Excursions:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(currentBreakdown?.activitiesUsd ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span className="text-slate-800">Day Total Net Cost:</span>
                    <span className="font-mono text-emerald-800">
                      ${(dayInternalCost ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-amber-700">
                    <span>Day Client Selling Price:</span>
                    <span className="font-mono">
                      ${Math.round(daySellingPrice ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Master Itinerary Totals & Profitability Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Live Safari Quotation
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    {(clientInputs?.paxAdults || 0) + (clientInputs?.paxChildren || 0)} Guests
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Total Client Quotation ({totals?.selectedCurrency || 'USD'})</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    ${(totals?.grandSellingPriceConverted ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-400 font-mono mt-0.5">
                    ${Math.round(totals?.pricePerPersonConverted ?? 0).toLocaleString()} / per person
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Net Cost:</span>
                    <span className="font-mono font-bold text-slate-200">
                      ${(totals?.grandTotalCostUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gross Margin:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {totals?.effectiveGrossMarginPercent?.toFixed(1) || '17.5'}%
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons from Curation Workspace */}
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={onPreviewQuote}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Generate Proposal & Quote</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToCosting}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fine-Tune in Master Costing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CIRCUIT CATALOG TABS (FIT, Group, Scheduled) */}
      {(activeTab === 'fit' || activeTab === 'group' || activeTab === 'scheduled') && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 capitalize">
                {activeTab === 'scheduled' ? 'Scheduled Fixed Departures' : activeTab === 'group' ? 'Group Charters & Club Itineraries' : 'FIT Bespoke Safari Circuits'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Load ready-made circuits directly into the Curation Workspace or customize day-by-day
              </p>
            </div>
            {onOpenNewItinerary && (
              <button
                type="button"
                onClick={onOpenNewItinerary}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Circuit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'fit' ? fitItineraries : activeTab === 'group' ? groupItineraries : scheduledItineraries).map(circuit => (
              <div
                key={circuit.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {circuit.country}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {circuit.durationDays} Days / {circuit.durationNights} Nights
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{circuit.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{circuit.summary}</p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Travel Style:</span>
                      <strong className="text-slate-900">{circuit.travelStyleTier.split('/')[0].trim()}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vehicle:</span>
                      <strong className="text-slate-900">{circuit.defaultVehicle.split('(')[0].trim()}</strong>
                    </div>
                    <div className="flex items-center justify-between font-bold text-amber-800 pt-1 border-t border-slate-200/60">
                      <span>Starting From:</span>
                      <span className="font-mono">${(circuit.startingPriceUsd ?? 0).toLocaleString()} /pp</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLoadCircuit(circuit)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load into Curation Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. UPLOAD READY-MADE ITINERARY STUDIO */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Ready-Made Itinerary Studio</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload existing client briefs, RFP documents, Word/PDF proposals, or text itineraries for AI extraction
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition-all bg-emerald-50/30 relative cursor-pointer group">
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx,.csv,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {isParsingUpload ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                  <p className="text-xs font-bold text-slate-900">
                    Parsing & Structuring Itinerary with AI Intelligence...
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Extracting destinations, camps, vehicles, schedules, and pricing
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-900">
                    {uploadFileName ? `Loaded: ${uploadFileName}` : 'Click to browse or drag & drop ready-made itinerary document'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, TXT, CSV, or JSON client briefs</p>
                </div>
              )}
            </div>

            {/* Parsed Result Preview */}
            {parsedItineraryResult && (
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        {parsedItineraryResult.title}
                      </h4>
                      <span className="text-[11px] text-emerald-800">
                        {parsedItineraryResult.days.length} Days Generated · {parsedItineraryResult.country}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadCircuit(parsedItineraryResult)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Load into Curation Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed">
                  {parsedItineraryResult.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
