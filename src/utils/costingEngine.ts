import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import { ACTIVITY_OPTIONS, FLIGHT_OPTIONS, OPERATIONAL_EXTRAS, TRANSPORT_OPTIONS } from '../data/transportAndExtrasData';
import { FX_RATES_DATABASE } from '../data/exchangeRatesData';
import {
  ActivityOption,
  ClientQuotationInputs,
  CostingTotals,
  DayCostBreakdown,
  ExtraOperationalCost,
  FlightOption,
  ItineraryDay,
  ParkFeeRecord,
  STOAccommodationProperty,
  STOSeasonRate,
  TransportOption,
  ValidationItem
} from '../types/costing';

/**
 * Match date (YYYY-MM-DD) to property season, or fallback to first season
 */
export function getSeasonForDate(
  propertyId: string,
  travelDate: string,
  explicitSeasonId?: string,
  stoDatabase: STOAccommodationProperty[] = STO_ACCOMMODATION_DATABASE
): { season: STOSeasonRate | null; isAutoMatched: boolean } {
  const property = stoDatabase.find(p => p.id === propertyId);
  if (!property || !property.seasons.length) return { season: null, isAutoMatched: false };

  if (explicitSeasonId) {
    const explicit = property.seasons.find(s => s.id === explicitSeasonId);
    if (explicit) return { season: explicit, isAutoMatched: false };
  }

  // Parse month and day from travelDate (YYYY-MM-DD or MM-DD)
  const parts = travelDate.split('-');
  let monthDay = '07-15'; // default mid-summer migration
  if (parts.length >= 3) {
    monthDay = `${parts[1]}-${parts[2]}`;
  } else if (parts.length === 2) {
    monthDay = `${parts[0]}-${parts[1]}`;
  }

  // Match season range
  for (const season of property.seasons) {
    if (season.startDate <= season.endDate) {
      if (monthDay >= season.startDate && monthDay <= season.endDate) {
        return { season, isAutoMatched: true };
      }
    } else {
      // Crosses year boundary (e.g. 12-20 to 01-05)
      if (monthDay >= season.startDate || monthDay <= season.endDate) {
        return { season, isAutoMatched: true };
      }
    }
  }

  // Fallback to highest demand / default season
  return { season: property.seasons[0], isAutoMatched: false };
}

/**
 * Determine if a given date falls in East Africa High/Peak Season (July - October, Dec 20 - Jan 5)
 */
export function isHighSeasonDate(travelDate: string): boolean {
  if (!travelDate) return true;
  const parts = travelDate.split('-');
  const month = parts.length >= 2 ? parseInt(parts[1], 10) : 7;
  const day = parts.length >= 3 ? parseInt(parts[2], 10) : 1;

  if (month >= 7 && month <= 10) return true; // July, Aug, Sep, Oct
  if (month === 12 && day >= 20) return true; // Festive
  if (month === 1 && day <= 5) return true; // New Year
  if (month === 6) return true; // June shoulder
  return false;
}

/**
 * Calculate required number of 4x4 vehicles based on passengers
 */
export function calculateRequiredVehicles(totalPax: number, vehicleMaxCapacity = 6): number {
  if (totalPax <= 0) return 1;
  return Math.ceil(totalPax / vehicleMaxCapacity);
}

/**
 * Master Costing Calculation Core
 */
