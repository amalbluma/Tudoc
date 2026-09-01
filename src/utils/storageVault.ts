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
import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import {
  ACTIVITY_OPTIONS,
  TRANSPORT_OPTIONS,
  FLIGHT_OPTIONS,
  OPERATIONAL_EXTRAS
} from '../data/transportAndExtrasData';
import { mergeAccommodationDatabases } from './rateDeduplication';

export interface DatabaseSnapshot {
  id: string;
  timestamp: string;
  label: string;
  source: 'auto_sync' | 'contract_import' | 'manual_save' | 'pre_reset_backup' | 'user_export';
  propertyCount: number;
  rateTiersCount: number;
  parksCount: number;
  activitiesCount: number;
  transportCount: number;
  flightsCount: number;
  extrasCount: number;
  data: {
    accommodations: STOAccommodationProperty[];
    parkFees?: ParkFeeRecord[];
    activities?: ActivityOption[];
    transport?: TransportOption[];
    flights?: FlightOption[];
    extras?: ExtraOperationalCost[];
    drafts?: CostingDraft[];
    quotes?: SavedQuote[];
    settings?: CompanySettings;
  };
}

export interface RecoveredItemCandidate {
  key: string;
  type: string;
  itemCount: number;
  rateTiersCount: number;
  dateFound: string;
  properties: STOAccommodationProperty[];
  sampleNames: string[];
}

const VAULT_SNAPSHOTS_KEY = 'tusafiri_vault_snapshots_v1';
const ANCHOR_ACCOMMODATIONS_KEY = 'tusafiri_sto_database_anchor';
const LEGACY_STORAGE_KEYS = [
  'tusafiri_sto_database_v2',
  'tusafiri_sto_database_v1',
  'tusafiri_sto_database',
  'tusafiri_sto_rates',
  'tusafiri_accommodations',
  'tusafiri_custom_rates',
  'tusafiri_rates_backup',
  'tusafiri_contract_extracted',
  'safari_sto_database',
  'safari_costing_sto_data',
  'tusafiri_parks_database_v2',
  'tusafiri_parks_database_v1',
  'tusafiri_parks_database',
  'tusafiri_activities_database_v2',
  'tusafiri_activities_database_v1',
  'tusafiri_activities_database',
  'tusafiri_transport_database_v2',
  'tusafiri_transport_database_v1',
  'tusafiri_flights_database_v2',
  'tusafiri_flights_database_v1',
  'tusafiri_extras_database_v2',
  'tusafiri_extras_database_v1',
  'tusafiri_costing_drafts_v2',
  'tusafiri_costing_drafts_v1',
  'tusafiri_saved_quotes_v1'
];

/**
 * Counts total rate tiers across an accommodations array
 */
export function countTotalRateTiers(properties: STOAccommodationProperty[]): number {
  if (!Array.isArray(properties)) return 0;
  return properties.reduce((sum, p) => sum + (Array.isArray(p.seasons) ? p.seasons.length : 0), 0);
}

/**
 * Retrieves all stored vault snapshots (max 50)
 */
export function getVaultSnapshots(): DatabaseSnapshot[] {
  try {
    const raw = localStorage.getItem(VAULT_SNAPSHOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading vault snapshots:', e);
  }
  return [];
}

/**
 * Saves a new timestamped snapshot to the local vault
 */
export function saveVaultSnapshot(
  label: string,
  source: DatabaseSnapshot['source'],
  data: DatabaseSnapshot['data']
): DatabaseSnapshot {
  const currentSnapshots = getVaultSnapshots();

  const totalRateTiers = countTotalRateTiers(data.accommodations || []);
  const newSnapshot: DatabaseSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    label,
    source,
    propertyCount: (data.accommodations || []).length,
    rateTiersCount: totalRateTiers,
    parksCount: (data.parkFees || []).length,
    activitiesCount: (data.activities || []).length,
    transportCount: (data.transport || []).length,
    flightsCount: (data.flights || []).length,
    extrasCount: (data.extras || []).length,
    data
  };

  // Prepend new snapshot and limit to 50
  const updatedSnapshots = [newSnapshot, ...currentSnapshots].slice(0, 50);

  try {
    localStorage.setItem(VAULT_SNAPSHOTS_KEY, JSON.stringify(updatedSnapshots));
    // Also save to immutable anchor key
    if (data.accommodations && data.accommodations.length > 0) {
      localStorage.setItem(ANCHOR_ACCOMMODATIONS_KEY, JSON.stringify(data.accommodations));
    }
  } catch (e) {
    console.warn('Vault storage size limit reached, trimming older snapshots', e);
    // If full, trim to top 15
    try {
      const trimmed = [newSnapshot, ...currentSnapshots.slice(0, 15)];
      localStorage.setItem(VAULT_SNAPSHOTS_KEY, JSON.stringify(trimmed));
    } catch (innerError) {}
  }

  return newSnapshot;
}

/**
 * Performs a Deep Scan across all localStorage keys to locate any historical or orphaned STO rates
 */
