import fs from 'fs';
import path from 'path';
import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import {
  TRANSPORT_OPTIONS,
  FLIGHT_OPTIONS,
  ACTIVITY_OPTIONS,
  OPERATIONAL_EXTRAS
} from '../data/transportAndExtrasData';
import {
  STOAccommodationProperty,
  ParkFeeRecord,
  ActivityOption,
  TransportOption,
  FlightOption,
  ExtraOperationalCost,
  CostingDraft,
  SavedQuote,
  CompanySettings
} from '../types/costing';

export interface MasterDatabasePayload {
  accommodations: STOAccommodationProperty[];
  parkFees: ParkFeeRecord[];
  activities: ActivityOption[];
  transport: TransportOption[];
  flights: FlightOption[];
  extras: ExtraOperationalCost[];
  drafts?: CostingDraft[];
  quotes?: SavedQuote[];
  settings?: CompanySettings;
  lastUpdated?: string;
  version?: string;
}

export interface ServerVaultSnapshot {
  id: string;
  timestamp: string;
  label: string;
  reason: 'contract_import' | 'manual_backup' | 'auto_protection' | 'pre_reset';
  rateTiersCount: number;
  data: MasterDatabasePayload;
}

const DATA_DIR = path.join(process.cwd(), 'server_data');
const MASTER_DB_PATH = path.join(DATA_DIR, 'master_database.json');
const SNAPSHOTS_PATH = path.join(DATA_DIR, 'snapshots.json');

// Ensure server_data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Atomic file writer
function writeJsonAtomic(filePath: string, data: any) {
  ensureDataDir();
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    throw err;
  }
}

// Calculate rate tiers helper
export function countTotalRateTiers(props: STOAccommodationProperty[] = []): number {
  return props.reduce((acc, p) => acc + (p.seasons ? p.seasons.length : 0), 0);
}

// Initial baseline seed generator
export function getBaselineSeedData(): MasterDatabasePayload {
  return {
    accommodations: STO_ACCOMMODATION_DATABASE,
    parkFees: PARK_FEES_DATABASE,
    activities: ACTIVITY_OPTIONS,
    transport: TRANSPORT_OPTIONS,
    flights: FLIGHT_OPTIONS,
    extras: OPERATIONAL_EXTRAS,
    drafts: [],
    quotes: [],
    settings: {
      companyName: 'Tusafiri Africa Safaris',
      companyEmail: 'tusafiriafrica@gmail.com',
      companyPhone: '+254 700 000 000',
      companyAddress: 'Nairobi & Arusha, East Africa',
      defaultMarkupPercent: 20,
      defaultOperatorMarkupPercent: 20,
      defaultCurrency: 'USD',
      baseCurrency: 'USD',
      vatPercentage: 16,
      showPhotosInItinerary: true,
    },
    lastUpdated: new Date().toISOString(),
    version: '2026.2',
  };
}

function sanitizeCollectionUniqueIds<T extends { id?: string; name?: string }>(items: T[] = [], prefix: string): T[] {
  const seenIds = new Set<string>();
  return items.map((item, idx) => {
    let baseId = item.id || `${prefix}-${idx + 1}`;
    let uniqueId = baseId;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);
    return {
      ...item,
      id: uniqueId
    };
  });
}

function sanitizeDatabasePayload(payload: MasterDatabasePayload): MasterDatabasePayload {
  if (payload.accommodations && Array.isArray(payload.accommodations)) {
    payload.accommodations = sanitizeCollectionUniqueIds(payload.accommodations, 'prop');
  }
  if (payload.parkFees && Array.isArray(payload.parkFees)) {
    payload.parkFees = sanitizeCollectionUniqueIds(payload.parkFees, 'park');
  }
  if (payload.activities && Array.isArray(payload.activities)) {
    payload.activities = sanitizeCollectionUniqueIds(payload.activities, 'act');
  }
  if (payload.transport && Array.isArray(payload.transport)) {
    payload.transport = sanitizeCollectionUniqueIds(payload.transport, 'veh');
  }
  if (payload.flights && Array.isArray(payload.flights)) {
    payload.flights = sanitizeCollectionUniqueIds(payload.flights, 'flight');
  }
  if (payload.extras && Array.isArray(payload.extras)) {
    payload.extras = sanitizeCollectionUniqueIds(payload.extras, 'extra');
  }
  return payload;
}

