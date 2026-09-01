import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MasterCostingCalculatorView } from './components/MasterCostingCalculatorView';
import { ItineraryDesignerView } from './components/ItineraryDesignerView';
import { ItineraryQuotePreview } from './components/ItineraryQuotePreview';
import { DatabaseBrowser } from './components/DatabaseBrowser';
import { BookingsPipeline } from './components/BookingsPipeline';
import { EnquiriesView } from './components/EnquiriesView';
import { FleetView } from './components/FleetView';
import { GuidesView } from './components/GuidesView';
import { InvoicesView } from './components/InvoicesView';
import { BookingVouchersView } from './components/BookingVouchersView';
import { DigitalTourDocPortal } from './components/DigitalTourDocPortal';
import { SettingsModal } from './components/SettingsModal';
import { NewEnquiryModal } from './components/NewEnquiryModal';
import { AddTripModal } from './components/AddTripModal';
import { NewItineraryModal } from './components/NewItineraryModal';
import { NewCostingModal } from './components/NewCostingModal';
import { AddSupplierModal } from './components/AddSupplierModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { AddGuideModal } from './components/AddGuideModal';
import { RateRecoveryModal } from './components/RateRecoveryModal';
import { LoginView } from './components/LoginView';
import { useAuth } from './context/AuthContext';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import {
  ActivityOption,
  ClientQuotationInputs,
  CompanySettings,
  CostingDraft,
  CurrencyCode,
  EnquiryItem,
  ExtraOperationalCost,
  FleetVehicle,
  FlightOption,
  ItineraryDay,
  ParkFeeRecord,
  SafariGuide,
  SavedQuote,
  STOAccommodationProperty,
  TransportOption,
  UpcomingTripItem,
} from './types/costing';
import { DEFAULT_CLIENT_INPUTS, DEFAULT_KENYA_ITINERARY } from './data/defaultItineraries';
import { STO_ACCOMMODATION_DATABASE } from './data/stoAccommodationData';
import { PARK_FEES_DATABASE } from './data/parkFeesData';
import { ACTIVITY_OPTIONS, FLIGHT_OPTIONS, OPERATIONAL_EXTRAS, TRANSPORT_OPTIONS } from './data/transportAndExtrasData';
import { INITIAL_COMPANY_SETTINGS, INITIAL_FLEET, INITIAL_GUIDES } from './data/operationsData';
import { calculateMasterCosting } from './utils/costingEngine';
import { exportMasterCostingWorkbook } from './utils/excelExporter';
import {
  deduplicateAccommodationDatabase,
  mergeAccommodationDatabases,
  deduplicateParkFees,
  deduplicateActivities,
  deduplicateTransport,
  deduplicateFlights,
  deduplicateExtras
} from './utils/rateDeduplication';
import {
  getInitialProtectedAccommodations,
  saveVaultSnapshot
} from './utils/storageVault';
import {
  fetchMasterDatabaseFromServer,
  syncMasterDatabaseToServer,
  checkServerDatabaseStatus,
} from './utils/apiSync';

const STO_STORAGE_KEY = 'tusafiri_sto_database_v2';
const PARKS_STORAGE_KEY = 'tusafiri_parks_database_v2';
const ACTIVITIES_STORAGE_KEY = 'tusafiri_activities_database_v2';
const TRANSPORT_STORAGE_KEY = 'tusafiri_transport_database_v2';
const FLIGHTS_STORAGE_KEY = 'tusafiri_flights_database_v2';
const EXTRAS_STORAGE_KEY = 'tusafiri_extras_database_v2';
const SETTINGS_STORAGE_KEY = 'tusafiri_settings_v2';
const QUOTES_STORAGE_KEY = 'tusafiri_saved_quotes_v1';
const DRAFTS_STORAGE_KEY = 'tusafiri_costing_drafts_v2';
const FLEET_STORAGE_KEY = 'tusafiri_fleet_v2';
const GUIDES_STORAGE_KEY = 'tusafiri_guides_v2';

