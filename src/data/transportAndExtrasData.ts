import { ActivityOption, ExtraOperationalCost, FlightOption, TransportOption } from '../types/costing';

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'veh-land-cruiser-4x4',
    name: 'Custom 4x4 Safari Land Cruiser (Extended)',
    vehicleType: '4x4 Safari Land Cruiser',
    maxCapacity: 6, // 6 window seats
    dailyRateHighUsd: 250.0,
    dailyRateLowUsd: 230.0,
    driverAllowanceDailyUsd: 40.0,
    includes: 'Professional English-speaking driver-guide, fuel, unlimited game drives within park hours, pop-up roof for 360° photography, inverter/charging points, fridge/cooler box.'
  },
  {
    id: 'veh-safari-van',
    name: '4x4 Safari Minivan (Window Guarantee)',
    vehicleType: 'Safari Minivan',
    maxCapacity: 6,
    dailyRateHighUsd: 180.0,
    dailyRateLowUsd: 160.0,
    driverAllowanceDailyUsd: 35.0,
    includes: 'Professional driver-guide, fuel, game drives, pop-up roof hatch.'
  },
  {
    id: 'veh-tanzania-land-cruiser',
    name: 'Tanzania Spec Heavy Duty 4x4 Land Cruiser',
    vehicleType: '4x4 Safari Land Cruiser',
    maxCapacity: 6,
    dailyRateHighUsd: 280.0,
    dailyRateLowUsd: 260.0,
    driverAllowanceDailyUsd: 45.0,
    includes: 'Licensed Tanzanian safari guide, fuel, VHF radio, pop-up roof, wildlife books, high-power binoculars.'
  }
];

