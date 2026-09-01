export interface SampleContractPreset {
  id: string;
  name: string;
  provider: string;
  validity: string;
  description: string;
  lodgesCount: number;
  contractText: string;
}

export const SAMPLE_STO_CONTRACTS: SampleContractPreset[] = [
  {
    id: 'sample-sarova-2026',
    name: 'Sarova Hotels & Safari Lodges 2026 STO Contract',
    provider: 'Sarova Hotels & Resorts Kenya',
    validity: 'Jan 1, 2026 – Jan 2, 2027',
    description: 'Comprehensive 8-property portfolio: Sarova Mara Game Camp, Lion Hill Nakuru, Shaba Samburu, Whitesands Mombasa, Stanley Nairobi, Panafric & Woodlands.',
    lodgesCount: 7,
    contractText: `SAROVA HOTELS, RESORTS & GAME LODGES — CONFIDENTIAL STO CONTRACT 2026
ISSUING AUTHORITY: Sarova Hotels Central Commercial Desk, Nairobi, Kenya
CONTRACT CODE: SAROVA-TUSAFIRI-STO-2026
VALIDITY PERIOD: 01 January 2026 to 02 January 2027
CURRENCY: USD ($) NET RATES INCLUSIVE OF 16% VAT & 2% CATERING LEVY

=======================================================================
1. SAROVA MARA GAME CAMP (Maasai Mara National Reserve, Kenya)
Board Basis: Full Board (FB) — 3 gourmet meals daily, afternoon tea & camp hospitality
Room Category: Deluxe Safari Tented Room

SEASONS & STO NET RATES:
- Peak Migration Season (01 July – 31 October 2026 & 22 December – 02 January 2027):
  * Net STO PPS: $495.00
  * Net Single Room Supplement (SRS): $175.00
  * Child Rate (3-11 yrs sharing with adults): $247.50 (50% of adult PPS)
  * Minimum Stay: 2 Nights

- Mid / Shoulder Season (03 January – 31 March, 01 June – 30 June & 01 November – 21 December 2026):
  * Net STO PPS: $345.00
  * Net Single Room Supplement (SRS): $110.00
  * Child Rate: 50%
  * Minimum Stay: 1 Night

- Green / Low Season (01 April – 31 May 2026):
  * Net STO PPS: $235.00
  * Net Single Room Supplement (SRS): $0.00 (Zero SRS Special)
  * Child Rate: 50%
  * Minimum Stay: 1 Night

=======================================================================
2. SAROVA LION HILL GAME LODGE (Lake Nakuru National Park, Kenya)
Board Basis: Full Board (FB)
Room Category: Standard Chalet Room (Lake View)

SEASONS & STO NET RATES:
- Peak High Season (01 July – 31 October 2026 & Festive):
  * Net STO PPS: $385.00 | Net STO SRS: $135.00 | Child: 50% | Min Stay: 1 Night
- Mid Season (03 Jan – 31 Mar & 01 Nov – 21 Dec 2026):
  * Net STO PPS: $275.00 | Net STO SRS: $85.00 | Child: 50% | Min Stay: 1 Night
- Green / Low Season (01 April – 31 May 2026):
  * Net STO PPS: $195.00 | Net STO SRS: $0.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
3. SAROVA SHABA GAME LODGE (Shaba Game Reserve / Samburu, Kenya)
Board Basis: Full Board (FB)
Room Category: Riverfront Chalet

SEASONS & STO NET RATES:
- Peak High Season (01 July – 31 October 2026 & Festive):
  * Net STO PPS: $340.00 | Net STO SRS: $115.00 | Child: 50% | Min Stay: 1 Night
- Mid Season (03 Jan – 31 Mar & 01 Nov – 21 Dec 2026):
  * Net STO PPS: $245.00 | Net STO SRS: $75.00 | Child: 50% | Min Stay: 1 Night
- Green Season (01 April – 31 May 2026):
  * Net STO PPS: $175.00 | Net STO SRS: $0.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
4. SAROVA WHITESANDS BEACH RESORT & SPA (Mombasa North Coast, Kenya)
Board Basis: Half Board (HB) — Breakfast & Dinner at Pavilions Restaurant
Room Category: Sea Facing Deluxe Room

SEASONS & STO NET RATES:
- Peak Festive & Summer (15 July – 31 August & 20 December – 03 January 2027):
  * Net STO PPS: $310.00 | Net STO SRS: $110.00 | Child: 50% | Min Stay: 3 Nights
- Mid Season (06 Jan – 14 Apr & 01 Sep – 19 Dec 2026):
  * Net STO PPS: $215.00 | Net STO SRS: $65.00 | Child: 50% | Min Stay: 2 Nights
- Green / Low Season (15 April – 14 July 2026):
  * Net STO PPS: $145.00 | Net STO SRS: $0.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
5. SAROVA STANLEY HOTEL (Nairobi Central Business District, Kenya)
Board Basis: Bed & Breakfast (BB) — Thorn Tree Cafe Breakfast
Room Category: Deluxe Heritage Room
- Year-Round STO Tariff (01 January – 31 December 2026):
  * Net STO PPS: $185.00 | Net STO SRS: $95.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
6. SAROVA PANAFRIC HOTEL (Nairobi Upper Hill, Kenya)
Board Basis: Bed & Breakfast (BB)
Room Category: Superior Safari Room
- Year-Round STO Tariff (01 January – 31 December 2026):
  * Net STO PPS: $165.00 | Net STO SRS: $80.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
7. SAROVA WOODLANDS HOTEL & SPA (Nakuru Town, Kenya)
Board Basis: Bed & Breakfast (BB)
Room Category: Deluxe City View Room
- Year-Round STO Tariff (01 January – 31 December 2026):
  * Net STO PPS: $140.00 | Net STO SRS: $65.00 | Child: 50% | Min Stay: 1 Night

=======================================================================
EXCURSIONS & ACTIVITIES:
- Sarova Mara Bush Barbecue Dinner: $85.00 per person
- Lion Hill Ridge Sunset Cocktails & Canapés: $55.00 per person
- Hot Air Balloon Safari & Champagne Breakfast (Maasai Mara): $495.00 per person`
  },
  {
    id: 'sample-elewana-2026',
    name: 'Elewana Collection 2026 Confidential STO Agreement',
    provider: 'Elewana Africa Hospitality Group',
    validity: 'Jan 1, 2026 – Dec 31, 2026',
    description: 'Premier portfolio covering Amboseli, Meru National Park, Masai Mara, and Arusha Coffee Lodge with Game Package and Full Board tiers.',
    lodgesCount: 4,
    contractText: `CONFIDENTIAL SPECIAL TOUR OPERATOR (STO) CONTRACT — 2026
TUSAFIRI AFRICA SAFARIS PARTNER AGREEMENT
ISSUING AUTHORITY: Elewana Collection East Africa
CONTRACT REF: ELEWANA-TUSAFIRI-STO-2026
VALIDITY PERIOD: 01 January 2026 to 31 December 2026

RATES ARE IN USD, PER PERSON SHARING (PPS) & SINGLE ROOM SUPPLEMENT (SRS).
ALL RATES SUBJECT TO 16% VAT & APPLICABLE TOURISM LEVIES INCLUDED UNLESS EXPLICITLY NOTED.

=======================================================================
1. ELEWANA TORTILIS CAMP (Amboseli National Park, Kenya)
Board Basis: Game Package (GP) — Includes shared game drives, bush breakfasts, sundowners, soft drinks, beer, house wines & laundry.
Room Category: Luxury Safari Tent

Seasons:
- Low / Green Season (01 April 2026 to 31 May 2026):
  * STO PPS: $620.00
  * STO Single Room Supplement (SRS): $180.00
  * Child Rate (3-11 yrs sharing with 2 adults): 50% of adult PPS
  * Minimum Stay: 1 Night

- Mid / Shoulder Season (05 January to 31 March 2026 & 01 November to 19 December 2026):
  * STO PPS: $810.00
  * STO Single Room Supplement (SRS): $260.00
  * Child Rate: 50%
  * Minimum Stay: 1 Night

- Peak Season (01 June to 31 October 2026 & 20 December to 04 January 2027):
  * STO PPS: $1,150.00
  * STO Single Room Supplement (SRS): $420.00
  * Child Rate: 50%
  * Minimum Stay: 2 Nights

=======================================================================
2. ELEWANA SAND RIVER MASAI MARA (Maasai Mara National Reserve, Kenya)
Board Basis: Game Package (GP) — Includes scheduled game drives in 4x4 open-sided cruisers, bush meals, beverages, and laundry.
Room Category: Luxury Tented Suite

Seasons:
- Low Season (01 April to 31 May 2026):
  * STO PPS: $890.00
  * STO SRS: $290.00
  * Child Rate: 50%
  * Min Stay: 2 Nights

- Mid Season (05 January to 31 March 2026 & 01 November to 19 December 2026):
  * STO PPS: $1,250.00
  * STO SRS: $390.00
  * Child Rate: 50%
  * Min Stay: 2 Nights

- Peak Migration Season (01 July to 31 October 2026 & 20 December to 04 January 2027):
  * STO PPS: $1,850.00
  * STO SRS: $680.00
  * Child Rate: 50%
  * Min Stay: 3 Nights

=======================================================================
3. ELEWANA ARUSHA COFFEE LODGE (Arusha / Mount Meru, Tanzania)
Board Basis: Bed & Breakfast (BB)
Room Category: Plantation Suite

Seasons:
- Year-Round STO Tariff (01 January to 31 December 2026):
  * STO PPS: $290.00
  * STO SRS: $120.00
  * Child Rate: 50%
  * Min Stay: 1 Night
  * Notes: Ideal transit lodge before or after Northern Tanzania circuit safari flights.

=======================================================================
4. ELEWANA SERENGETI PIONEER CAMP (South Central Serengeti, Tanzania)
Board Basis: Game Package (GP)
Room Category: Safari Tented Pavilion

Seasons:
- Low / Green Season (01 April to 31 May 2026):
  * STO PPS: $740.00
  * STO SRS: $240.00
  * Child Rate: 50%
  * Min Stay: 2 Nights

- Shoulder Season (05 January to 31 March 2026 & 01 November to 19 December 2026):
  * STO PPS: $1,050.00
  * STO SRS: $380.00
  * Child Rate: 50%
  * Min Stay: 2 Nights

- Peak Migration & Calving Season (01 July to 31 October 2026 & 20 December to 04 January 2027):
  * STO PPS: $1,620.00
  * STO SRS: $590.00
  * Child Rate: 50%
  * Min Stay: 3 Nights`
  },
  {
    id: 'sample-asilia-2026',
    name: 'Asilia Africa East Africa STO Tariff 2026',
    provider: 'Asilia Africa Wilderness Safaris',
    validity: 'Jan 1, 2026 – Dec 31, 2026',
    description: 'Iconic camps across the Great Migration corridor including Sayari Northern Serengeti, Dunia Central Serengeti, and Rekero Mara.',
    lodgesCount: 3,
    contractText: `CONFIDENTIAL OPERATOR TARIFF 2026 — ASILIA AFRICA
AGREED PARTNER: Tusafiri Africa Safaris
TARIFF CODE: ASILIA-EA-STO-2026
CURRENCY: USD ($) NET CONTRACTED RATES

-------------------------------------------------------------------------
PROPERTY 1: SAYARI CAMP (Northern Serengeti — Mara River Crossing, Tanzania)
Board Basis: Full Board (FB)
Room Type: Classic Tented Suite

Seasons:
- Low Season (01 April to 31 May 2026):
  * Net STO PPS: $820.00 | Net STO SRS: $320.00 | Child: 50% | Min Stay: 2 Nights
- Mid Season (06 January to 31 March 2026 & 01 November to 19 December 2026):
  * Net STO PPS: $1,190.00 | Net STO SRS: $450.00 | Child: 50% | Min Stay: 2 Nights
- High Migration Peak (01 July to 31 October 2026 & 20 December to 05 January 2027):
  * Net STO PPS: $1,780.00 | Net STO SRS: $750.00 | Child: 50% | Min Stay: 3 Nights
  * Inclusions: Gourmet meals, house beverages, bush laundry, emergency medical cover.

-------------------------------------------------------------------------
PROPERTY 2: DUNIA CAMP (Central Serengeti / Seronera, Tanzania)
Board Basis: Full Board (FB) — All-female guide & management camp
Room Type: Safari Tent

Seasons:
- Low Season (01 April to 31 May 2026):
  * Net STO PPS: $690.00 | Net STO SRS: $240.00 | Child: 50% | Min Stay: 1 Night
- Mid Season (06 January to 31 March 2026 & 01 November to 19 December 2026):
  * Net STO PPS: $940.00 | Net STO SRS: $360.00 | Child: 50% | Min Stay: 2 Nights
- Peak Season (01 July to 31 October 2026 & 20 December to 05 January 2027):
  * Net STO PPS: $1,380.00 | Net STO SRS: $540.00 | Child: 50% | Min Stay: 2 Nights

-------------------------------------------------------------------------
PROPERTY 3: REKERO CAMP (Maasai Mara Talek River, Kenya)
Board Basis: Full Board (FB)
Room Type: Luxury Riverfront Tent

Seasons:
- Low Season (01 April to 31 May 2026):
  * Net STO PPS: $780.00 | Net STO SRS: $280.00 | Child: 50% | Min Stay: 2 Nights
- Mid Season (06 January to 31 March 2026 & 01 November to 19 December 2026):
  * Net STO PPS: $1,120.00 | Net STO SRS: $420.00 | Child: 50% | Min Stay: 2 Nights
- Great Migration Peak (01 July to 31 October 2026 & 20 December to 05 January 2027):
  * Net STO PPS: $1,890.00 | Net STO SRS: $780.00 | Child: 50% | Min Stay: 3 Nights`
  },
  {
    id: 'sample-sanctuary-2026',
    name: 'Sanctuary Retreats Confidential Operator Tariff 2026',
    provider: 'Sanctuary Retreats Africa',
    validity: 'Jan 1, 2026 – Dec 31, 2026',
    description: 'High-end luxury tented lodges including Sanctuary Olonana (Mara River) and Sanctuary Ngorongoro Crater Camp.',
    lodgesCount: 2,
    contractText: `SANCTUARY RETREATS — CONFIDENTIAL STO OPERATOR RATES 2026
PREPARED FOR: Tusafiri Africa Safaris Commercial Pricing Desk
CONTRACT PERIOD: 01 Jan 2026 – 31 Dec 2026
CURRENCY: USD ($) NET TO TOUR OPERATOR

1. SANCTUARY OLONANA (Maasai Mara / Mara River, Kenya)
Board Basis: All Inclusive (AI)
Room Type: Luxury Riverfront Suite with Floor-to-Ceiling Glass

- Low Season (01 April to 31 May 2026):
  * STO PPS: $950.00
  * STO SRS: $350.00
  * Child: 50%
  * Min Stay: 1 Night
- Shoulder Season (05 January to 31 March 2026 & 01 November to 20 December 2026):
  * STO PPS: $1,350.00
  * STO SRS: $490.00
  * Child: 50%
  * Min Stay: 2 Nights
- Peak Migration Season (01 July to 31 October 2026 & 21 December to 04 January 2027):
  * STO PPS: $1,990.00
  * STO SRS: $780.00
  * Child: 50%
  * Min Stay: 3 Nights
  * Inclusions: All meals, premium spirits and wines, shared game drives, transfers, laundry.

2. SANCTUARY NGORONGORO CRATER CAMP (Ngorongoro Conservation Area, Tanzania)
Board Basis: Full Board (FB)
Room Type: Classic Tented Suite (Near Crater Rim)

- Low Season (01 April to 31 May 2026):
  * STO PPS: $720.00
  * STO SRS: $260.00
  * Child: 50%
  * Min Stay: 1 Night
- Mid Season (05 January to 31 March 2026 & 01 November to 20 December 2026):
  * STO PPS: $980.00
  * STO SRS: $360.00
  * Child: 50%
  * Min Stay: 1 Night
- Peak Season (01 July to 31 October 2026 & 21 December to 04 January 2027):
  * STO PPS: $1,420.00
  * STO SRS: $520.00
  * Child: 50%
  * Min Stay: 2 Nights`
  },
  {
    id: 'sample-kizingo-2026',
    name: 'Kizingo Lamu Island 2026 FB & Rack Rates Contract',
    provider: 'Kizingo Beach Lodge Ltd (Lamu, Kenya)',
    validity: 'Jan 1, 2026 – Jan 5, 2027',
    description: 'Eco-lodge on Lamu Island beach with Full Board (FB) bandas, dhow sailing activities, coastal marine conservation tariffs, and air transfer options.',
    lodgesCount: 1,
    contractText: `KIZINGO LODGE LAMU — CONFIDENTIAL STO & RACK RATES 2026 FINAL
ISSUING PROPERTY: Kizingo Beach Eco-Lodge, Shela Beach / Lamu Island, Kenya
CONTRACT TITLE: Kizingo FB and Rack Rates 2026 Final
VALIDITY: 01 January 2026 to 05 January 2027
CURRENCY: USD ($) RATES INCLUSIVE OF 16% VAT & 2% CATERING LEVY

=========================================================================
1. ACCOMMODATION: KIZINGO ECO-LODGE (Oceanfront Eco-Banda)
Board Basis: Full Board (FB) — Includes accommodation in luxury open-air eco-bandas, 3 gourmet daily coastal meals, afternoon tea with homemade cakes, mineral drinking water, Wi-Fi, and complimentary use of ocean kayaks & stand-up paddleboards.

RACK & STO TARIFF TIERS:
- Regular / Mid Season: (06 Jan – 31 Mar 2026 | 01 Jul – 31 Aug 2026 | 01 Nov – 19 Dec 2026)
  * Rack Rate: $390.00 PPS
  * Confidential STO Net PPS: $295.00
  * STO Single Room Supplement (SRS): $110.00
  * Child Sharing (5-11 yrs): $147.50 (50% of adult PPS)
  * Infants (0-4 yrs): Free of charge
  * Min Stay: 1 Night

- Low / Green Season: (15 Apr – 30 Jun 2026 | 01 Sep – 31 Oct 2026)
  * Rack Rate: $295.00 PPS
  * Confidential STO Net PPS: $220.00
  * STO Single Room Supplement (SRS): $80.00
  * Child Sharing: $110.00 (50%)
  * Min Stay: 1 Night

- Festive / Peak Season: (20 Dec 2026 – 05 Jan 2027)
  * Rack Rate: $560.00 PPS
  * Confidential STO Net PPS: $420.00
  * STO Single Room Supplement (SRS): $160.00
  * Child Sharing: $210.00 (50%)
  * Min Stay: 3 Nights (Includes Christmas & New Year Eve Gala Celebrations)

=========================================================================
2. ACTIVITIES & COASTAL EXCURSIONS:
- Traditional Swahili Sunset Dhow Cruise: $45.00 per person (Includes fresh Swahili bites & tamarind punch)
- Manda Toto Coral Reef Snorkeling & Seafood BBQ: $85.00 per person (Half day private dhow excursion)
- Historic Lamu Old Town UNESCO World Heritage Guided Walk: $35.00 per person
- Guided Mangrove Channel Kayaking & Birdwatching: $30.00 per person

=========================================================================
3. PARK & CONSERVANCY FEES:
- Lamu Marine Reserve & Shela Dunes Area (KWS Coastal Marine): $35.00 Non-Resident Adult / $25.00 Low Season per day.

=========================================================================
4. FLIGHTS & AIRSTRIP TRANSFERS:
- Safarilink / Fly540 Scheduled Flight: Nairobi Wilson (WIL) to Lamu Manda (LAU): $215.00 per person one-way (15kg baggage).
- Private Speedboat Transfer: Manda Airport Jetty to Kizingo Lodge: Included for bookings of 3+ nights, or $50.00 per boat one-way.`
  }
];