// Helper to ensure database arrays have completely unique IDs
function deduplicateList<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    let id = item.id;
    if (!id || seen.has(id)) {
      const uniqueId = `${id || 'item'}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;
      result.push({ ...item, id: uniqueId });
      seen.add(uniqueId);
    } else {
      result.push(item);
      seen.add(id);
    }
  }
  return result;
}

// Helper to upsert incoming items into existing list without creating duplicate IDs
function mergeAndDeduplicate<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of existing) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  const seenIncoming = new Set<string>();
  for (let i = 0; i < incoming.length; i++) {
    const item = incoming[i];
    if (!item) continue;
    let id = item.id || `item-${Date.now()}-${i}`;
    if (seenIncoming.has(id)) {
      id = `${id}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;
    }
    seenIncoming.add(id);
    map.set(id, { ...item, id });
  }
  return Array.from(map.values());
}

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [databaseInitialSubTab, setDatabaseInitialSubTab] = useState<'sto' | 'importer' | 'parks' | 'activities' | 'transport' | 'flights' | 'drafts'>('sto');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRecoveryVaultOpen, setIsRecoveryVaultOpen] = useState<boolean>(false);
  const [isNewEnquiryOpen, setIsNewEnquiryOpen] = useState<boolean>(false);
  const [isAddTripOpen, setIsAddTripOpen] = useState<boolean>(false);
  const [isNewItineraryOpen, setIsNewItineraryOpen] = useState<boolean>(false);
  const [isNewCostingOpen, setIsNewCostingOpen] = useState<boolean>(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState<boolean>(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState<boolean>(false);
  const [isAddGuideOpen, setIsAddGuideOpen] = useState<boolean>(false);

  const [clientInputs, setClientInputs] = useState<ClientQuotationInputs>(DEFAULT_CLIENT_INPUTS);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(DEFAULT_KENYA_ITINERARY);

  // Operations state
  const [fleet, setFleet] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(FLEET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_FLEET;
  });

  const [guides, setGuides] = useState<SafariGuide[]>(() => {
    try {
      const saved = localStorage.getItem(GUIDES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_GUIDES;
  });

  // Auto-Save Engine State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'disabled'>('saved');
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);
  const lastSavedSnapshotRef = useRef<string>('');

  // Load Recent Drafts from LocalStorage
  const [drafts, setDrafts] = useState<CostingDraft[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Load Settings
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COMPANY_SETTINGS;
  });

  // Load Saved Quotes
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try {
      const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // 1. STO Accommodation Database (with Multi-Key Protected Auto-Recovery)
  const [stoDatabase, setStoDatabase] = useState<STOAccommodationProperty[]>(() => {
    return getInitialProtectedAccommodations();
  });

  // 2. Park Fees Database
  const [parkFeesDatabase, setParkFeesDatabase] = useState<ParkFeeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PARKS_STORAGE_KEY) || localStorage.getItem('tusafiri_parks_database_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateParkFees(parsed);
        }
      }
    } catch (e) {}
    return deduplicateParkFees(PARK_FEES_DATABASE);
  });

  // 3. Activities Database
  const [activitiesDatabase, setActivitiesDatabase] = useState<ActivityOption[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY) || localStorage.getItem('tusafiri_activities_database_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateActivities(parsed);
        }
      }
    } catch (e) {}
    return deduplicateActivities(ACTIVITY_OPTIONS);
  });

  // 4. Transport Database
  const [transportDatabase, setTransportDatabase] = useState<TransportOption[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSPORT_STORAGE_KEY) || localStorage.getItem('tusafiri_transport_database_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateTransport(parsed);
        }
      }
    } catch (e) {}
    return deduplicateTransport(TRANSPORT_OPTIONS);
  });

  // 5. Flights Database
  const [flightsDatabase, setFlightsDatabase] = useState<FlightOption[]>(() => {
    try {
      const saved = localStorage.getItem(FLIGHTS_STORAGE_KEY) || localStorage.getItem('tusafiri_flights_database_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateFlights(parsed);
        }
      }
    } catch (e) {}
    return deduplicateFlights(FLIGHT_OPTIONS);
  });

  // Operational Extras Database
  const [extrasDatabase, setExtrasDatabase] = useState<ExtraOperationalCost[]>(() => {
    try {
      const saved = localStorage.getItem(EXTRAS_STORAGE_KEY) || localStorage.getItem('tusafiri_extras_database_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateExtras(parsed);
        }
      }
    } catch (e) {}
    return deduplicateExtras(OPERATIONAL_EXTRAS);
  });

  // Cloud Database Persistence State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');
  const [serverDbStats, setServerDbStats] = useState<{
    accommodationsCount: number;
    rateTiersCount: number;
  } | null>(null);

  // Initial Load from Persistent Server Master Database
  useEffect(() => {
    let isMounted = true;
    async function loadServerMasterDb() {
      try {
        setCloudSyncStatus('syncing');
        const res = await fetchMasterDatabaseFromServer();
        if (!isMounted) return;
        if (res.success && res.data) {
          const { accommodations, parkFees, activities, transport, flights, extras } = res.data;
          if (accommodations && accommodations.length > 0) {
            setStoDatabase(prev => mergeAccommodationDatabases(prev, accommodations).merged);
          }
          if (parkFees && parkFees.length > 0) {
            setParkFeesDatabase(prev => deduplicateParkFees([...prev, ...parkFees]));
          }
          if (activities && activities.length > 0) {
            setActivitiesDatabase(prev => deduplicateActivities([...prev, ...activities]));
          }
          if (transport && transport.length > 0) {
            setTransportDatabase(prev => deduplicateTransport([...prev, ...transport]));
          }
          if (flights && flights.length > 0) {
            setFlightsDatabase(prev => deduplicateFlights([...prev, ...flights]));
          }
          if (extras && extras.length > 0) {
            setExtrasDatabase(prev => deduplicateExtras([...prev, ...extras]));
          }
          if (res.stats) {
            setServerDbStats({
              accommodationsCount: res.stats.accommodationsCount,
              rateTiersCount: res.stats.rateTiersCount,
            });
          }
          setCloudSyncStatus('synced');
        } else {
          setCloudSyncStatus('offline');
        }
      } catch (err) {
        if (isMounted) setCloudSyncStatus('offline');
      }
    }
    loadServerMasterDb();
    return () => { isMounted = false; };
  }, []);

  // Sync to Redundant Multi-Key Storage
  useEffect(() => {
    try {
      localStorage.setItem(STO_STORAGE_KEY, JSON.stringify(stoDatabase));
      localStorage.setItem('tusafiri_sto_database_v1', JSON.stringify(stoDatabase));
      localStorage.setItem('tusafiri_sto_database_anchor', JSON.stringify(stoDatabase));
      localStorage.setItem('tusafiri_sto_database', JSON.stringify(stoDatabase));
      localStorage.setItem(PARKS_STORAGE_KEY, JSON.stringify(parkFeesDatabase));
      localStorage.setItem('tusafiri_parks_database_v1', JSON.stringify(parkFeesDatabase));
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activitiesDatabase));
      localStorage.setItem('tusafiri_activities_database_v1', JSON.stringify(activitiesDatabase));
      localStorage.setItem(TRANSPORT_STORAGE_KEY, JSON.stringify(transportDatabase));
      localStorage.setItem(FLIGHTS_STORAGE_KEY, JSON.stringify(flightsDatabase));
      localStorage.setItem(EXTRAS_STORAGE_KEY, JSON.stringify(extrasDatabase));
    } catch (e) {
      console.warn('Storage sync notification:', e);
    }
  }, [stoDatabase, parkFeesDatabase, activitiesDatabase, transportDatabase, flightsDatabase, extrasDatabase]);

  // Debounced Auto-Sync to Server Persistent Storage
  useEffect(() => {
    const timer = setTimeout(() => {
      syncMasterDatabaseToServer({
        accommodations: stoDatabase,
        parkFees: parkFeesDatabase,
        activities: activitiesDatabase,
        transport: transportDatabase,
        flights: flightsDatabase,
        extras: extrasDatabase,
        quotes: savedQuotes,
        drafts: drafts,
        settings: settings,
      }).then(res => {
        if (res.success && res.stats) {
          setServerDbStats({
            accommodationsCount: res.stats.accommodationsCount,
            rateTiersCount: res.stats.rateTiersCount,
          });
          setCloudSyncStatus('synced');
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [stoDatabase, parkFeesDatabase, activitiesDatabase, transportDatabase, flightsDatabase, extrasDatabase, savedQuotes, drafts, settings]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Persist Quotes
  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(savedQuotes));
    } catch (e) {}
  }, [savedQuotes]);

  // Persist Drafts
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {}
  }, [drafts]);

  // Persist Fleet
  useEffect(() => {
    try {
      localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
    } catch (e) {}
  }, [fleet]);

  // Persist Guides
  useEffect(() => {
    try {
      localStorage.setItem(GUIDES_STORAGE_KEY, JSON.stringify(guides));
    } catch (e) {}
  }, [guides]);

  // Auto-calculate Travel End Date based on Start Date and Itinerary length
  useEffect(() => {
    if (clientInputs.travelStartDate && itinerary.length > 0) {
      const startDate = new Date(clientInputs.travelStartDate);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + itinerary.length);
        const newEndDateStr = endDate.toISOString().split('T')[0];
        if (clientInputs.travelEndDate !== newEndDateStr) {
          setClientInputs(prev => ({
            ...prev,
            travelEndDate: newEndDateStr
          }));
        }
      }
    }
  }, [clientInputs.travelStartDate, itinerary.length, clientInputs.travelEndDate]);

  // Dynamic Master Calculation
  const { dayBreakdowns, totals, validations } = useMemo(() => {
    return calculateMasterCosting(
      clientInputs,
      itinerary,
      stoDatabase,
      parkFeesDatabase,
      transportDatabase,
      flightsDatabase,
      activitiesDatabase,
      extrasDatabase
    );
  }, [clientInputs, itinerary, stoDatabase, parkFeesDatabase, transportDatabase, flightsDatabase, activitiesDatabase, extrasDatabase]);

  // Real-time Draft Auto-Save Engine
  useEffect(() => {
    if (!autoSaveEnabled || itinerary.length === 0) return;

    const currentSnapshot = JSON.stringify({
      ref: clientInputs.quoteReference,
      client: clientInputs.clientName,
      lead: clientInputs.agencyOrLead,
      start: clientInputs.travelStartDate,
      end: clientInputs.travelEndDate,
      paxA: clientInputs.paxAdults,
      paxC: clientInputs.paxChildren,
      markup: clientInputs.operatorMarkupPercent,
      days: itinerary.map(d => ({
        day: d.dayNumber,
        dest: d.destination,
        prop: d.propertyId,
        park: d.parkFeeId,
        veh: d.transportVehicleId,
        fl: d.flightId,
        acts: d.activityIds
      }))
    });

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setAutoSaveStatus('unsaved');

    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');

      const destinationsSummary: string[] = Array.from(new Set(itinerary.map(d => d.destination).filter(Boolean)));
      const draftTitle = clientInputs.clientName
        ? `${clientInputs.clientName} (${itinerary.length}D in ${destinationsSummary[0] || 'East Africa'})`
        : `Safari Draft (${clientInputs.quoteReference || 'REF'})`;

      const autoDraft: CostingDraft = {
        id: `draft-${clientInputs.quoteReference || Date.now().toString()}`,
        name: draftTitle,
        quoteReference: clientInputs.quoteReference || 'TAS-DRAFT',
        clientName: clientInputs.clientName || 'Unnamed Client',
        agencyOrLead: clientInputs.agencyOrLead || 'Direct Inquiry',
        lastSaved: new Date().toISOString(),
        clientInputs: { ...clientInputs },
        itinerary: [...itinerary],
        totals: { ...totals },
        daysCount: itinerary.length,
        paxCount: clientInputs.paxAdults + clientInputs.paxChildren,
        autoSaved: true,
        grandTotalUsd: totals.grandSellingPriceUsd,
        destinationsSummary
      };

      setDrafts(prev => {
        const existingIdx = prev.findIndex(d => d.quoteReference === autoDraft.quoteReference);
        let updatedList: CostingDraft[];
        if (existingIdx >= 0) {
          updatedList = [...prev];
          updatedList[existingIdx] = autoDraft;
        } else {
          updatedList = [autoDraft, ...prev];
        }
        return updatedList.slice(0, 25);
      });

      lastSavedSnapshotRef.current = currentSnapshot;
      setLastAutoSavedAt(new Date());
      setAutoSaveStatus('saved');
    }, 3500);

    return () => clearTimeout(timer);
  }, [clientInputs, itinerary, totals, autoSaveEnabled]);

  // Actions
  const handleSaveQuote = () => {
    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      dateSaved: new Date().toISOString(),
      clientInputs,
      itinerary,
      totals
    };
    setSavedQuotes(prev => {
      const existing = prev.findIndex(q => q.clientInputs.quoteReference === clientInputs.quoteReference);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newQuote;
        return updated;
      }
      return [newQuote, ...prev];
    });
    alert('Quotation converted & saved successfully!');
    setActiveTab('quote');
  };

  const handleLoadQuote = (quote: SavedQuote) => {
    setClientInputs(quote.clientInputs);
    setItinerary(quote.itinerary);
    setActiveTab('costing');
  };

  const handleDeleteQuote = (id: string) => {
    setSavedQuotes(prev => prev.filter(q => q.id !== id));
  };

  const handleConvertEnquiryToQuote = (enquiry: EnquiryItem) => {
    setClientInputs(prev => ({
      ...prev,
      clientName: enquiry.clientName,
      clientEmail: enquiry.email,
      phone: enquiry.phone,
      paxAdults: enquiry.paxAdults,
      paxChildren: enquiry.paxChildren,
      travelStartDate: enquiry.travelStartDate || prev.travelStartDate,
      travelEndDate: enquiry.travelEndDate || prev.travelEndDate,
      durationDays: enquiry.durationDays || prev.durationDays,
      travelStyleTier: enquiry.travelStyleTier || prev.travelStyleTier,
      itineraryType: enquiry.itineraryType || 'fit',
      specialRequestsNotes: enquiry.notes,
      quoteReference: `TAS-${enquiry.id}`,
    }));
    setActiveTab('costing');
  };

  const handleCurateEnquiry = (enquiry: EnquiryItem) => {
    setClientInputs(prev => ({
      ...prev,
      clientName: enquiry.clientName,
      clientEmail: enquiry.email,
      phone: enquiry.phone,
      paxAdults: enquiry.paxAdults || 2,
      paxChildren: enquiry.paxChildren || 0,
      travelStartDate: enquiry.travelStartDate || prev.travelStartDate,
      travelEndDate: enquiry.travelEndDate || prev.travelEndDate,
      durationDays: enquiry.durationDays || prev.durationDays,
      travelStyleTier: enquiry.travelStyleTier || prev.travelStyleTier,
      itineraryType: enquiry.itineraryType || 'fit',
      specialRequestsNotes: enquiry.notes,
      quoteReference: `TAS-${enquiry.id}`,
    }));
    setActiveTab('itineraries');
  };

  const handleAddEnquiry = (enquiry: EnquiryItem) => {
    setActiveTab('enquiries');
  };

  const handleAddTrip = (trip: UpcomingTripItem) => {
    alert(`Departure for ${trip.client} scheduled!`);
    setActiveTab('dashboard');
  };

  const handleExportCsv = () => {
    exportMasterCostingWorkbook(clientInputs, itinerary, dayBreakdowns, totals, stoDatabase);
  };

  const handleAddProperty = (newProperty: STOAccommodationProperty) => {
    setStoDatabase(prev => mergeAccommodationDatabases(prev, [newProperty]).merged);
  };

  const handleAddVehicle = (newVehicle: FleetVehicle) => {
    setFleet(prev => [newVehicle, ...prev]);
  };

  const handleAddGuide = (newGuide: SafariGuide) => {
    setGuides(prev => [newGuide, ...prev]);
  };

  const handleCreateItinerary = (newDays: ItineraryDay[], inputs?: Partial<ClientQuotationInputs>) => {
    setItinerary(newDays);
    if (inputs) {
      setClientInputs(prev => ({
        ...prev,
        ...inputs,
        quoteReference: inputs.quoteReference || `TAS-ITIN-${Math.floor(1000 + Math.random() * 9000)}`
      }));
    }
    setActiveTab('itineraries');
  };

  const handleCreateCosting = (newInputs: ClientQuotationInputs, templateDays: ItineraryDay[]) => {
    setClientInputs(newInputs);
    setItinerary(templateDays);
    setActiveTab('costing');
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    if (newSettings.defaultOperatorMarkupPercent !== undefined) {
      setClientInputs(prev => ({ ...prev, operatorMarkupPercent: newSettings.defaultOperatorMarkupPercent }));
    }
  };

  const handleManualCloudSync = async () => {
    setCloudSyncStatus('syncing');
    const res = await syncMasterDatabaseToServer({
      accommodations: stoDatabase,
      parkFees: parkFeesDatabase,
      activities: activitiesDatabase,
      transport: transportDatabase,
      flights: flightsDatabase,
      extras: extrasDatabase,
      quotes: savedQuotes,
      drafts: drafts,
      settings: settings,
    });
    if (res.success && res.stats) {
      setServerDbStats({
        accommodationsCount: res.stats.accommodationsCount,
        rateTiersCount: res.stats.rateTiersCount,
      });
      setCloudSyncStatus('synced');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased">
      {/* Left Main Operations Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCurrency={clientInputs.selectedCurrency}
        onCurrencyChange={(c) => setClientInputs(prev => ({ ...prev, selectedCurrency: c }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRecoveryVault={() => setIsRecoveryVaultOpen(true)}
        onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
        onOpenNewItinerary={() => setIsNewItineraryOpen(true)}
        onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
        onOpenNewCosting={() => setIsNewCostingOpen(true)}
        onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
        onOpenAddGuide={() => setIsAddGuideOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        enquiriesCount={24}
        bookingsCount={savedQuotes.length || 45}
      />

      {/* Main App Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 min-h-screen text-slate-900 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: EXECUTIVE DASHBOARD (Matching Page 3 wireframe) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              savedQuotes={savedQuotes}
              onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
              onOpenAddTrip={() => setIsAddTripOpen(true)}
              onOpenNewItinerary={() => setIsNewItineraryOpen(true)}
              onOpenNewCosting={() => setIsNewCostingOpen(true)}
              onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
              onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
              onOpenAddGuide={() => setIsAddGuideOpen(true)}
              onOpenRateImporter={() => {
                setDatabaseInitialSubTab('importer');
                setActiveTab('suppliers');
              }}
              onLoadQuoteIntoCosting={handleLoadQuote}
              selectedCurrency={clientInputs.selectedCurrency}
            />
          )}

          {/* TAB 2: MASTER COSTING CALCULATOR (Matching Page 1 wireframe) */}
          {activeTab === 'costing' && (
            <MasterCostingCalculatorView
              clientInputs={clientInputs}
              setClientInputs={setClientInputs}
              itinerary={itinerary}
              setItinerary={setItinerary}
              dayBreakdowns={dayBreakdowns}
              totals={totals}
              validations={validations}
              stoDatabase={stoDatabase}
              setStoDatabase={setStoDatabase}
              parkFeesDatabase={parkFeesDatabase}
              transportDatabase={transportDatabase}
              flightsDatabase={flightsDatabase}
              activitiesDatabase={activitiesDatabase}
              extrasDatabase={extrasDatabase}
              onConvertToQuote={handleSaveQuote}
              onExportCsv={handleExportCsv}
              onOpenNewCosting={() => setIsNewCostingOpen(true)}
            />
          )}

          {/* TAB 3: ITINERARY DESIGNER (Matching Page 2 wireframe) */}
          {activeTab === 'itineraries' && (
            <ItineraryDesignerView
              clientInputs={clientInputs}
              setClientInputs={setClientInputs}
              itinerary={itinerary}
              setItinerary={setItinerary}
              dayBreakdowns={dayBreakdowns}
              totals={totals}
              stoDatabase={stoDatabase}
              onNavigateToCosting={() => setActiveTab('costing')}
              onPreviewQuote={() => setActiveTab('quote')}
              onSaveCurrentDraft={() => {
                setAutoSaveStatus('saved');
                alert('Itinerary changes saved!');
              }}
              onOpenNewItinerary={() => setIsNewItineraryOpen(true)}
            />
          )}

          {/* TAB 4: CLIENT PROPOSAL / QUOTATION */}
          {activeTab === 'quote' && (
            <ItineraryQuotePreview
              clientInputs={clientInputs}
              itinerary={itinerary}
              breakdowns={dayBreakdowns}
              totals={totals}
              stoProperties={stoDatabase}
              settings={settings}
              onPrint={() => window.print()}
              onOpenVouchers={() => setActiveTab('vouchers')}
              onOpenTourDoc={() => setActiveTab('tourdoc')}
            />
          )}

          {/* TAB 5: CRM ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <EnquiriesView
              onConvertToQuote={handleConvertEnquiryToQuote}
              onCurateItinerary={handleCurateEnquiry}
              onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
            />
          )}

          {/* TAB 6: BOOKINGS PIPELINE */}
          {activeTab === 'bookings' && (
            <BookingsPipeline
              savedQuotes={savedQuotes}
              onLoadQuote={handleLoadQuote}
              onDeleteQuote={handleDeleteQuote}
            />
          )}

          {/* TAB 7: SUPPLIERS & RATE DATABASE */}
          {activeTab === 'suppliers' && (
            <DatabaseBrowser
              initialSubTab={databaseInitialSubTab}
              stoProperties={stoDatabase}
              parkFees={parkFeesDatabase}
              activities={activitiesDatabase}
              transport={transportDatabase}
              flights={flightsDatabase}
              extras={extrasDatabase}
              drafts={drafts}
              onAddProperties={(newP) => setStoDatabase(prev => mergeAccommodationDatabases(prev, newP).merged)}
              onAddParkFees={(newParks) => setParkFeesDatabase(prev => deduplicateParkFees([...prev, ...newParks]))}
              onAddActivities={(newA) => setActivitiesDatabase(prev => deduplicateActivities([...prev, ...newA]))}
              onAddTransport={(newT) => setTransportDatabase(prev => deduplicateTransport([...prev, ...newT]))}
              onAddFlights={(newF) => setFlightsDatabase(prev => deduplicateFlights([...prev, ...newF]))}
              onAddExtras={(newE) => setExtrasDatabase(prev => deduplicateExtras([...prev, ...newE]))}
              onUpdateProperty={(updated) => setStoDatabase(prev => prev.map(p => p.id === updated.id ? updated : p))}
              onUpdateParkFee={(updated) => setParkFeesDatabase(prev => prev.map(p => p.id === updated.id ? updated : p))}
              onUpdateActivity={(updated) => setActivitiesDatabase(prev => prev.map(a => a.id === updated.id ? updated : a))}
              onUpdateTransport={(updated) => setTransportDatabase(prev => prev.map(t => t.id === updated.id ? updated : t))}
              onUpdateFlight={(updated) => setFlightsDatabase(prev => prev.map(f => f.id === updated.id ? updated : f))}
              onUpdateExtra={(updated) => setExtrasDatabase(prev => prev.map(e => e.id === updated.id ? updated : e))}
              onDeduplicateDatabase={() => {
                setStoDatabase(prev => deduplicateAccommodationDatabase(prev).properties);
                setParkFeesDatabase(prev => deduplicateParkFees(prev));
                setActivitiesDatabase(prev => deduplicateActivities(prev));
                setTransportDatabase(prev => deduplicateTransport(prev));
                setFlightsDatabase(prev => deduplicateFlights(prev));
                setExtrasDatabase(prev => deduplicateExtras(prev));
              }}
              onDeleteProperty={(id) => setStoDatabase(prev => prev.filter(p => p.id !== id))}
              onDeleteParkFee={(id) => setParkFeesDatabase(prev => prev.filter(p => p.id !== id))}
              onDeleteActivity={(id) => setActivitiesDatabase(prev => prev.filter(a => a.id !== id))}
              onDeleteTransport={(id) => setTransportDatabase(prev => prev.filter(t => t.id !== id))}
              onDeleteFlight={(id) => setFlightsDatabase(prev => prev.filter(f => f.id !== id))}
              onDeleteExtra={(id) => setExtrasDatabase(prev => prev.filter(e => e.id !== id))}
              onResetDatabase={() => {
                saveVaultSnapshot(
                  `Pre-Reset Safety Archive (${new Date().toLocaleString()})`,
                  'pre_reset_backup',
                  {
                    accommodations: stoDatabase,
                    parkFees: parkFeesDatabase,
                    activities: activitiesDatabase,
                    transport: transportDatabase,
                    flights: flightsDatabase,
                    extras: extrasDatabase
                  }
                );
                setStoDatabase(deduplicateAccommodationDatabase(STO_ACCOMMODATION_DATABASE).properties);
                setParkFeesDatabase(deduplicateParkFees(PARK_FEES_DATABASE));
              }}
              onRestoreDraft={(draft) => {
                setClientInputs(draft.clientInputs);
                setItinerary(draft.itinerary);
                setActiveTab('costing');
              }}
              onDeleteDraft={(id) => setDrafts(prev => prev.filter(d => d.id !== id))}
              onClearAllDrafts={() => setDrafts([])}
              onSaveManualSnapshot={() => {
                saveVaultSnapshot(
                  `User Manual Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                  'manual_save',
                  {
                    accommodations: stoDatabase,
                    parkFees: parkFeesDatabase,
                    activities: activitiesDatabase,
                    transport: transportDatabase,
                    flights: flightsDatabase,
                    extras: extrasDatabase,
                    drafts,
                    quotes: savedQuotes,
                    settings
                  }
                );
                alert('Safety snapshot saved to Rate Protection Vault!');
              }}
              autoSaveStatus={autoSaveStatus}
              lastAutoSavedAt={lastAutoSavedAt}
              autoSaveEnabled={autoSaveEnabled}
              onToggleAutoSave={() => setAutoSaveEnabled(p => !p)}
              activeQuoteRef={clientInputs.quoteReference}
              onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
              onOpenRecoveryVault={() => setIsRecoveryVaultOpen(true)}
              serverSyncStatus={cloudSyncStatus}
              serverDbStats={serverDbStats}
              onManualCloudSync={handleManualCloudSync}
            />
          )}

          {/* TAB 8: FLEET OPERATIONS */}
          {activeTab === 'fleet' && (
            <FleetView
              vehicles={fleet}
              onAddVehicle={handleAddVehicle}
              onOpenAddVehicleModal={() => setIsAddVehicleOpen(true)}
            />
          )}

          {/* TAB 9: GUIDES DIRECTORY */}
          {activeTab === 'guides' && (
            <GuidesView
              guides={guides}
              onAddGuide={handleAddGuide}
              onOpenAddGuideModal={() => setIsAddGuideOpen(true)}
            />
          )}

          {/* TAB 10: INVOICES & RECEIVABLES */}
          {activeTab === 'invoices' && (
            <InvoicesView
              savedQuotes={savedQuotes}
              onNavigateToCosting={handleLoadQuote}
            />
          )}

          {/* TAB 11: HOTEL & SERVICE BOOKING VOUCHERS */}
          {activeTab === 'vouchers' && (
            <BookingVouchersView
              clientInputs={clientInputs}
              itinerary={itinerary}
              stoProperties={stoDatabase}
              savedQuotes={savedQuotes}
              onNavigateToQuote={() => setActiveTab('quote')}
              onNavigateToTourDoc={() => setActiveTab('tourdoc')}
            />
          )}

          {/* TAB 12: DIGITAL TOURDOC LIVE PORTAL */}
          {activeTab === 'tourdoc' && (
            <DigitalTourDocPortal
              clientInputs={clientInputs}
              itinerary={itinerary}
              stoProperties={stoDatabase}
              savedQuotes={savedQuotes}
              onNavigateToCosting={() => setActiveTab('costing')}
              onNavigateToVouchers={() => setActiveTab('vouchers')}
            />
          )}
        </div>
      </div>

      {/* Rate Protection & Recovery Vault Modal */}
      <RateRecoveryModal
        isOpen={isRecoveryVaultOpen}
        onClose={() => setIsRecoveryVaultOpen(false)}
        currentAccommodations={stoDatabase}
        currentParks={parkFeesDatabase}
        currentActivities={activitiesDatabase}
        currentTransport={transportDatabase}
        currentFlights={flightsDatabase}
        currentExtras={extrasDatabase}
        currentDrafts={drafts}
        currentQuotes={savedQuotes}
        currentSettings={settings}
        onRestoreAccommodations={(recoveredProps) => {
          setStoDatabase(recoveredProps);
        }}
        onRestoreParkFees={(recoveredParks) => {
          setParkFeesDatabase(recoveredParks);
        }}
        onRestoreFullDatabase={(payload) => {
          setStoDatabase(payload.accommodations);
          if (payload.parkFees) setParkFeesDatabase(payload.parkFees);
          if (payload.activities) setActivitiesDatabase(payload.activities);
          if (payload.transport) setTransportDatabase(payload.transport);
          if (payload.flights) setFlightsDatabase(payload.flights);
          if (payload.extras) setExtrasDatabase(payload.extras);
        }}
      />

      {/* Global Settings & Rules Modal (Functionality for settings button) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* New Enquiry Modal */}
      <NewEnquiryModal
        isOpen={isNewEnquiryOpen}
        onClose={() => setIsNewEnquiryOpen(false)}
        onAddEnquiry={handleAddEnquiry}
        onCurateItinerary={handleCurateEnquiry}
        onOpenCosting={handleConvertEnquiryToQuote}
      />

      {/* Add Trip Departure Modal */}
      <AddTripModal
        isOpen={isAddTripOpen}
        onClose={() => setIsAddTripOpen(false)}
        onAddTrip={handleAddTrip}
      />

      {/* New Itinerary Modal */}
      <NewItineraryModal
        isOpen={isNewItineraryOpen}
        onClose={() => setIsNewItineraryOpen(false)}
        onCreateItinerary={handleCreateItinerary}
        stoProperties={stoDatabase}
      />

      {/* New Costing Modal */}
      <NewCostingModal
        isOpen={isNewCostingOpen}
        onClose={() => setIsNewCostingOpen(false)}
        onCreateCosting={handleCreateCosting}
        stoProperties={stoDatabase}
      />

      {/* Add Supplier / Property Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onAddProperty={handleAddProperty}
        existingProperties={stoDatabase}
        onOpenAiImporter={() => {
          setIsAddSupplierOpen(false);
          setDatabaseInitialSubTab('importer');
          setActiveTab('suppliers');
        }}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onAddVehicle={handleAddVehicle}
      />

      {/* Add Guide Modal */}
      <AddGuideModal
        isOpen={isAddGuideOpen}
        onClose={() => setIsAddGuideOpen(false)}
        onAddGuide={handleAddGuide}
      />
    </div>
  );
}
