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

export interface MasterDatabaseResponse {
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

export interface SyncStats {
  accommodationsCount: number;
  rateTiersCount: number;
  parksCount: number;
  activitiesCount: number;
  transportCount: number;
  flightsCount: number;
  extrasCount: number;
}

/**
 * Fetches the master persistent database from the server backend
 */
export async function fetchMasterDatabaseFromServer(): Promise<{
  success: boolean;
  data?: MasterDatabaseResponse;
  stats?: SyncStats;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/database/master', {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      data: json.data,
      stats: json.stats,
    };
  } catch (err: any) {
    console.warn('Could not fetch server master database (using local cache):', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error fetching server database',
    };
  }
}

/**
 * Synchronizes newly added, ingested, or updated rates directly to the persistent server database
 */
export async function syncMasterDatabaseToServer(payload: {
  accommodations?: STOAccommodationProperty[];
  parkFees?: ParkFeeRecord[];
  activities?: ActivityOption[];
  transport?: TransportOption[];
  flights?: FlightOption[];
  extras?: ExtraOperationalCost[];
  drafts?: CostingDraft[];
  quotes?: SavedQuote[];
  settings?: CompanySettings;
}): Promise<{
  success: boolean;
  stats?: SyncStats;
  message?: string;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/database/sync', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Sync failed with status ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      stats: json.stats,
      message: json.message,
    };
  } catch (err: any) {
    console.warn('Background server database sync error:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to sync with server database',
    };
  }
}

/**
 * Checks server database connection and health
 */
export async function checkServerDatabaseStatus(): Promise<{
  healthy: boolean;
  stats?: SyncStats;
  lastUpdated?: string;
}> {
  try {
    const res = await fetch('/api/database/status');
    if (!res.ok) return { healthy: false };
    const json = await res.json();
    return {
      healthy: json.status === 'healthy',
      stats: json.stats,
      lastUpdated: json.lastUpdated,
    };
  } catch (_) {
    return { healthy: false };
  }
}