export function deepScanBrowserStorage(): RecoveredItemCandidate[] {
  const candidates: RecoveredItemCandidate[] = [];
  const scannedKeys = new Set<string>();

  // 1. Scan known keys
  for (const key of LEGACY_STORAGE_KEYS) {
    scannedKeys.add(key);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      checkAndAddCandidate(key, parsed, candidates);
    } catch (e) {}
  }

  // 2. Scan every key currently in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || scannedKeys.has(key)) continue;
      scannedKeys.add(key);
      try {
        const raw = localStorage.getItem(key);
        if (!raw || raw.length < 20) continue;
        const parsed = JSON.parse(raw);
        checkAndAddCandidate(key, parsed, candidates);
      } catch (e) {}
    }
  } catch (e) {}

  // 3. Scan Vault Snapshots
  const snapshots = getVaultSnapshots();
  for (const snap of snapshots) {
    if (snap.data.accommodations && snap.data.accommodations.length > 0) {
      candidates.push({
        key: `Snapshot: ${snap.label} (${new Date(snap.timestamp).toLocaleString()})`,
        type: 'Vault Snapshot',
        itemCount: snap.data.accommodations.length,
        rateTiersCount: snap.rateTiersCount,
        dateFound: snap.timestamp,
        properties: snap.data.accommodations,
        sampleNames: snap.data.accommodations.slice(0, 4).map(p => p.name)
      });
    }
  }

  return candidates;
}

function checkAndAddCandidate(
  key: string,
  parsed: any,
  candidates: RecoveredItemCandidate[]
) {
  if (!parsed) return;

  // Check if it's an array of accommodations
  if (Array.isArray(parsed) && parsed.length > 0) {
    const isAccommodationArray = parsed.some(
      item => item && (item.name || item.roomCategory || item.seasons || item.boardBasis)
    );

    if (isAccommodationArray) {
      const validProps: STOAccommodationProperty[] = parsed.filter(
        item => item && typeof item === 'object' && item.name
      );

      if (validProps.length > 0) {
        candidates.push({
          key,
          type: 'Accommodation Database',
          itemCount: validProps.length,
          rateTiersCount: countTotalRateTiers(validProps),
          dateFound: new Date().toISOString(),
          properties: validProps,
          sampleNames: validProps.slice(0, 4).map(p => p.name)
        });
      }
    }
  } else if (typeof parsed === 'object') {
    // Check if it's an object containing accommodations or extractedProperties
    const possibleProps = parsed.accommodations || parsed.extractedProperties || parsed.stoProperties;
    if (Array.isArray(possibleProps) && possibleProps.length > 0) {
      const validProps = possibleProps.filter(
        (item: any) => item && typeof item === 'object' && item.name
      );
      if (validProps.length > 0) {
        candidates.push({
          key,
          type: 'Structured Container',
          itemCount: validProps.length,
          rateTiersCount: countTotalRateTiers(validProps),
          dateFound: new Date().toISOString(),
          properties: validProps,
          sampleNames: validProps.slice(0, 4).map(p => p.name)
        });
      }
    }
  }
}

/**
 * Smart Auto-Restorer: Automatically finds the highest-fidelity rate database
 * across all storage versions, anchor keys, and baseline defaults.
 */
export function getInitialProtectedAccommodations(): STOAccommodationProperty[] {
  try {
    // 1. Try primary v2 key
    const rawV2 = localStorage.getItem('tusafiri_sto_database_v2');
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. Try anchor key
    const rawAnchor = localStorage.getItem(ANCHOR_ACCOMMODATIONS_KEY);
    if (rawAnchor) {
      const parsed = JSON.parse(rawAnchor);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 3. Try legacy v1 key
    const rawV1 = localStorage.getItem('tusafiri_sto_database_v1');
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 4. Try unversioned key
    const rawLegacy = localStorage.getItem('tusafiri_sto_database');
    if (rawLegacy) {
      const parsed = JSON.parse(rawLegacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 5. Try newest vault snapshot
    const snapshots = getVaultSnapshots();
    for (const snap of snapshots) {
      if (snap.data.accommodations && snap.data.accommodations.length > 0) {
        return snap.data.accommodations;
      }
    }
  } catch (e) {
    console.error('Error recovering protected accommodations:', e);
  }

  // 6. Default baseline
  return STO_ACCOMMODATION_DATABASE;
}

/**
 * Exports full master database to a clean JSON file
 */
export function exportMasterDatabaseBackup(payload: {
  accommodations: STOAccommodationProperty[];
  parkFees: ParkFeeRecord[];
  activities: ActivityOption[];
  transport: TransportOption[];
  flights: FlightOption[];
  extras: ExtraOperationalCost[];
  drafts?: CostingDraft[];
  quotes?: SavedQuote[];
  settings?: CompanySettings;
}) {
  const exportData = {
    app: 'Tusafiri Master Safari Operating Database',
    version: '2026.2',
    exportDate: new Date().toISOString(),
    stats: {
      accommodationsCount: payload.accommodations.length,
      rateTiersCount: countTotalRateTiers(payload.accommodations),
      parksCount: payload.parkFees.length,
      activitiesCount: payload.activities.length,
      transportCount: payload.transport.length,
      flightsCount: payload.flights.length,
      extrasCount: payload.extras.length,
    },
    ...payload
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `tusafiri-safari-master-rates-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
