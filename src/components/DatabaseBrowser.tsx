import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Flame,
  History,
  Info,
  Layers,
  MapPin,
  Plane,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TreePine,
  Trees,
  Truck,
  Upload,
  X
} from 'lucide-react';
import {
  ActivityOption,
  CostingDraft,
  ExtraOperationalCost,
  FlightOption,
  ParkFeeRecord,
  STOAccommodationProperty,
  STOSeasonRate,
  TransportOption
} from '../types/costing';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import { ACTIVITY_OPTIONS, FLIGHT_OPTIONS, OPERATIONAL_EXTRAS, TRANSPORT_OPTIONS } from '../data/transportAndExtrasData';
import { ContractImporter } from './ContractImporter';
import { RecentDrafts } from './RecentDrafts';

interface DatabaseBrowserProps {
  stoProperties?: STOAccommodationProperty[];
  parkFees?: ParkFeeRecord[];
  activities?: ActivityOption[];
  transport?: TransportOption[];
  flights?: FlightOption[];
  extras?: ExtraOperationalCost[];
  drafts?: CostingDraft[];
  onAddProperties?: (newProps: STOAccommodationProperty[]) => void;
  onAddParkFees?: (newParks: ParkFeeRecord[]) => void;
  onAddActivities?: (newActs: ActivityOption[]) => void;
  onAddTransport?: (newTrans: TransportOption[]) => void;
  onAddFlights?: (newFlights: FlightOption[]) => void;
  onAddExtras?: (newExtras: ExtraOperationalCost[]) => void;
  onUpdateProperty?: (updated: STOAccommodationProperty) => void;
  onUpdateParkFee?: (updated: ParkFeeRecord) => void;
  onUpdateActivity?: (updated: ActivityOption) => void;
  onUpdateTransport?: (updated: TransportOption) => void;
  onUpdateFlight?: (updated: FlightOption) => void;
  onUpdateExtra?: (updated: ExtraOperationalCost) => void;
  onDeleteProperty?: (id: string) => void;
  onDeleteParkFee?: (id: string) => void;
  onDeleteActivity?: (id: string) => void;
  onDeleteTransport?: (id: string) => void;
  onDeleteFlight?: (id: string) => void;
  onDeleteExtra?: (id: string) => void;
  onDeduplicateDatabase?: () => void;
  onResetDatabase?: () => void;
  onRestoreDraft?: (draft: CostingDraft) => void;
  onDeleteDraft?: (id: string) => void;
  onClearAllDrafts?: () => void;
  onSaveManualSnapshot?: () => void;
  autoSaveStatus?: 'saved' | 'saving' | 'unsaved' | 'disabled';
  lastAutoSavedAt?: Date | null;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: () => void;
  activeQuoteRef?: string;
  initialSubTab?: 'sto' | 'importer' | 'parks' | 'activities' | 'transport' | 'flights' | 'extras' | 'drafts';
  onOpenAddSupplier?: () => void;
  onOpenRecoveryVault?: () => void;
  serverSyncStatus?: 'synced' | 'syncing' | 'offline';
  serverDbStats?: { accommodationsCount: number; rateTiersCount: number } | null;
  onManualCloudSync?: () => Promise<void> | void;
}

