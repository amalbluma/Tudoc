import {
  STOAccommodationProperty,
  STOSeasonRate,
  ParkFeeRecord,
  ActivityOption,
  TransportOption,
  FlightOption,
  ExtraOperationalCost
} from '../types/costing';

/**
 * Normalizes a text string for fuzzy / case-insensitive matching
 */
export function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Generates a consistent facility key for a property
 */
export function getFacilityKey(prop: STOAccommodationProperty): string {
  const normName = normalizeKey(prop.name);
  const normCountry = normalizeKey(prop.country);
  const normCategory = normalizeKey(prop.roomCategory || 'standard');
  const normBoard = normalizeKey(prop.boardBasis || 'fb');
  return `${normName}__${normCountry}__${normCategory}__${normBoard}`;
}

/**
 * Generates a broader facility key (just Name + Country) for matching property records
 */
export function getBroadFacilityKey(prop: STOAccommodationProperty | { name: string; country: string }): string {
  return `${normalizeKey(prop.name)}__${normalizeKey(prop.country)}`;
}

/**
 * Checks if two STO Season Rate entries from the same facility are identical duplicates
 * Conservative rule: Only considers duplicate if pricing AND season identity/dates match.
 */
export function areSeasonRatesIdentical(s1: STOSeasonRate, s2: STOSeasonRate): boolean {
  if (!s1 || !s2) return false;

  const sameDates = s1.startDate === s2.startDate && s1.endDate === s2.endDate;
  const sameRates = Math.abs((Number(s1.ppsUsd) || 0) - (Number(s2.ppsUsd) || 0)) < 0.01 &&
                    Math.abs((Number(s1.srsUsd) || 0) - (Number(s2.srsUsd) || 0)) < 0.01;
  const sameName = normalizeKey(s1.seasonName) === normalizeKey(s2.seasonName);
  const sameId = s1.id && s2.id && s1.id === s2.id;

  // Same ID
  if (sameId) return true;

  // Exact same dates AND exact same rates
  if (sameDates && sameRates) return true;

  // Same season name, exact same rates, and overlapping or matching dates
  if (sameName && sameRates && (sameDates || !s1.startDate || !s2.startDate)) return true;

  return false;
}

/**
 * Deduplicates the seasons array within a single facility so no identical rate tiers exist
 */
export function deduplicateSeasonsForFacility(
  seasons: STOSeasonRate[],
  facilityId: string
): { seasons: STOSeasonRate[]; duplicatesRemovedCount: number } {
  if (!Array.isArray(seasons) || seasons.length === 0) {
    return { seasons: [], duplicatesRemovedCount: 0 };
  }

  const uniqueSeasons: STOSeasonRate[] = [];
  let duplicatesRemovedCount = 0;

  for (const incomingSeason of seasons) {
    if (!incomingSeason) continue;

    // Check if an identical rate season already exists in this facility's list
    const existingIndex = uniqueSeasons.findIndex(s => areSeasonRatesIdentical(s, incomingSeason));

    if (existingIndex >= 0) {
      // It's a duplicate rate!
      duplicatesRemovedCount++;
      // Merge extra details if the incoming one has more information
      const existing = uniqueSeasons[existingIndex];
      uniqueSeasons[existingIndex] = {
        ...existing,
        description: existing.description || incomingSeason.description,
        notes: existing.notes || incomingSeason.notes,
        childRateFactor: existing.childRateFactor ?? incomingSeason.childRateFactor,
        minNights: existing.minNights || incomingSeason.minNights,
        tripleReductionUsd: existing.tripleReductionUsd ?? incomingSeason.tripleReductionUsd,
      };
    } else {
      // Brand new distinct rate season
      const cleanSeasonId = incomingSeason.id && !incomingSeason.id.startsWith('season-temp')
        ? (incomingSeason.id.includes(facilityId) ? incomingSeason.id : `${facilityId}-${incomingSeason.id}`)
        : `${facilityId}-sea-${uniqueSeasons.length + 1}`;

      uniqueSeasons.push({
        ...incomingSeason,
        id: cleanSeasonId,
        ppsUsd: Number(incomingSeason.ppsUsd) || 0,
        srsUsd: Number(incomingSeason.srsUsd) || 0,
        childRateFactor: Number(incomingSeason.childRateFactor) || 0.5,
        minNights: Number(incomingSeason.minNights) || 1,
      });
    }
  }

  return { seasons: uniqueSeasons, duplicatesRemovedCount };
}