// Load or initialize Master Database
export function getMasterDatabase(): MasterDatabasePayload {
  ensureDataDir();
  if (!fs.existsSync(MASTER_DB_PATH)) {
    const seed = sanitizeDatabasePayload(getBaselineSeedData());
    writeJsonAtomic(MASTER_DB_PATH, seed);
    return seed;
  }

  try {
    const raw = fs.readFileSync(MASTER_DB_PATH, 'utf-8');
    const parsed: MasterDatabasePayload = JSON.parse(raw);

    // Merge baseline accommodations if server file is missing core defaults
    let needResave = false;
    if (!parsed.accommodations || parsed.accommodations.length === 0) {
      parsed.accommodations = STO_ACCOMMODATION_DATABASE;
      needResave = true;
    } else {
      // Ensure any newly added seed accommodations (like Sarova/Elewana) are present
      const existingNames = new Set(
        parsed.accommodations.map(p => `${p.name.toLowerCase().trim()}|${(p.roomCategory || '').toLowerCase().trim()}`)
      );
      for (const baselineProp of STO_ACCOMMODATION_DATABASE) {
        const key = `${baselineProp.name.toLowerCase().trim()}|${(baselineProp.roomCategory || '').toLowerCase().trim()}`;
        if (!existingNames.has(key)) {
          parsed.accommodations.push(baselineProp);
          existingNames.add(key);
          needResave = true;
        }
      }
    }

    if (!parsed.parkFees || parsed.parkFees.length === 0) {
      parsed.parkFees = PARK_FEES_DATABASE;
      needResave = true;
    }
    if (!parsed.activities || parsed.activities.length === 0) {
      parsed.activities = ACTIVITY_OPTIONS;
      needResave = true;
    }
    if (!parsed.transport || parsed.transport.length === 0) {
      parsed.transport = TRANSPORT_OPTIONS;
      needResave = true;
    }
    if (!parsed.flights || parsed.flights.length === 0) {
      parsed.flights = FLIGHT_OPTIONS;
      needResave = true;
    }
    if (!parsed.extras || parsed.extras.length === 0) {
      parsed.extras = OPERATIONAL_EXTRAS;
      needResave = true;
    }

    const sanitized = sanitizeDatabasePayload(parsed);
    if (needResave) {
      sanitized.lastUpdated = new Date().toISOString();
      writeJsonAtomic(MASTER_DB_PATH, sanitized);
    }

    return sanitized;
  } catch (err) {
    console.error('Failed to read master database, falling back to seed:', err);
    const fallback = sanitizeDatabasePayload(getBaselineSeedData());
    try {
      writeJsonAtomic(MASTER_DB_PATH, fallback);
    } catch (_) {}
    return fallback;
  }
}

// Save complete master database
export function saveMasterDatabase(payload: MasterDatabasePayload): MasterDatabasePayload {
  ensureDataDir();
  payload.lastUpdated = new Date().toISOString();
  payload.version = '2026.2';
  const sanitized = sanitizeDatabasePayload(payload);
  writeJsonAtomic(MASTER_DB_PATH, sanitized);
  return sanitized;
}

// Smart Deduplication & Upsert Merge helper
function mergeEntities<T extends { id?: string; name?: string }>(
  existingList: T[] = [],
  incomingList: T[] = [],
  keyGen?: (item: T) => string
): T[] {
  const mergedMap = new Map<string, T>();

  // Helper key
  const getKey = (item: T): string => {
    if (keyGen) return keyGen(item);
    if (item.id) return item.id;
    if (item.name) return item.name.toLowerCase().trim();
    return JSON.stringify(item);
  };

  // Populate existing
  for (const item of existingList) {
    mergedMap.set(getKey(item), item);
  }

  // Upsert incoming
  for (const item of incomingList) {
    const key = getKey(item);
    if (mergedMap.has(key)) {
      // Merge properties
      const prev = mergedMap.get(key)!;
      mergedMap.set(key, { ...prev, ...item });
    } else {
      mergedMap.set(key, item);
    }
  }

  return Array.from(mergedMap.values());
}