export const DatabaseBrowser: React.FC<DatabaseBrowserProps> = ({
  stoProperties = [],
  parkFees = PARK_FEES_DATABASE,
  activities = ACTIVITY_OPTIONS,
  transport = TRANSPORT_OPTIONS,
  flights = FLIGHT_OPTIONS,
  extras = OPERATIONAL_EXTRAS,
  drafts = [],
  onAddProperties,
  onAddParkFees,
  onAddActivities,
  onAddTransport,
  onAddFlights,
  onAddExtras,
  onUpdateProperty,
  onUpdateParkFee,
  onUpdateActivity,
  onUpdateTransport,
  onUpdateFlight,
  onUpdateExtra,
  onDeleteProperty,
  onDeleteParkFee,
  onDeleteActivity,
  onDeleteTransport,
  onDeleteFlight,
  onDeleteExtra,
  onDeduplicateDatabase,
  onResetDatabase,
  onRestoreDraft,
  onDeleteDraft,
  onClearAllDrafts,
  onSaveManualSnapshot,
  autoSaveStatus = 'saved',
  lastAutoSavedAt = null,
  autoSaveEnabled = true,
  onToggleAutoSave,
  activeQuoteRef,
  initialSubTab = 'sto',
  onOpenAddSupplier,
  onOpenRecoveryVault,
  serverSyncStatus = 'synced',
  serverDbStats,
  onManualCloudSync
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sto' | 'importer' | 'parks' | 'activities' | 'transport' | 'flights' | 'extras' | 'drafts'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<'All' | 'Kenya' | 'Tanzania'>('All');

  // Edit Modal State
  const [editingItemType, setEditingItemType] = useState<'property' | 'park' | 'activity' | 'transport' | 'flight' | 'extra' | null>(null);
  const [editingProperty, setEditingProperty] = useState<STOAccommodationProperty | null>(null);
  const [editingPark, setEditingPark] = useState<ParkFeeRecord | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityOption | null>(null);
  const [editingTransport, setEditingTransport] = useState<TransportOption | null>(null);
  const [editingFlight, setEditingFlight] = useState<FlightOption | null>(null);
  const [editingExtra, setEditingExtra] = useState<ExtraOperationalCost | null>(null);

  // Filter STO Database
  const filteredSTO = stoProperties.filter(prop => {
    const matchesCountry = selectedCountry === 'All' || prop.country === selectedCountry;
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.roomCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  // Filter Parks Database
  const filteredParks = parkFees.filter(park => {
    const matchesCountry = selectedCountry === 'All' || park.country === selectedCountry;
    const matchesSearch =
      park.parkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      park.officialAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      park.areaType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  // Filter Activities Database
  const filteredActivities = activities.filter(act => {
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter Transport Database
  const filteredTransport = transport.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.includes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter Flights Database
  const filteredFlights = flights.filter(f => {
    const matchesSearch =
      f.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.departurePoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.arrivalPoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter Extras Database
  const filteredExtras = extras.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handlers for Editing
  const handleOpenEditProperty = (prop: STOAccommodationProperty) => {
    setEditingProperty(JSON.parse(JSON.stringify(prop)));
    setEditingItemType('property');
  };

  const handleSaveProperty = () => {
    if (editingProperty && onUpdateProperty) {
      onUpdateProperty(editingProperty);
    }
    setEditingItemType(null);
    setEditingProperty(null);
  };

  const handleOpenEditPark = (park: ParkFeeRecord) => {
    setEditingPark({ ...park });
    setEditingItemType('park');
  };

  const handleSavePark = () => {
    if (editingPark && onUpdateParkFee) {
      onUpdateParkFee(editingPark);
    }
    setEditingItemType(null);
    setEditingPark(null);
  };

  const handleOpenEditActivity = (act: ActivityOption) => {
    setEditingActivity({ ...act });
    setEditingItemType('activity');
  };

  const handleSaveActivity = () => {
    if (editingActivity && onUpdateActivity) {
      onUpdateActivity(editingActivity);
    }
    setEditingItemType(null);
    setEditingActivity(null);
  };

  const handleOpenEditTransport = (trans: TransportOption) => {
    setEditingTransport({ ...trans });
    setEditingItemType('transport');
  };

  const handleSaveTransport = () => {
    if (editingTransport && onUpdateTransport) {
      onUpdateTransport(editingTransport);
    }
    setEditingItemType(null);
    setEditingTransport(null);
  };

  const handleOpenEditFlight = (flight: FlightOption) => {
    setEditingFlight({ ...flight });
    setEditingItemType('flight');
  };

  const handleSaveFlight = () => {
    if (editingFlight && onUpdateFlight) {
      onUpdateFlight(editingFlight);
    }
    setEditingItemType(null);
    setEditingFlight(null);
  };

  const handleOpenEditExtra = (extra: ExtraOperationalCost) => {
    setEditingExtra({ ...extra });
    setEditingItemType('extra');
  };

  const handleSaveExtra = () => {
    if (editingExtra && onUpdateExtra) {
      onUpdateExtra(editingExtra);
    }
    setEditingItemType(null);
    setEditingExtra(null);
  };

  return (
    <div id="database-browser" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              East Africa Safari Databases & STO Tariff Registry
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {stoProperties.length} Lodges & Camps
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
              {parkFees.length} Parks
            </span>
            {/* Live Server Persistence Indicator */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300 border border-amber-500/30">
              <span className={`w-1.5 h-1.5 rounded-full ${serverSyncStatus === 'synced' ? 'bg-emerald-400' : serverSyncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
              {serverSyncStatus === 'syncing' ? 'Syncing Server DB...' : 'Server Persistent DB Live'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified wholesale source data for Kenya and Tanzania safari pricing. Use AI Ingestor to upload bulk supplier contracts or rate sheets to automatically populate Accommodations, Activities, and Park Fees.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onManualCloudSync && (
            <button
              id="btn-cloud-sync-master"
              type="button"
              onClick={() => onManualCloudSync()}
              title="Force sync current rates to server database"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-slate-200"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sync Cloud</span>
            </button>
          )}

          {onOpenAddSupplier && (
            <button
              id="btn-add-supplier-header"
              type="button"
              onClick={onOpenAddSupplier}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Rate</span>
            </button>
          )}

          <button
            id="btn-open-ai-importer"
            type="button"
            onClick={() => setActiveSubTab('importer')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              activeSubTab === 'importer'
                ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 shadow-xs active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Bulk AI Contract Ingestor</span>
          </button>

          {onResetDatabase && (
            <button
              type="button"
              onClick={onResetDatabase}
              title="Reset databases to verified default tariffs"
              className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveSubTab('sto')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'sto'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          STO Accommodations ({stoProperties.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('importer')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'importer'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Bulk AI Ingestion
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('parks')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'parks'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TreePine className="w-3.5 h-3.5" />
          Park Fees ({parkFees.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('activities')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'activities'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Activities ({activities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('transport')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'transport'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Transport ({transport.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('flights')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'flights'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          Flights ({flights.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('extras')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'extras'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Extras ({extras.length})
        </button>
        <button
          type="button"
          id="subtab-drafts"
          onClick={() => setActiveSubTab('drafts')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'drafts'
              ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-500" />
          <span>Recent Drafts ({drafts.length})</span>
          {autoSaveStatus === 'saving' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* SUBTAB: RECENT DRAFTS */}
      {activeSubTab === 'drafts' && (
        <RecentDrafts
          drafts={drafts}
          onRestoreDraft={onRestoreDraft || (() => {})}
          onDeleteDraft={onDeleteDraft || (() => {})}
          onClearAllDrafts={onClearAllDrafts || (() => {})}
          onSaveManualSnapshot={onSaveManualSnapshot || (() => {})}
          autoSaveStatus={autoSaveStatus}
          lastAutoSavedAt={lastAutoSavedAt}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={onToggleAutoSave}
          activeQuoteRef={activeQuoteRef}
        />
      )}

      {/* SUBTAB: AI CONTRACT IMPORTER */}
      {activeSubTab === 'importer' && (
        <ContractImporter
          onAddProperties={onAddProperties}
          onAddActivities={onAddActivities}
          onAddParkFees={onAddParkFees}
          onAddTransport={onAddTransport}
          onAddFlights={onAddFlights}
          onAddExtras={onAddExtras}
          onClose={() => setActiveSubTab('sto')}
        />
      )}

      {/* Search & Filter Bar */}
      {activeSubTab !== 'importer' && activeSubTab !== 'drafts' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeSubTab}...`}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {(activeSubTab === 'sto' || activeSubTab === 'parks') && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 font-medium">Filter Country:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['All', 'Kenya', 'Tanzania'] as const).map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className={`px-3 py-1 rounded-md transition-all font-semibold ${
                      selectedCountry === country
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. STO ACCOMMODATIONS TABLE VIEW */}
      {activeSubTab === 'sto' && (
        <div className="space-y-4">
          
          {/* Rate Integrity & Stats Bar */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span>Wholesale STO Rate Registry</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-semibold">
                    Zero-Duplicate Rates Enforced
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {stoProperties.length} verified safari facilities across Kenya & Tanzania • {stoProperties.reduce((sum, p) => sum + (p.seasons?.length || 0), 0)} unique rate tiers
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {onOpenRecoveryVault && (
                <button
                  type="button"
                  onClick={onOpenRecoveryVault}
                  className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rate Vault & Recovery</span>
                </button>
              )}

              {onDeduplicateDatabase && (
                <button
                  type="button"
                  onClick={() => {
                    onDeduplicateDatabase();
                    alert('Wholesale rate database has been verified and deduplicated.');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verify & Deduplicate</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSTO.map((prop, idx) => (
              <div
                key={`${prop.id}-${idx}`}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-5 shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{prop.name}</span>
                      {prop.facilityGroup && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {prop.facilityGroup}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {prop.boardBasis}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prop.marketSegment === 'East Africa Resident' || prop.marketSegment === 'Citizen'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {prop.marketSegment || 'Non-Resident'} ({prop.currency || 'USD'})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {prop.roomCategory}
                      </span>
                      {prop.id.includes('kizingo') && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          2026 FB & Rack STO Ingested
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {prop.country} — {prop.region}
                      </span>
                      <span>•</span>
                      <span>Park Key: <code className="font-mono text-slate-600">{prop.parkOrConservancyId}</code></span>
                      <span>•</span>
                      <span>Source: <span className="font-medium text-slate-700">{prop.sourceDocument}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-start">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProperty(prop)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-amber-600" />
                      <span>Edit Property & Rates</span>
                    </button>

                    {onDeleteProperty && (
                      <button
                        type="button"
                        onClick={() => onDeleteProperty(prop.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Property Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Seasons List */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 font-medium">
                        <th className="py-2">Season Name</th>
                        <th className="py-2">Date Range</th>
                        <th className="py-2 text-right">Net STO PPS</th>
                        <th className="py-2 text-right">Single Supp</th>
                        <th className="py-2 text-right">Child Factor</th>
                        <th className="py-2 text-right">Min Nights</th>
                        <th className="py-2 pl-4">Notes & Inclusions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {prop.seasons.map((season, sIdx) => (
                        <tr key={`${season.id || 'season'}-${sIdx}`} className="hover:bg-slate-50/60">
                          <td className="py-2 font-sans font-semibold text-slate-800">{season.seasonName}</td>
                          <td className="py-2 text-slate-600">{season.startDate} to {season.endDate}</td>
                          <td className="py-2 text-right font-bold text-emerald-700">
                            ${season.ppsUsd.toFixed(2)}
                            {season.ppsLocalCurrency ? (
                              <span className="block text-[9px] text-slate-500 font-normal mt-0.5">
                                ({prop.currency || 'KES'} {season.ppsLocalCurrency.toLocaleString()})
                              </span>
                            ) : null}
                          </td>
                          <td className="py-2 text-right text-slate-700">+${season.srsUsd.toFixed(2)}</td>
                          <td className="py-2 text-right text-slate-600">{(season.childRateFactor * 100).toFixed(0)}%</td>
                          <td className="py-2 text-right text-slate-600">{season.minNights}</td>
                          <td className="py-2 pl-4 font-sans text-slate-500 text-[11px]">{season.notes || season.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PARK FEES DATABASE VIEW */}
      {activeSubTab === 'parks' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Park / Reserve Name</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">High Season ($)</th>
                  <th className="p-3 text-right">Low Season ($)</th>
                  <th className="p-3 text-right">Vehicle Entry ($)</th>
                  <th className="p-3 text-right">Concession ($)</th>
                  <th className="p-3">Authority & Tariff</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParks.map((park, idx) => (
                  <tr key={`${park.id}-${idx}`} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{park.parkName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {park.id}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{park.country}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {park.areaType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">${park.highSeasonFeeUsd.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-700">${park.lowSeasonFeeUsd.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-700">${(park.vehicleFeeUsd || 0).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{park.concessionFeeUsd ? `$${park.concessionFeeUsd.toFixed(2)}` : '—'}</td>
                    <td className="p-3">
                      <div className="text-slate-800 font-semibold">{park.officialAuthority}</div>
                      <div className="text-[10px] text-slate-400">{park.effectivePeriod}</div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPark(park)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit Park Fee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteParkFee && (
                          <button
                            type="button"
                            onClick={() => onDeleteParkFee(park.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ACTIVITIES DATABASE VIEW */}
      {activeSubTab === 'activities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act, idx) => (
            <div
              key={`${act.id}-${idx}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{act.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 whitespace-nowrap">
                    {act.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{act.location}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-emerald-700">
                    ${act.ratePerPaxUsd.toFixed(2)} / pax
                  </div>
                  {act.ratePerVehicleUsd && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ${act.ratePerVehicleUsd.toFixed(2)} / charter
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditActivity(act)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteActivity && (
                    <button
                      type="button"
                      onClick={() => onDeleteActivity(act.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. TRANSPORT DATABASE VIEW */}
      {activeSubTab === 'transport' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransport.map((trans, idx) => (
            <div
              key={`${trans.id}-${idx}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{trans.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Max {trans.maxCapacity} Pax
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{trans.vehicleType}</div>
                <p className="text-xs text-slate-600 mt-2">
                  Includes: {trans.includes}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-emerald-700">
                    High: ${trans.dailyRateHighUsd.toFixed(2)}/day
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Low: ${trans.dailyRateLowUsd.toFixed(2)}/day • Guide: +${trans.driverAllowanceDailyUsd}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTransport(trans)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteTransport && (
                    <button
                      type="button"
                      onClick={() => onDeleteTransport(trans.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. FLIGHTS DATABASE VIEW */}
      {activeSubTab === 'flights' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlights.map((flight, idx) => (
            <div
              key={`${flight.id}-${idx}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{flight.route}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                    {flight.airline}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  {flight.departurePoint} ➔ {flight.arrivalPoint} • {flight.baggageLimitKg}kg Limit
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="font-mono font-bold text-xs text-emerald-700">
                  ${flight.oneWayRateUsd.toFixed(2)} / seat
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditFlight(flight)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteFlight && (
                    <button
                      type="button"
                      onClick={() => onDeleteFlight(flight.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. EXTRAS DATABASE VIEW */}
      {activeSubTab === 'extras' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExtras.map((extra, idx) => (
            <div
              key={`${extra.id}-${idx}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{extra.name}</span>
                  {extra.mandatory && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2">{extra.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-emerald-700">
                    ${extra.rateUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">{extra.unit}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditExtra(extra)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteExtra && (
                    <button
                      type="button"
                      onClick={() => onDeleteExtra(extra.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EDIT ACCOMMODATION PROPERTY */}
      {editingItemType === 'property' && editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Edit Accommodation Property & Seasons</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Property Name:</label>
                <input
                  type="text"
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hospitality Group:</label>
                <input
                  type="text"
                  value={editingProperty.facilityGroup || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, facilityGroup: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="e.g. Serena, Sarova"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country:</label>
                <select
                  value={editingProperty.country}
                  onChange={(e) => setEditingProperty({ ...editingProperty, country: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Uganda">Uganda</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Market Segment:</label>
                <select
                  value={editingProperty.marketSegment || 'Non-Resident'}
                  onChange={(e) => setEditingProperty({ ...editingProperty, marketSegment: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Non-Resident">Non-Resident (International)</option>
                  <option value="East Africa Resident">East Africa Resident</option>
                  <option value="Citizen">East African Citizen</option>
                  <option value="All Markets">All Markets</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contract Currency:</label>
                <select
                  value={editingProperty.currency || 'USD'}
                  onChange={(e) => setEditingProperty({ ...editingProperty, currency: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KES">KES</option>
                  <option value="TZS">TZS</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Region / Park Area:</label>
                <input
                  type="text"
                  value={editingProperty.region}
                  onChange={(e) => setEditingProperty({ ...editingProperty, region: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Linked Park / Conservancy ID:</label>
                <input
                  type="text"
                  value={editingProperty.parkOrConservancyId}
                  onChange={(e) => setEditingProperty({ ...editingProperty, parkOrConservancyId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Board Basis:</label>
                <select
                  value={editingProperty.boardBasis}
                  onChange={(e) => setEditingProperty({ ...editingProperty, boardBasis: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Full Board (FB)">Full Board (FB)</option>
                  <option value="Game Package (GP)">Game Package (GP)</option>
                  <option value="All Inclusive (AI)">All Inclusive (AI)</option>
                  <option value="Bed & Breakfast (BB)">Bed & Breakfast (BB)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Room Category:</label>
                <input
                  type="text"
                  value={editingProperty.roomCategory}
                  onChange={(e) => setEditingProperty({ ...editingProperty, roomCategory: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Seasons List Editor */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  Season Rate Tiers ({editingProperty.seasons.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newSeason: STOSeasonRate = {
                      id: `sea-${Date.now()}`,
                      seasonName: 'New Season',
                      startDate: '01-01',
                      endDate: '12-31',
                      description: 'Custom Season Rate',
                      ppsUsd: 550,
                      srsUsd: 150,
                      childRateFactor: 0.5,
                      minNights: 1,
                    };
                    setEditingProperty({
                      ...editingProperty,
                      seasons: [...editingProperty.seasons, newSeason]
                    });
                  }}
                  className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Season Tier</span>
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {editingProperty.seasons.map((season, sIdx) => (
                  <div key={season.id || sIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={season.seasonName}
                        onChange={(e) => {
                          const seasons = [...editingProperty.seasons];
                          seasons[sIdx].seasonName = e.target.value;
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        className="font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 flex-1"
                        placeholder="Season Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const seasons = editingProperty.seasons.filter((_, idx) => idx !== sIdx);
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete Season"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Start Date</span>
                        <input
                          type="text"
                          value={season.startDate}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].startDate = e.target.value;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">End Date</span>
                        <input
                          type="text"
                          value={season.endDate}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].endDate = e.target.value;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Net PPS ($ USD)</span>
                        <input
                          type="number"
                          value={season.ppsUsd}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].ppsUsd = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px] font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Single Supp ($ USD)</span>
                        <input
                          type="number"
                          value={season.srsUsd}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].srsUsd = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Local Currency Rate</span>
                        <input
                          type="number"
                          value={season.ppsLocalCurrency || ''}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].ppsLocalCurrency = e.target.value ? Number(e.target.value) : undefined;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          placeholder="e.g. 35000"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Child Rate Factor (0.5)</span>
                        <input
                          type="number"
                          step="0.05"
                          value={season.childRateFactor}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].childRateFactor = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Min Nights</span>
                        <input
                          type="number"
                          value={season.minNights || 1}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].minNights = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={season.notes || ''}
                        onChange={(e) => {
                          const seasons = [...editingProperty.seasons];
                          seasons[sIdx].notes = e.target.value;
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        placeholder="Inclusions / Notes"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProperty}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs"
              >
                Save Property Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PARK FEE */}
      {editingItemType === 'park' && editingPark && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-600" />
                <span>Edit Park & Conservancy Tariff</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Park Name:</label>
                <input
                  type="text"
                  value={editingPark.parkName}
                  onChange={(e) => setEditingPark({ ...editingPark, parkName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Country:</label>
                  <select
                    value={editingPark.country}
                    onChange={(e) => setEditingPark({ ...editingPark, country: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Uganda">Uganda</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tariff Category:</label>
                  <select
                    value={editingPark.category}
                    onChange={(e) => setEditingPark({ ...editingPark, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="Non-Resident Adult">Non-Resident Adult</option>
                    <option value="Non-Resident Child">Non-Resident Child</option>
                    <option value="Resident Adult">Resident Adult (EA)</option>
                    <option value="Resident Child">Resident Child (EA)</option>
                    <option value="Citizen Adult">Citizen Adult</option>
                    <option value="Vehicle">Vehicle Entry</option>
                    <option value="Crater Descent">Crater Descent</option>
                    <option value="Concession Fee">Concession Fee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Area Type:</label>
                  <input
                    type="text"
                    value={editingPark.areaType}
                    onChange={(e) => setEditingPark({ ...editingPark, areaType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Currency:</label>
                  <select
                    value={editingPark.currency || 'USD'}
                    onChange={(e) => setEditingPark({ ...editingPark, currency: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES</option>
                    <option value="TZS">TZS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">High Season ($):</label>
                  <input
                    type="number"
                    value={editingPark.highSeasonFeeUsd}
                    onChange={(e) => setEditingPark({ ...editingPark, highSeasonFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Season ($):</label>
                  <input
                    type="number"
                    value={editingPark.lowSeasonFeeUsd}
                    onChange={(e) => setEditingPark({ ...editingPark, lowSeasonFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Local Fee:</label>
                  <input
                    type="number"
                    value={editingPark.feeLocalCurrency || ''}
                    onChange={(e) => setEditingPark({ ...editingPark, feeLocalCurrency: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vehicle Fee ($):</label>
                  <input
                    type="number"
                    value={editingPark.vehicleFeeUsd || 0}
                    onChange={(e) => setEditingPark({ ...editingPark, vehicleFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Concession ($):</label>
                  <input
                    type="number"
                    value={editingPark.concessionFeeUsd || ''}
                    onChange={(e) => setEditingPark({ ...editingPark, concessionFeeUsd: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePark}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACTIVITY */}
      {editingItemType === 'activity' && editingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Edit Activity Option</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name:</label>
                <input
                  type="text"
                  value={editingActivity.name}
                  onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={editingActivity.category}
                    onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Wildlife/Nature">Wildlife/Nature</option>
                    <option value="Aerial">Aerial</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Water">Water</option>
                    <option value="Dining">Dining</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location:</label>
                  <input
                    type="text"
                    value={editingActivity.location}
                    onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate Per Pax ($):</label>
                  <input
                    type="number"
                    value={editingActivity.ratePerPaxUsd}
                    onChange={(e) => setEditingActivity({ ...editingActivity, ratePerPaxUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate Per Vehicle ($):</label>
                  <input
                    type="number"
                    value={editingActivity.ratePerVehicleUsd || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, ratePerVehicleUsd: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveActivity}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TRANSPORT */}
      {editingItemType === 'transport' && editingTransport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Edit Safari Transport Option</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle / Transport Name:</label>
                <input
                  type="text"
                  value={editingTransport.name}
                  onChange={(e) => setEditingTransport({ ...editingTransport, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Transport Type:</label>
                  <select
                    value={editingTransport.vehicleType}
                    onChange={(e) => setEditingTransport({ ...editingTransport, vehicleType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="4x4 Safari Land Cruiser">4x4 Safari Land Cruiser</option>
                    <option value="Safari Minivan">Safari Minivan</option>
                    <option value="Overland Truck">Overland Truck</option>
                    <option value="Transfers">Transfers</option>
                    <option value="Car rental">Car rental</option>
                    <option value="Air transport">Air transport</option>
                    <option value="Charter flight">Charter flight</option>
                    <option value="Train">Train</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Capacity:</label>
                  <input
                    type="number"
                    value={editingTransport.maxCapacity}
                    onChange={(e) => setEditingTransport({ ...editingTransport, maxCapacity: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">High Season Daily ($):</label>
                  <input
                    type="number"
                    value={editingTransport.dailyRateHighUsd}
                    onChange={(e) => setEditingTransport({ ...editingTransport, dailyRateHighUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Season Daily ($):</label>
                  <input
                    type="number"
                    value={editingTransport.dailyRateLowUsd}
                    onChange={(e) => setEditingTransport({ ...editingTransport, dailyRateLowUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTransport}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FLIGHT */}
      {editingItemType === 'flight' && editingFlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-600" />
                <span>Edit Flight Route</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Route:</label>
                <input
                  type="text"
                  value={editingFlight.route}
                  onChange={(e) => setEditingFlight({ ...editingFlight, route: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Airline:</label>
                  <input
                    type="text"
                    value={editingFlight.airline}
                    onChange={(e) => setEditingFlight({ ...editingFlight, airline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">One-Way Rate ($):</label>
                  <input
                    type="number"
                    value={editingFlight.oneWayRateUsd}
                    onChange={(e) => setEditingFlight({ ...editingFlight, oneWayRateUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFlight}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXTRA */}
      {editingItemType === 'extra' && editingExtra && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Edit Operational Extra</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name:</label>
                <input
                  type="text"
                  value={editingExtra.name}
                  onChange={(e) => setEditingExtra({ ...editingExtra, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate ($):</label>
                  <input
                    type="number"
                    value={editingExtra.rateUsd}
                    onChange={(e) => setEditingExtra({ ...editingExtra, rateUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit:</label>
                  <select
                    value={editingExtra.unit}
                    onChange={(e) => setEditingExtra({ ...editingExtra, unit: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Per Person">Per Person</option>
                    <option value="Per Person Per Day">Per Person Per Day</option>
                    <option value="Per Vehicle">Per Vehicle</option>
                    <option value="Per Group">Per Group</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExtra}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
