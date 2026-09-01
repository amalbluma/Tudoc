export type BoardBasis = 'Full Board (FB)' | 'Game Package (GP)' | 'All Inclusive (AI)' | 'Bed & Breakfast (BB)' | 'Half Board (HB)' | 'Room Only (RO)';
export type Country = 'Kenya' | 'Tanzania' | 'Rwanda' | 'Uganda' | 'Cross-Border';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'KES' | 'TZS';
export type MarketSegment = 'Non-Resident' | 'East Africa Resident' | 'Citizen' | 'All Markets';

export interface STOSeasonRate {
  id: string;
  seasonName: string;
  startDate: string; // MM-DD or YYYY-MM-DD
  endDate: string;
  description: string;
  ppsUsd: number; // Per Person Sharing (USD normalized)
  srsUsd: number; // Single Room Supplement (USD normalized)
  childRateFactor: number; // e.g. 0.5 for 50%
  currency?: CurrencyCode; // Contracted currency e.g. USD, KES, TZS
  ppsLocalCurrency?: number; // Original rate in KES/TZS if resident rate
  srsLocalCurrency?: number; // Original SRS in KES/TZS
  exchangeRateToUsd?: number; // Conversion rate e.g. 130 for KES, 2600 for TZS
  marketSegment?: MarketSegment;
  tripleReductionUsd?: number;
  minNights?: number;
  notes?: string;
}

export interface STOAccommodationProperty {
  id: string;
  name: string;
  facilityGroup?: string; // e.g. 'Sarova Hotels', 'Serena Hotels & Resorts', 'Elewana Collection', 'Governors\' Camp Collection'
  country: 'Kenya' | 'Tanzania' | 'Rwanda' | 'Uganda';
  region: string; // e.g. Maasai Mara, Serengeti, Amboseli, Ngorongoro
  parkOrConservancyId: string;
  boardBasis: BoardBasis;
  roomCategory: string;
  currency?: CurrencyCode; // Default 'USD' for Non-Resident, 'KES'/'TZS' for East African Resident
  marketSegment?: MarketSegment; // 'Non-Resident' | 'East Africa Resident' | 'Citizen' | 'All Markets'
  seasons: STOSeasonRate[];
  sourceDocument: string;
  sourceDate: string;
  sourceType: 'STO Rate Contract 2026' | 'Confidential Operator Tariff' | 'Verified Partner Agreement';
  validityYear: number;
  status: 'Active' | 'Verification Required';
}

export interface ParkFeeRecord {
  id: string;
  country: 'Kenya' | 'Tanzania' | 'Rwanda' | 'Uganda';
  parkName: string;
  areaType: 'National Park' | 'National Reserve' | 'Conservancy' | 'Conservation Area';
  category: 'Non-Resident Adult' | 'Non-Resident Child' | 'Resident Adult' | 'Resident Child' | 'Citizen Adult' | 'Vehicle' | 'Crater Descent' | 'Concession Fee';
  currency?: CurrencyCode;
  feeLocalCurrency?: number; // In KES or TZS if citizen/resident tariff
  highSeasonFeeUsd: number;
  lowSeasonFeeUsd: number;
  isDaily: boolean; // per day vs per night/descent
  vehicleFeeUsd?: number;
  guideFeeUsd?: number;
  concessionFeeUsd?: number;
  effectivePeriod: string;
  officialAuthority: string; // e.g. "KWS Tariffs 2024-2026", "Narok County Gazette", "TANAPA 2026", "NCAA"
  verificationStatus: 'Official Verified' | 'Verification Required';
  notes?: string;
}

export interface TransportOption {
  id: string;
  name: string;
  vehicleType: '4x4 Safari Land Cruiser' | 'Safari Minivan' | 'Overland Truck' | 'Transfers' | 'Car rental' | 'Air transport' | 'Charter flight' | 'Train';
  maxCapacity: number; // typically 6-7 window seats
  currency?: CurrencyCode;
  dailyRateHighUsd: number;
  dailyRateLowUsd: number;
  includes: string;
  driverAllowanceDailyUsd: number;
}

export interface FlightOption {
  id: string;
  route: string;
  airline: string;
  currency?: CurrencyCode;
  oneWayRateUsd: number;
  baggageLimitKg: number;
  departurePoint: string;
  arrivalPoint: string;
}

export interface ActivityOption {
  id: string;
  name: string;
  location: string;
  currency?: CurrencyCode;
  ratePerPaxUsd: number;
  ratePerVehicleUsd?: number;
  description: string;
  category: 'Aerial' | 'Cultural' | 'Wildlife/Nature' | 'Water' | 'Dining';
}