/**
 * Consolidates an array of STOAccommodationProperty records:
 * 1. Groups matching properties for the same facility
 * 2. Merges seasons across matching facility entries
 * 3. Eliminates duplicate identical rates within each facility
 */
export function deduplicateAccommodationDatabase(
  properties: STOAccommodationProperty[]
): {
  properties: STOAccommodationProperty[];
  duplicatePropertiesCount: number;
  duplicateRatesCount: number;
} {
  if (!Array.isArray(properties)) {
    return { properties: [], duplicatePropertiesCount: 0, duplicateRatesCount: 0 };
  }

  const facilityMap = new Map<string, STOAccommodationProperty>();
  let duplicatePropertiesCount = 0;
  let totalDuplicateRatesCount = 0;

  for (const rawProp of properties) {
    if (!rawProp || !rawProp.name) continue;

    const key = getFacilityKey(rawProp);

    if (facilityMap.has(key)) {
      // Existing facility found: merge seasons and remove duplicates
      duplicatePropertiesCount++;
      const existingProp = facilityMap.get(key)!;

      // Combine existing seasons and incoming seasons
      const combinedSeasons = [...(existingProp.seasons || []), ...(rawProp.seasons || [])];
      const { seasons: dedupedSeasons, duplicatesRemovedCount } = deduplicateSeasonsForFacility(
        combinedSeasons,
        existingProp.id
      );

      totalDuplicateRatesCount += duplicatesRemovedCount;

      facilityMap.set(key, {
        ...existingProp,
        seasons: dedupedSeasons,
        // Update validity or source if incoming is newer
        validityYear: Math.max(existingProp.validityYear || 2026, rawProp.validityYear || 2026),
        sourceDocument: rawProp.sourceDocument || existingProp.sourceDocument,
        sourceDate: (rawProp.sourceDate && rawProp.sourceDate > (existingProp.sourceDate || ''))
          ? rawProp.sourceDate
          : existingProp.sourceDate,
        status: existingProp.status === 'Active' ? 'Active' : rawProp.status,
      });
    } else {
      // New facility: deduplicate its own seasons
      const baseId = rawProp.id || `prop-${rawProp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const { seasons: dedupedSeasons, duplicatesRemovedCount } = deduplicateSeasonsForFacility(
        rawProp.seasons || [],
        baseId
      );

      totalDuplicateRatesCount += duplicatesRemovedCount;

      facilityMap.set(key, {
        ...rawProp,
        id: baseId,
        seasons: dedupedSeasons,
      });
    }
  }

  // Ensure all IDs are guaranteed unique
  const result: STOAccommodationProperty[] = [];
  const seenIds = new Set<string>();

  for (const prop of facilityMap.values()) {
    let id = prop.id;
    if (seenIds.has(id)) {
      id = `${id}-${result.length + 1}`;
    }
    seenIds.add(id);

    // Re-verify season IDs match final property ID
    const finalizedSeasons = prop.seasons.map((s, idx) => ({
      ...s,
      id: s.id && !s.id.includes('temp') ? s.id : `${id}-season-${idx + 1}`
    }));

    result.push({
      ...prop,
      id,
      seasons: finalizedSeasons,
    });
  }

  return {
    properties: result,
    duplicatePropertiesCount,
    duplicateRatesCount: totalDuplicateRatesCount,
  };
}

/**
 * Merges incoming accommodation properties into existing database,
 * preventing duplicate facilities and duplicate identical rate seasons.
 */
export function mergeAccommodationDatabases(
  existing: STOAccommodationProperty[],
  incoming: STOAccommodationProperty[]
): {
  merged: STOAccommodationProperty[];
  duplicatesIgnoredCount: number;
  ratesMergedCount: number;
} {
  const existingList = deduplicateAccommodationDatabase(existing).properties;
  const incomingList = deduplicateAccommodationDatabase(incoming).properties;

  let duplicatesIgnoredCount = 0;
  let ratesMergedCount = 0;

  const facilityMap = new Map<string, STOAccommodationProperty>();

  // Seed existing
  for (const prop of existingList) {
    const key = getFacilityKey(prop);
    facilityMap.set(key, prop);
  }

  // Merge incoming
  for (const incProp of incomingList) {
    const key = getFacilityKey(incProp);

    if (facilityMap.has(key)) {
      const existingProp = facilityMap.get(key)!;
      const existingSeasons = existingProp.seasons || [];
      const newSeasonsToAdd: STOSeasonRate[] = [];

      for (const incSeason of incProp.seasons || []) {
        const isDuplicate = existingSeasons.some(exSeason => areSeasonRatesIdentical(exSeason, incSeason));
        if (isDuplicate) {
          duplicatesIgnoredCount++;
        } else {
          newSeasonsToAdd.push(incSeason);
          ratesMergedCount++;
        }
      }

      if (newSeasonsToAdd.length > 0) {
        const combined = [...existingSeasons, ...newSeasonsToAdd];
        const { seasons: deduped } = deduplicateSeasonsForFacility(combined, existingProp.id);
        facilityMap.set(key, {
          ...existingProp,
          seasons: deduped,
          validityYear: Math.max(existingProp.validityYear || 2026, incProp.validityYear || 2026),
        });
      }
    } else {
      // Totally new facility
      facilityMap.set(key, incProp);
      ratesMergedCount += (incProp.seasons || []).length;
    }
  }

  const merged = Array.from(facilityMap.values());
  return {
    merged,
    duplicatesIgnoredCount,
    ratesMergedCount,
  };
}

/**
 * Helper to ensure every entity in a list has a globally unique ID
 */
export function enforceUniqueIds<T extends { id?: string; name?: string }>(items: T[], fallbackPrefix: string): T[] {
  const seenIds = new Set<string>();
  return items.map((item, idx) => {
    let baseId = item.id || `${fallbackPrefix}-${idx + 1}`;
    let uniqueId = baseId;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);
    return {
      ...item,
      id: uniqueId,
    };
  });
}

/**
 * Deduplicate Park Fee records
 */
export function deduplicateParkFees(parks: ParkFeeRecord[]): ParkFeeRecord[] {
  if (!Array.isArray(parks)) return [];
  const map = new Map<string, ParkFeeRecord>();
  for (const p of parks) {
    if (!p || !p.parkName) continue;
    const key = `${normalizeKey(p.parkName)}__${normalizeKey(p.country)}__${normalizeKey(p.category)}__${normalizeKey(p.effectivePeriod || '2026')}`;
    if (!map.has(key)) {
      map.set(key, p);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...p });
    }
  }
  return enforceUniqueIds(Array.from(map.values()), 'park');
}

/**
 * Deduplicate Activities
 */
export function deduplicateActivities(activities: ActivityOption[]): ActivityOption[] {
  if (!Array.isArray(activities)) return [];
  const map = new Map<string, ActivityOption>();
  for (const a of activities) {
    if (!a || !a.name) continue;
    const key = `${normalizeKey(a.name)}__${normalizeKey(a.location)}__${a.ratePerPaxUsd}`;
    if (!map.has(key)) {
      map.set(key, a);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...a });
    }
  }
  return enforceUniqueIds(Array.from(map.values()), 'act');
}

/**
 * Deduplicate Transport Options
 */
export function deduplicateTransport(transport: TransportOption[]): TransportOption[] {
  if (!Array.isArray(transport)) return [];
  const map = new Map<string, TransportOption>();
  for (const t of transport) {
    if (!t || !t.name) continue;
    const key = `${normalizeKey(t.name)}__${normalizeKey(t.vehicleType)}__${t.dailyRateHighUsd}`;
    if (!map.has(key)) {
      map.set(key, t);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...t });
    }
  }
  return enforceUniqueIds(Array.from(map.values()), 'trans');
}

/**
 * Deduplicate Flights
 */
export function deduplicateFlights(flights: FlightOption[]): FlightOption[] {
  if (!Array.isArray(flights)) return [];
  const map = new Map<string, FlightOption>();
  for (const f of flights) {
    if (!f || !f.route) continue;
    const key = `${normalizeKey(f.route)}__${normalizeKey(f.airline)}__${f.oneWayRateUsd}`;
    if (!map.has(key)) {
      map.set(key, f);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...f });
    }
  }
  return enforceUniqueIds(Array.from(map.values()), 'flight');
}

/**
 * Deduplicate Extras
 */
export function deduplicateExtras(extras: ExtraOperationalCost[]): ExtraOperationalCost[] {
  if (!Array.isArray(extras)) return [];
  const map = new Map<string, ExtraOperationalCost>();
  for (const e of extras) {
    if (!e || !e.name) continue;
    const key = `${normalizeKey(e.name)}__${normalizeKey(e.unit)}__${e.rateUsd}`;
    if (!map.has(key)) {
      map.set(key, e);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...e });
    }
  }
  return enforceUniqueIds(Array.from(map.values()), 'extra');
}