export const FLIGHT_OPTIONS: FlightOption[] = [
  {
    id: 'flt-wilson-mara',
    route: 'Nairobi Wilson (WIL) ⇄ Maasai Mara (MRE/OLK/KT)',
    airline: 'Safarilink / AirKenya',
    oneWayRateUsd: 245.0,
    baggageLimitKg: 15,
    departurePoint: 'Nairobi Wilson',
    arrivalPoint: 'Maasai Mara'
  },
  {
    id: 'flt-mara-wilson',
    route: 'Maasai Mara ⇄ Nairobi Wilson',
    airline: 'Safarilink / AirKenya',
    oneWayRateUsd: 245.0,
    baggageLimitKg: 15,
    departurePoint: 'Maasai Mara',
    arrivalPoint: 'Nairobi Wilson'
  },
  {
    id: 'flt-wilson-amboseli',
    route: 'Nairobi Wilson ⇄ Amboseli',
    airline: 'Safarilink',
    oneWayRateUsd: 210.0,
    baggageLimitKg: 15,
    departurePoint: 'Nairobi Wilson',
    arrivalPoint: 'Amboseli'
  },
  {
    id: 'flt-jro-seronera',
    route: 'Kilimanjaro (JRO) / Arusha (ARK) ⇄ Serengeti Seronera (SEU)',
    airline: 'Coastal Aviation / Auric Air',
    oneWayRateUsd: 320.0,
    baggageLimitKg: 15,
    departurePoint: 'Arusha / Kilimanjaro',
    arrivalPoint: 'Seronera'
  },
  {
    id: 'flt-seronera-zanzibar',
    route: 'Serengeti Seronera ⇄ Zanzibar (ZNZ)',
    airline: 'Flightlink / Coastal',
    oneWayRateUsd: 460.0,
    baggageLimitKg: 15,
    departurePoint: 'Serengeti',
    arrivalPoint: 'Zanzibar'
  },
  {
    id: 'flt-wilson-lamu',
    route: 'Nairobi Wilson (WIL) ⇄ Lamu Manda (LAU)',
    airline: 'Safarilink / Fly540 / Skyward',
    oneWayRateUsd: 215.0,
    baggageLimitKg: 15,
    departurePoint: 'Nairobi Wilson',
    arrivalPoint: 'Lamu (Manda)'
  },
  {
    id: 'flt-lamu-wilson',
    route: 'Lamu Manda (LAU) ⇄ Nairobi Wilson (WIL)',
    airline: 'Safarilink / Fly540 / Skyward',
    oneWayRateUsd: 215.0,
    baggageLimitKg: 15,
    departurePoint: 'Lamu (Manda)',
    arrivalPoint: 'Nairobi Wilson'
  }
];

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    id: 'act-mara-balloon',
    name: 'Maasai Mara Hot Air Balloon Safari',
    location: 'Maasai Mara',
    category: 'Aerial',
    ratePerPaxUsd: 450.0,
    description: 'Dawn hot air balloon flight over the Mara plains followed by bush champagne breakfast in the wild with certificate.'
  },
  {
    id: 'act-serengeti-balloon',
    name: 'Serengeti Sunrise Balloon Flight',
    location: 'Serengeti',
    category: 'Aerial',
    ratePerPaxUsd: 599.0,
    description: '1-hour sunrise flight over wildlife migration trails followed by sparkling wine English bush breakfast.'
  },
  {
    id: 'act-lamu-sunset-dhow',
    name: 'Traditional Swahili Sunset Dhow Cruise',
    location: 'Lamu / Shela Channel',
    category: 'Water',
    ratePerPaxUsd: 45.0,
    description: 'Late afternoon sail along the Lamu channel and mangrove creeks on a handcrafted wooden dhow with fresh samosas & tamarind drinks.'
  },
  {
    id: 'act-lamu-snorkeling-manda',
    name: 'Manda Toto Coral Reef Snorkeling & Seafood BBQ',
    location: 'Lamu Archipelago',
    category: 'Water',
    ratePerPaxUsd: 85.0,
    description: 'Half-day dhow excursion to Manda Toto island coral reefs, snorkeling with tropical fish and grilled lobster beach picnic.'
  },
  {
    id: 'act-lamu-swahili-cultural-tour',
    name: 'Historic Lamu Old Town UNESCO World Heritage Guided Walk',
    location: 'Lamu Old Town',
    category: 'Cultural',
    ratePerPaxUsd: 35.0,
    description: 'Walking tour through ancient coral stone alleyways, Lamu Fort, Swahili house museum, woodcarving workshops and donkey sanctuaries.'
  },
  {
    id: 'act-maasai-village',
    name: 'Authentic Maasai Cultural Village Manyatta Tour',
    location: 'Maasai Mara / Amboseli',
    category: 'Cultural',
    ratePerPaxUsd: 30.0,
    description: 'Guided visit to traditional pastoralist village, ceremonial welcoming dances, beadwork, fire-making demonstration.'
  },
  {
    id: 'act-guided-walking-safari',
    name: 'Guided Bush Walking Safari with Armed Ranger',
    location: 'Mara North / Amboseli / Tarangire',
    category: 'Wildlife/Nature',
    ratePerPaxUsd: 55.0,
    description: '2-hour interpretive bush walk exploring animal tracks, flora, medicinal plants, and insect kingdom.'
  },
  {
    id: 'act-lake-naivasha-boat',
    name: 'Lake Naivasha Boat Safari & Crescent Island Walk',
    location: 'Great Rift Valley',
    category: 'Water',
    ratePerPaxUsd: 65.0,
    description: 'Scenic boat cruise observing hippos & fish eagles, followed by walking amongst free-roaming giraffes & zebras.'
  },
  {
    id: 'act-night-game-drive',
    name: 'Night Game Drive in Private Conservancy',
    location: 'Mara North / Olare Motorogi',
    category: 'Wildlife/Nature',
    ratePerPaxUsd: 90.0,
    description: 'Spotlighting nocturnal predators (lions on the hunt, leopards, aardvarks, bush babies, genets).'
  },
  {
    id: 'act-bush-dinner',
    name: 'Private Lantern-Lit Bush Dinner Under the Stars',
    location: 'Maasai Mara / Serengeti',
    category: 'Dining',
    ratePerPaxUsd: 75.0,
    description: 'Multi-course gourmet dinner set in the wilderness under the African night sky with campfire & Maasai warriors.'
  },
  {
    id: 'act-ngorongoro-crater-service',
    name: 'Ngorongoro Crater Floor Descent Permit',
    location: 'Ngorongoro Crater',
    category: 'Wildlife/Nature',
    ratePerPaxUsd: 0.0,
    ratePerVehicleUsd: 295.0, // Per vehicle per descent
    description: 'Official NCAA crater service permit allowing 6-hour game descent onto the crater floor.'
  }
];

export const OPERATIONAL_EXTRAS: ExtraOperationalCost[] = [
  {
    id: 'extra-amref-flying-doctors',
    name: 'AMREF Flying Doctors Emergency Evacuation Cover',
    unit: 'Per Person',
    rateUsd: 25.0,
    mandatory: true,
    description: 'Covers airborne emergency medical evacuation from any East African airstrip to a premier Nairobi hospital (valid 30 days).'
  },
  {
    id: 'extra-mineral-water',
    name: 'Daily Safari Mineral Water & Refreshment Kit',
    unit: 'Per Person Per Day',
    rateUsd: 6.0,
    mandatory: true,
    description: 'Complimentary cold bottled mineral water, wet wipes, and snacks throughout the safari transit & game drives.'
  },
  {
    id: 'extra-airport-transfer-nbo',
    name: 'Nairobi Airport (JKIA) Private Arrival Transfer',
    unit: 'Per Vehicle',
    rateUsd: 50.0,
    mandatory: false,
    description: 'VIP meet & assist at Jomo Kenyatta International Airport + transfer to city hotel.'
  },
  {
    id: 'extra-departure-pack',
    name: 'Safari Departure Welcome Pack & Safari Hats',
    unit: 'Per Person',
    rateUsd: 15.0,
    mandatory: false,
    description: 'Branded Tusafiri safari sun hat, metal reusable flask, custom East Africa map & wildlife field checklist.'
  }
];