export interface ExtraOperationalCost {
  id: string;
  name: string;
  unit: 'Per Person' | 'Per Person Per Day' | 'Per Vehicle' | 'Per Group';
  currency?: CurrencyCode;
  rateUsd: number;
  mandatory: boolean;
  description: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  destination: string;
  country: Country;
  parkFeeId: string;
  propertyId: string;
  selectedSeasonId?: string;
  nights: number;
  roomType: 'Twin/Double' | 'Single' | 'Triple' | 'Family';
  numberOfRooms: number;
  transportVehicleId: string;
  includeVehicleThisDay: boolean;
  flightId?: string;
  activityIds: string[];
  notes: string;
  highlightSummary?: string;
  dayImage?: string;
  // Rich time-of-day schedule items (Page 2 wireframe)
  detailedSchedule?: {
    morning: Array<{ id: string; time: string; title: string; subtitle: string; type: string; icon?: string }>;
    afternoon: Array<{ id: string; time: string; title: string; subtitle: string; type: string; icon?: string }>;
    evening: Array<{ id: string; time: string; title: string; subtitle: string; type: string; icon?: string }>;
  };
  distanceKm?: number;
  drivingTimeHours?: string;
  mealsIncluded?: string;
}

export interface SavedQuote {
  id: string;
  dateSaved: string;
  clientInputs: ClientQuotationInputs;
  itinerary: ItineraryDay[];
  totals: CostingTotals;
  status?: 'Accepted' | 'Pending' | 'Draft' | 'Rejected';
  itineraryName?: string;
}

export interface SupplierRatesExtractionResult {
  contractSummary: string;
  supplierName?: string;
  extractedProperties?: STOAccommodationProperty[];
  extractedActivities?: ActivityOption[];
  extractedParkFees?: ParkFeeRecord[];
  extractedTransport?: TransportOption[];
  extractedFlights?: FlightOption[];
  extractedExtras?: ExtraOperationalCost[];
}

export interface CompanySettings {
  companyName: string;
  companyLogoUrl?: string;
  companyEmail: string;
  companyPhone?: string;
  companyAddress?: string;
  address?: string;
  taxVatNumber?: string;
  taxPinNumber?: string;
  licenseNumber?: string;
  defaultMarkupPercent: number;
  defaultOperatorMarkupPercent?: number;
  defaultAgencyCommissionPercent?: number;
  defaultCurrency: CurrencyCode;
  baseCurrency?: CurrencyCode;
  vatPercentage?: number;
  childMaxAge?: number;
  singleSupplementPercent?: number;
  showPhotosInItinerary: boolean;
  termsAndConditions?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
  };
}

export type ItineraryType = 'fit' | 'group' | 'scheduled_departure';

export type TravelStyleTier = 
  | 'Budget / Camping Safari'
  | 'Mid-Range / Standard Comfort'
  | 'Semi-Luxury / Premium Classic'
  | 'Luxury Tented Safari (5-Star)'
  | 'Ultra-Luxury / Connoisseur VIP'
  | 'Flying Safari Express'
  | 'Family & Conservation Safari'
  | 'Photographic & Specialist Expedition';

export interface RoomConfiguration {
  singleRooms: number;
  doubleTwinRooms: number;
  tripleRooms: number;
  familyRooms: number;
}

export interface ClientQuotationInputs {
  quoteReference: string;
  clientName: string;
  clientEmail: string;
  agencyOrLead: string;
  travelStartDate: string; // YYYY-MM-DD
  travelEndDate: string;
  durationDays?: number;
  itineraryType?: ItineraryType;
  travelStyleTier?: string;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  roomConfig: RoomConfiguration;
  operatorMarkupPercent: number; // default 10.0
  agencyCommissionPercent?: number;
  vatTaxPercent: number; // 0 or 16% where applicable
  selectedCurrency: CurrencyCode;
  specialRequestsNotes: string;
  scheduledDepartureCode?: string;
  departureDates?: string[];
  maxGroupSize?: number;
}

export interface DayCostBreakdown {
  dayNumber: number;
  destination: string;
  accommodationName: string;
  accommodationSeason: string;
  accommodationNetUsd: number;
  parkName: string;
  parkFeesNetUsd: number;
  transportNetUsd: number;
  flightNetUsd: number;
  activitiesNetUsd: number;
  operationalExtrasNetUsd: number;
  dayTotalNetUsd: number;
  formulaAuditText: string;
}

export interface CostingTotals {
  totalAccommodationNetUsd: number;
  totalParkFeesNetUsd: number;
  totalTransportNetUsd: number;
  totalFlightsNetUsd: number;
  totalActivitiesNetUsd: number;
  totalOperationalExtrasNetUsd: number;
  totalDirectNetCostUsd: number;
  
  operatorMarkupPercent: number;
  operatorMarkupAmountUsd: number;
  subtotalWithMarkupUsd: number;
  
  vatTaxPercent: number;
  vatTaxAmountUsd: number;
  
  grandSellingPriceUsd: number;
  pricePerPersonUsd: number;
  pricePerChildUsd?: number;
  
  // FX Converted values
  selectedCurrency: CurrencyCode;
  fxRateToBase: number; // 1.0 for USD
  grandSellingPriceConverted: number;
  pricePerPersonConverted: number;
}

export interface ValidationItem {
  id: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  dayNumber?: number;
}