// Merge Accommodations with deep season preservation
function mergeAccommodations(
  existing: STOAccommodationProperty[] = [],
  incoming: STOAccommodationProperty[] = []
): STOAccommodationProperty[] {
  const map = new Map<string, STOAccommodationProperty>();

  const getPropKey = (p: STOAccommodationProperty) => {
    return `${p.name.toLowerCase().trim()}|${(p.roomCategory || '').toLowerCase().trim()}`;
  };

  for (const prop of existing) {
    map.set(getPropKey(prop), { ...prop });
  }

  for (const prop of incoming) {
    const key = getPropKey(prop);
    if (map.has(key)) {
      const prev = map.get(key)!;
      // Merge seasons if incoming has newer or distinct seasons
      const existingSeasonsMap = new Map((prev.seasons || []).map(s => [s.seasonName.toLowerCase().trim(), s]));
      for (const s of (prop.seasons || [])) {
        existingSeasonsMap.set(s.seasonName.toLowerCase().trim(), s);
      }
      map.set(key, {
        ...prev,
        ...prop,
        seasons: Array.from(existingSeasonsMap.values())
      });
    } else {
      map.set(key, { ...prop });
    }
  }

  return Array.from(map.values());
}

// Sync entities directly from client ingestion/edit operations
export function syncIncomingEntities(payload: Partial<MasterDatabasePayload>): {
  masterDatabase: MasterDatabasePayload;
  stats: {
    accommodationsCount: number;
    rateTiersCount: number;
    parkFeesCount: number;
    activitiesCount: number;
    transportCount: number;
    flightsCount: number;
    extrasCount: number;
  };
} {
  const currentDb = getMasterDatabase();

  if (payload.accommodations && payload.accommodations.length > 0) {
    currentDb.accommodations = mergeAccommodations(currentDb.accommodations, payload.accommodations);
  }

  if (payload.parkFees && payload.parkFees.length > 0) {
    currentDb.parkFees = mergeEntities(
      currentDb.parkFees,
      payload.parkFees,
      (p) => `${(p.parkName || '').toLowerCase().trim()}|${(p.category || '').toLowerCase().trim()}`
    );
  }

  if (payload.activities && payload.activities.length > 0) {
    currentDb.activities = mergeEntities(
      currentDb.activities,
      payload.activities,
      (a) => `${(a.name || '').toLowerCase().trim()}|${(a.location || '').toLowerCase().trim()}`
    );
  }

  if (payload.transport && payload.transport.length > 0) {
    currentDb.transport = mergeEntities(
      currentDb.transport,
      payload.transport,
      (t) => (t.name || '').toLowerCase().trim()
    );
  }

  if (payload.flights && payload.flights.length > 0) {
    currentDb.flights = mergeEntities(
      currentDb.flights,
      payload.flights,
      (f) => `${(f.route || '').toLowerCase().trim()}|${(f.airline || '').toLowerCase().trim()}`
    );
  }

  if (payload.extras && payload.extras.length > 0) {
    currentDb.extras = mergeEntities(
      currentDb.extras,
      payload.extras,
      (e) => (e.name || '').toLowerCase().trim()
    );
  }

  if (payload.drafts) {
    currentDb.drafts = payload.drafts;
  }

  if (payload.quotes) {
    currentDb.quotes = payload.quotes;
  }

  if (payload.settings) {
    currentDb.settings = { ...currentDb.settings, ...payload.settings };
  }

  currentDb.lastUpdated = new Date().toISOString();
  saveMasterDatabase(currentDb);

  return {
    masterDatabase: currentDb,
    stats: {
      accommodationsCount: currentDb.accommodations.length,
      rateTiersCount: countTotalRateTiers(currentDb.accommodations),
      parkFeesCount: currentDb.parkFees.length,
      activitiesCount: currentDb.activities.length,
      transportCount: currentDb.transport.length,
      flightsCount: currentDb.flights.length,
      extrasCount: currentDb.extras.length,
    }
  };
}

// Server-side Snapshots
export function getServerSnapshots(): ServerVaultSnapshot[] {
  ensureDataDir();
  if (!fs.existsSync(SNAPSHOTS_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SNAPSHOTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveServerSnapshot(snapshot: {
  label: string;
  reason: 'contract_import' | 'manual_backup' | 'auto_protection' | 'pre_reset';
  data?: Partial<MasterDatabasePayload>;
}): ServerVaultSnapshot {
  const currentDb = getMasterDatabase();
  const fullData: MasterDatabasePayload = {
    ...currentDb,
    ...(snapshot.data || {})
  };

  const newSnap: ServerVaultSnapshot = {
    id: `srv-snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    label: snapshot.label,
    reason: snapshot.reason,
    rateTiersCount: countTotalRateTiers(fullData.accommodations),
    data: fullData
  };

  const existing = getServerSnapshots();
  // Keep up to 30 most recent snapshots
  const updated = [newSnap, ...existing].slice(0, 30);
  writeJsonAtomic(SNAPSHOTS_PATH, updated);
  return newSnap;
}