export function calculateMasterCosting(
  clientInputs: ClientQuotationInputs,
  itinerary: ItineraryDay[],
  stoDatabase: STOAccommodationProperty[] = STO_ACCOMMODATION_DATABASE,
  parkFeesDatabase: ParkFeeRecord[] = PARK_FEES_DATABASE,
  transportOptions: TransportOption[] = TRANSPORT_OPTIONS,
  flightOptions: FlightOption[] = FLIGHT_OPTIONS,
  activityOptions: ActivityOption[] = ACTIVITY_OPTIONS,
  operationalExtras: ExtraOperationalCost[] = OPERATIONAL_EXTRAS
): {
  dayBreakdowns: DayCostBreakdown[];
  totals: CostingTotals;
  validations: ValidationItem[];
} {
  const totalPax = clientInputs.paxAdults + clientInputs.paxChildren;
  const validations: ValidationItem[] = [];

  // Capacity validation
  const defaultVehicle = transportOptions[0] || TRANSPORT_OPTIONS[0];
  const requiredVehicles = calculateRequiredVehicles(totalPax, defaultVehicle.maxCapacity);
  if (totalPax > 6 && requiredVehicles > 1) {
    validations.push({
      id: 'val-vehicle-capacity',
      severity: 'info',
      title: 'Multi-Vehicle Group Size',
      message: `${totalPax} guests requires ${requiredVehicles} safari vehicles for comfortable window seats.`
    });
  }

  // Room capacity check
  const totalRoomCapacity = 
    (clientInputs.roomConfig.singleRooms * 1) +
    (clientInputs.roomConfig.doubleTwinRooms * 2) +
    (clientInputs.roomConfig.tripleRooms * 3) +
    (clientInputs.roomConfig.familyRooms * 4);

  if (totalRoomCapacity < clientInputs.paxAdults) {
    validations.push({
      id: 'val-room-config',
      severity: 'warning',
      title: 'Room Capacity Discrepancy',
      message: `Configured rooms accommodate ${totalRoomCapacity} adults, but ${clientInputs.paxAdults} adults are traveling.`
    });
  }

  // Day-by-Day calculation
  const dayBreakdowns: DayCostBreakdown[] = [];
  let totalAccommodationNet = 0;
  let totalParkFeesNet = 0;
  let totalTransportNet = 0;
  let totalFlightsNet = 0;
  let totalActivitiesNet = 0;

  itinerary.forEach((day, index) => {
    // 1. Calculate Day Travel Date (offset by dayNumber - 1)
    let currentDayDate = clientInputs.travelStartDate;
    try {
      const baseDate = new Date(clientInputs.travelStartDate || '2026-07-01');
      baseDate.setDate(baseDate.getDate() + index);
      currentDayDate = baseDate.toISOString().split('T')[0];
    } catch {
      currentDayDate = '2026-07-01';
    }

    const isHigh = isHighSeasonDate(currentDayDate);

    // 2. Accommodation STO Calculation
    const property = stoDatabase.find(p => p.id === day.propertyId);
    let dayAccNet = 0;
    let seasonName = 'Standard';
    let accFormulaParts: string[] = [];

    if (property) {
      const { season } = getSeasonForDate(property.id, currentDayDate, day.selectedSeasonId, stoDatabase);
      if (season) {
        seasonName = season.seasonName;
        const pps = season.ppsUsd;
        const srs = season.srsUsd;
        const childFactor = season.childRateFactor || 0.5;

        // Double/Twin adults
        const doublePax = Math.min(clientInputs.paxAdults, clientInputs.roomConfig.doubleTwinRooms * 2);
        const doubleCost = doublePax * pps;
        if (doublePax > 0) accFormulaParts.push(`(${doublePax} sharing × $${pps})`);

        // Single rooms (PPS + SRS per single room guest)
        const singlePax = clientInputs.roomConfig.singleRooms;
        const singleCost = singlePax * (pps + srs);
        if (singlePax > 0) accFormulaParts.push(`(${singlePax} singles × [$${pps}+$${srs}])`);

        // Triple rooms (3 adults with reduction if any)
        const triplePax = clientInputs.roomConfig.tripleRooms * 3;
        const tripleReduction = season.tripleReductionUsd || 0;
        const tripleCost = triplePax * (pps - tripleReduction);
        if (triplePax > 0) accFormulaParts.push(`(${triplePax} triple × $${pps - tripleReduction})`);

        // Children
        const childCost = clientInputs.paxChildren * (pps * childFactor);
        if (clientInputs.paxChildren > 0) accFormulaParts.push(`(${clientInputs.paxChildren} kids × $${pps * childFactor})`);

        dayAccNet = (doubleCost + singleCost + tripleCost + childCost) * (day.nights || 1);
      } else {
        validations.push({
          id: `val-acc-${day.dayNumber}`,
          severity: 'error',
          title: `Rate Not Found: ${property.name}`,
          message: `No active STO rate found for Day ${day.dayNumber} on date ${currentDayDate}.`,
          dayNumber: day.dayNumber
        });
      }
    }

    // 3. Park & Conservancy Fees
    const parkRecord = parkFeesDatabase.find(p => p.id === day.parkFeeId);
    let dayParkNet = 0;
    let parkFormulaParts: string[] = [];

    if (parkRecord) {
      const adultEntry = isHigh ? parkRecord.highSeasonFeeUsd : parkRecord.lowSeasonFeeUsd;
      const childEntry = adultEntry * 0.5; // KWS / TANAPA standard child is 50%
      const adultTotal = clientInputs.paxAdults * adultEntry;
      const childTotal = clientInputs.paxChildren * childEntry;
      
      parkFormulaParts.push(`(${clientInputs.paxAdults} ad × $${adultEntry})`);
      if (clientInputs.paxChildren > 0) parkFormulaParts.push(`(${clientInputs.paxChildren} ch × $${childEntry})`);

      // Concession Fee if applicable (e.g. Serengeti / Ngorongoro)
      let concessionTotal = 0;
      if (parkRecord.concessionFeeUsd && parkRecord.concessionFeeUsd > 0) {
        concessionTotal = (clientInputs.paxAdults + clientInputs.paxChildren) * parkRecord.concessionFeeUsd;
        parkFormulaParts.push(`(Concession $${parkRecord.concessionFeeUsd} × ${totalPax})`);
      }

      // Vehicle Park Entry Fee
      const vehicleEntryTotal = (parkRecord.vehicleFeeUsd || 0) * requiredVehicles;
      if (vehicleEntryTotal > 0) {
        parkFormulaParts.push(`(Veh entry $${parkRecord.vehicleFeeUsd} × ${requiredVehicles})`);
      }

      dayParkNet = adultTotal + childTotal + concessionTotal + vehicleEntryTotal;
    }

    // 4. Vehicle Transport Calculation
    let dayTransportNet = 0;
    if (day.includeVehicleThisDay) {
      const vehicle = transportOptions.find(v => v.id === day.transportVehicleId) || transportOptions[0] || TRANSPORT_OPTIONS[0];
      const dailyVehicleRate = isHigh ? vehicle.dailyRateHighUsd : vehicle.dailyRateLowUsd;
      const totalDailyVehicleWithGuide = (dailyVehicleRate + vehicle.driverAllowanceDailyUsd) * requiredVehicles;
      dayTransportNet = totalDailyVehicleWithGuide;
    }

    // 5. Flights Calculation
    let dayFlightNet = 0;
    if (day.flightId) {
      const flight = flightOptions.find(f => f.id === day.flightId);
      if (flight) {
        dayFlightNet = flight.oneWayRateUsd * totalPax;
      }
    }

    // 6. Activities Calculation
    let dayActivitiesNet = 0;
    if (day.activityIds && day.activityIds.length > 0) {
      day.activityIds.forEach(actId => {
        const act = activityOptions.find(a => a.id === actId);
        if (act) {
          if (act.ratePerVehicleUsd && act.ratePerVehicleUsd > 0) {
            dayActivitiesNet += act.ratePerVehicleUsd * requiredVehicles;
          } else {
            dayActivitiesNet += act.ratePerPaxUsd * totalPax;
          }
        }
      });
    }

    // 7. Day Total
    const dayTotalNet = dayAccNet + dayParkNet + dayTransportNet + dayFlightNet + dayActivitiesNet;

    totalAccommodationNet += dayAccNet;
    totalParkFeesNet += dayParkNet;
    totalTransportNet += dayTransportNet;
    totalFlightsNet += dayFlightNet;
    totalActivitiesNet += dayActivitiesNet;

    const formulaAuditText = `Acc: [${accFormulaParts.join(' + ') || '$0'}] + Park: [${parkFormulaParts.join(' + ') || '$0'}] + Trans: $${dayTransportNet} + Flt: $${dayFlightNet} + Act: $${dayActivitiesNet} = $${dayTotalNet.toFixed(2)}`;

    dayBreakdowns.push({
      dayNumber: day.dayNumber,
      destination: day.destination,
      accommodationName: property ? property.name : 'None / Transit',
      accommodationSeason: seasonName,
      accommodationNetUsd: dayAccNet,
      parkName: parkRecord ? parkRecord.parkName : 'None',
      parkFeesNetUsd: dayParkNet,
      transportNetUsd: dayTransportNet,
      flightNetUsd: dayFlightNet,
      activitiesNetUsd: dayActivitiesNet,
      operationalExtrasNetUsd: 0,
      dayTotalNetUsd: dayTotalNet,
      formulaAuditText
    });
  });

  // 8. Calculate Operational Extras (Mandatory + Selected)
  let totalOperationalExtras = 0;
  operationalExtras.forEach(extra => {
    if (extra.mandatory || extra.id === 'extra-airport-transfer-nbo') {
      if (extra.unit === 'Per Person') {
        totalOperationalExtras += extra.rateUsd * totalPax;
      } else if (extra.unit === 'Per Person Per Day') {
        totalOperationalExtras += extra.rateUsd * totalPax * (itinerary.length || 1);
      } else if (extra.unit === 'Per Vehicle') {
        totalOperationalExtras += extra.rateUsd * requiredVehicles;
      }
    }
  });

  // 9. Total Direct Net Cost
  const totalDirectNetCostUsd =
    totalAccommodationNet +
    totalParkFeesNet +
    totalTransportNet +
    totalFlightsNet +
    totalActivitiesNet +
    totalOperationalExtras;

  // 10. Operator Markup / Margin Calculation (User defined, default 10.0%)
  const markupPercent = Number(clientInputs.operatorMarkupPercent ?? 10.0);
  const operatorMarkupAmountUsd = totalDirectNetCostUsd * (markupPercent / 100);
  const subtotalWithMarkupUsd = totalDirectNetCostUsd + operatorMarkupAmountUsd;

  // 11. VAT / Taxes where applicable (Default 0% on export package or user override)
  const vatTaxPercent = Number(clientInputs.vatTaxPercent ?? 0);
  const vatTaxAmountUsd = subtotalWithMarkupUsd * (vatTaxPercent / 100);

  // 12. Grand Selling Price
  const grandSellingPriceUsd = subtotalWithMarkupUsd + vatTaxAmountUsd;
  const pricePerPersonUsd = totalPax > 0 ? grandSellingPriceUsd / totalPax : 0;

  // 13. FX Conversion
  const targetCurrency = clientInputs.selectedCurrency || 'USD';
  const fxInfo = FX_RATES_DATABASE[targetCurrency] || FX_RATES_DATABASE.USD;
  const fxRateToBase = fxInfo.rateFromUsd;
  const grandSellingPriceConverted = grandSellingPriceUsd * fxRateToBase;
  const pricePerPersonConverted = pricePerPersonUsd * fxRateToBase;

  const totals: CostingTotals = {
    totalAccommodationNetUsd: Math.round(totalAccommodationNet * 100) / 100,
    totalParkFeesNetUsd: Math.round(totalParkFeesNet * 100) / 100,
    totalTransportNetUsd: Math.round(totalTransportNet * 100) / 100,
    totalFlightsNetUsd: Math.round(totalFlightsNet * 100) / 100,
    totalActivitiesNetUsd: Math.round(totalActivitiesNet * 100) / 100,
    totalOperationalExtrasNetUsd: Math.round(totalOperationalExtras * 100) / 100,
    totalDirectNetCostUsd: Math.round(totalDirectNetCostUsd * 100) / 100,
    
    operatorMarkupPercent: markupPercent,
    operatorMarkupAmountUsd: Math.round(operatorMarkupAmountUsd * 100) / 100,
    subtotalWithMarkupUsd: Math.round(subtotalWithMarkupUsd * 100) / 100,
    
    vatTaxPercent,
    vatTaxAmountUsd: Math.round(vatTaxAmountUsd * 100) / 100,
    
    grandSellingPriceUsd: Math.round(grandSellingPriceUsd * 100) / 100,
    pricePerPersonUsd: Math.round(pricePerPersonUsd * 100) / 100,
    
    selectedCurrency: targetCurrency,
    fxRateToBase,
    grandSellingPriceConverted: Math.round(grandSellingPriceConverted * 100) / 100,
    pricePerPersonConverted: Math.round(pricePerPersonConverted * 100) / 100
  };

  return {
    dayBreakdowns,
    totals,
    validations
  };
}

/**
 * Format currency with proper symbol and decimal precision
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const fx = FX_RATES_DATABASE[currency as keyof typeof FX_RATES_DATABASE] || FX_RATES_DATABASE.USD;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fx.formatDecimals,
    maximumFractionDigits: fx.formatDecimals
  }).format(amount);

  return `${fx.symbol}${formattedNumber}`;
}