export interface CostingDraft {
  id: string;
  name: string;
  quoteReference: string;
  clientName: string;
  agencyOrLead: string;
  lastSaved: string; // ISO string
  clientInputs: ClientQuotationInputs;
  itinerary: ItineraryDay[];
  totals: CostingTotals;
  daysCount: number;
  paxCount: number;
  autoSaved: boolean; // true = periodic auto-save, false = manual snapshot
  grandTotalUsd: number;
  destinationsSummary: string[];
}

// ----------------- DASHBOARD & OPERATIONS TYPES (PAGE 3 WIREFRAME) -----------------
export interface ActiveSafariExpedition {
  id: string;
  name: string;
  destination: string;
  currentDay: number;
  totalDays: number;
  guideName: string;
  guidePhone?: string;
  vehiclePlate: string;
  departureTime: string;
  progressPercent: number;
  paxCount: number;
  country: 'Kenya' | 'Tanzania' | 'South Africa' | 'Rwanda';
}

export interface UpcomingTripItem {
  id: string;
  client: string;
  destination: string;
  travelDate: string;
  pax: number;
  status: 'Confirmed' | 'Pending' | 'Planned';
  consultant: string;
  itineraryDays: number;
  totalUsd: number;
}

export interface EnquiryItem {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  destination: string;
  travelMonth: string;
  travelStartDate?: string;
  travelEndDate?: string;
  durationDays?: number;
  travelStyleTier?: string;
  itineraryType?: ItineraryType;
  paxAdults: number;
  paxChildren: number;
  estimatedBudgetUsd: number;
  source: 'Web Direct' | 'SafariBookings' | 'Agent Lead' | 'Referral' | 'Repeat Client';
  status: 'New' | 'In Contact' | 'Quoted' | 'Won' | 'Lost';
  assignedTo: string;
  createdAt: string;
  notes: string;
}

export interface FleetVehicle {
  id: string;
  regNumber: string;
  model: string;
  vehicleType: '4x4 Safari Land Cruiser' | 'Safari Minivan' | 'Extended Land Cruiser';
  year: number;
  capacity: number;
  status: 'On Safari' | 'Available' | 'In Maintenance';
  currentDriver?: string;
  location: string;
  mileageKm: number;
  lastServiceDate: string;
}

export interface SafariGuide {
  id: string;
  name: string;
  role: 'Senior Naturalist Guide' | 'Driver-Guide' | 'Tracker / Spotter';
  languages: string[];
  rating: number;
  tripsCompleted: number;
  certification: 'KPSGA Gold' | 'KPSGA Silver' | 'KPSGA Bronze' | 'FGASA Level 2';
  specialty?: string;
  experienceYears?: number;
  phone: string;
  status: 'On Safari' | 'Available' | 'On Leave';
  currentTrip?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  quoteRef: string;
  issueDate?: string;
  dueDate: string;
  totalAmountUsd: number;
  paidAmountUsd?: number;
  amountPaidUsd?: number;
  balanceDueUsd?: number;
  status: 'Paid' | 'Partially Paid' | 'Partial' | 'Issued' | 'Pending' | 'Overdue';
}

export type VoucherType = 'hotel' | 'transport' | 'flight' | 'activity' | 'park_fee';
export type VoucherStatus = 'Confirmed' | 'Issued' | 'Awaiting Supplier' | 'Cancelled';

export interface BookingVoucher {
  id: string;
  voucherNumber: string;
  voucherType: VoucherType;
  quoteReference: string;
  clientName: string;
  leadGuest: string;
  paxAdults: number;
  paxChildren: number;
  roomConfigSummary?: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  serviceName: string;
  destination: string;
  checkInDate: string;
  checkOutDate?: string;
  nightsCount?: number;
  roomType?: string;
  boardBasis?: string;
  supplierConfirmationRef?: string;
  inclusions: string[];
  specialRequests?: string;
  billingInstruction: string;
  emergencyContact: string;
  status: VoucherStatus;
  issuedDate: string;
  issuedBy: string;
}

export interface TourDocRecord {
  id: string;
  guestKey: string; // e.g. "6.266.1546"
  tourRootCode: string; // e.g. "PUNDA635"
  quoteReference: string;
  tourTitle: string;
  clientName: string;
  agencyOrLead?: string;
  paxCount: number;
  paxAdults: number;
  paxChildren: number;
  travelStartDate: string;
  travelEndDate: string;
  totalDays: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  currentRunningDay: number;
  assignedGuideId?: string;
  assignedVehicleId?: string;
  guideName?: string;
  guidePhone?: string;
  vehicleReg?: string;
  vehicleModel?: string;
  meetAndGreetDetails: {
    airport: string;
    flightArrivalInfo: string;
    pickupTime: string;
    contactPerson: string;
    contactPhone: string;
  };
  vouchers: BookingVoucher[];
  flights: Array<{
    id: string;
    flightNumber: string;
    airline: string;
    route: string;
    date: string;
    departureTime: string;
    arrivalTime: string;
    baggageAllowanceKg: number;
    airstrip: string;
    pnrStatus: string;
  }>;
  emergencyContacts: Array<{
    role: string;
    name: string;
    phone: string;
    availableHours: string;
  }>;
  notes?: string;
}


