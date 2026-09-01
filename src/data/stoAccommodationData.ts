import { STOAccommodationProperty } from '../types/costing';

export const STO_ACCOMMODATION_DATABASE: STOAccommodationProperty[] = [
  {
    id: 'prop-kichwa-tembo',
    name: '&Beyond Kichwa Tembo Camp',
    country: 'Kenya',
    region: 'Maasai Mara',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Classic Tent',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'andBeyond_East_Africa_STO_Confidential_Tariff_2026.pdf',
    sourceDate: '2025-11-15',
    status: 'Active',
    seasons: [
      {
        id: 'kt-low',
        seasonName: 'Low Season',
        startDate: '03-01',
        endDate: '05-31',
        description: 'Green Season (March 1 - May 31)',
        ppsUsd: 555.0,
        srsUsd: 277.5,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Includes all meals, soft drinks, house wines, local brand spirits, laundry, emergency evacuation.'
      },
      {
        id: 'kt-mid',
        seasonName: 'Mid Season',
        startDate: '01-04',
        endDate: '02-28',
        description: 'Mid Season (Jan 4 - Feb 28 & Nov 1 - Dec 19)',
        ppsUsd: 555.0,
        srsUsd: 277.5,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'kt-shoulder',
        seasonName: 'Peak Season (June Shoulder)',
        startDate: '06-01',
        endDate: '06-30',
        description: 'June Shoulder Peak (Jun 1 - Jun 30)',
        ppsUsd: 555.0,
        srsUsd: 277.5,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'kt-peak-migration',
        seasonName: 'Peak Migration & Festive',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Great Migration Peak (Jul 1 - Oct 31 & Dec 20 - Jan 3)',
        ppsUsd: 940.0,
        srsUsd: 470.0,
        childRateFactor: 0.5,
        minNights: 3,
        notes: 'Great Migration River Crossings season. High demand period.'
      }
    ]
  },
  {
    id: 'prop-governors-camp',
    name: "Governors' Main Camp",
    country: 'Kenya',
    region: 'Maasai Mara',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Luxury Safari Tent',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Governors_Camp_Collection_STO_2026.pdf',
    sourceDate: '2025-10-20',
    status: 'Active',
    seasons: [
      {
        id: 'gov-green',
        seasonName: 'Green / Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April - May',
        ppsUsd: 480.0,
        srsUsd: 190.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'gov-mid',
        seasonName: 'Regular / Mid Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 - Mar 31 & Nov 1 - Dec 15',
        ppsUsd: 590.0,
        srsUsd: 220.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'gov-peak',
        seasonName: 'High Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31',
        ppsUsd: 860.0,
        srsUsd: 380.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-mara-serena',
    name: 'Mara Serena Safari Lodge',
    country: 'Kenya',
    region: 'Maasai Mara (Mara Triangle)',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Safari Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Serena_Hotels_Kenya_STO_Tariff_2026.xlsx',
    sourceDate: '2025-12-01',
    status: 'Active',
    seasons: [
      {
        id: 'ms-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 240.0,
        srsUsd: 85.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ms-shoulder',
        seasonName: 'Shoulder Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 - Mar 31, June 1 - 30, Nov 1 - Dec 21',
        ppsUsd: 330.0,
        srsUsd: 110.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ms-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 22 - Jan 2',
        ppsUsd: 465.0,
        srsUsd: 160.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-angama-mara',
    name: 'Angama Mara',
    country: 'Kenya',
    region: 'Maasai Mara (Oloololo Escarpment)',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'All Inclusive (AI)',
    roomCategory: 'Tented Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Angama_Mara_Confidential_STO_Tariff_2026.pdf',
    sourceDate: '2025-11-01',
    status: 'Active',
    seasons: [
      {
        id: 'am-low',
        seasonName: 'Standard Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 1250.0,
        srsUsd: 550.0,
        childRateFactor: 0.6,
        minNights: 2
      },
      {
        id: 'am-mid',
        seasonName: 'Mid Season',
        startDate: '01-06',
        endDate: '03-31',
        description: 'Jan 6 - Mar 31 & Nov 1 - Dec 19',
        ppsUsd: 1650.0,
        srsUsd: 750.0,
        childRateFactor: 0.6,
        minNights: 2
      },
      {
        id: 'am-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 20 - Jan 5',
        ppsUsd: 2250.0,
        srsUsd: 980.0,
        childRateFactor: 0.6,
        minNights: 3
      }
    ]
  },
  {
    id: 'prop-amboseli-serena',
    name: 'Amboseli Serena Safari Lodge',
    country: 'Kenya',
    region: 'Amboseli',
    parkOrConservancyId: 'park-amboseli',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Serena_Hotels_Kenya_STO_Tariff_2026.xlsx',
    sourceDate: '2025-12-01',
    status: 'Active',
    seasons: [
      {
        id: 'as-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 195.0,
        srsUsd: 65.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'as-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 - Mar 31, June 1 - 30, Nov 1 - Dec 21',
        ppsUsd: 255.0,
        srsUsd: 85.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'as-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 22 - Jan 2',
        ppsUsd: 340.0,
        srsUsd: 115.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-lake-nakuru-sopa',
    name: 'Lake Nakuru Sopa Lodge',
    country: 'Kenya',
    region: 'Lake Nakuru',
    parkOrConservancyId: 'park-lake-nakuru',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sopa_Lodges_East_Africa_STO_2026.pdf',
    sourceDate: '2025-11-20',
    status: 'Active',
    seasons: [
      {
        id: 'lns-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 160.0,
        srsUsd: 55.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'lns-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 - Mar 31 & Nov 1 - Dec 21',
        ppsUsd: 215.0,
        srsUsd: 70.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'lns-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 22 - Jan 2',
        ppsUsd: 285.0,
        srsUsd: 95.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-four-seasons-serengeti',
    name: 'Four Seasons Safari Lodge Serengeti',
    country: 'Tanzania',
    region: 'Central Serengeti (Seronera)',
    parkOrConservancyId: 'park-serengeti',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Savannah Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Four_Seasons_Serengeti_Confidential_STO_2026.pdf',
    sourceDate: '2025-11-10',
    status: 'Active',
    seasons: [
      {
        id: 'fss-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 850.0,
        srsUsd: 420.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'fss-mid',
        seasonName: 'Shoulder Season',
        startDate: '01-08',
        endDate: '03-31',
        description: 'Jan 8 - Mar 31, June 1 - 30, Nov 1 - Dec 19',
        ppsUsd: 1150.0,
        srsUsd: 580.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'fss-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 20 - Jan 7',
        ppsUsd: 1650.0,
        srsUsd: 820.0,
        childRateFactor: 0.5,
        minNights: 3
      }
    ]
  },
  {
    id: 'prop-ngorongoro-crater-lodge',
    name: '&Beyond Ngorongoro Crater Lodge',
    country: 'Tanzania',
    region: 'Ngorongoro Conservation Area',
    parkOrConservancyId: 'park-ngorongoro',
    boardBasis: 'All Inclusive (AI)',
    roomCategory: 'Crater View Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'andBeyond_East_Africa_STO_Confidential_Tariff_2026.pdf',
    sourceDate: '2025-11-15',
    status: 'Active',
    seasons: [
      {
        id: 'ncl-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 1100.0,
        srsUsd: 550.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'ncl-mid',
        seasonName: 'Mid Season',
        startDate: '01-04',
        endDate: '03-31',
        description: 'Jan 4 - Mar 31, June 1 - 30, Nov 1 - Dec 19',
        ppsUsd: 1450.0,
        srsUsd: 725.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'ncl-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 20 - Jan 3',
        ppsUsd: 1980.0,
        srsUsd: 990.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-ngorongoro-serena',
    name: 'Ngorongoro Serena Safari Lodge',
    country: 'Tanzania',
    region: 'Ngorongoro Rim',
    parkOrConservancyId: 'park-ngorongoro',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Crater Rim Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Serena_Hotels_Tanzania_STO_Tariff_2026.xlsx',
    sourceDate: '2025-12-01',
    status: 'Active',
    seasons: [
      {
        id: 'ns-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 260.0,
        srsUsd: 90.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ns-mid',
        seasonName: 'Shoulder Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 - Mar 31, June 1 - 30, Nov 1 - Dec 21',
        ppsUsd: 360.0,
        srsUsd: 120.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ns-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 22 - Jan 2',
        ppsUsd: 495.0,
        srsUsd: 175.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-tarangire-sopa',
    name: 'Tarangire Sopa Lodge',
    country: 'Tanzania',
    region: 'Tarangire',
    parkOrConservancyId: 'park-tarangire',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sopa_Lodges_East_Africa_STO_2026.pdf',
    sourceDate: '2025-11-20',
    status: 'Active',
    seasons: [
      {
        id: 'ts-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'April 1 - May 31',
        ppsUsd: 175.0,
        srsUsd: 60.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ts-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 - Mar 31 & Nov 1 - Dec 21',
        ppsUsd: 225.0,
        srsUsd: 75.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ts-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'July 1 - October 31 & Dec 22 - Jan 2',
        ppsUsd: 310.0,
        srsUsd: 105.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-eka-nairobi',
    name: 'Eka Hotel Nairobi',
    country: 'Kenya',
    region: 'Nairobi (City/Airport)',
    parkOrConservancyId: 'park-nairobi-city',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Superior Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Eka_Hotel_Corporate_STO_2026.pdf',
    sourceDate: '2025-10-15',
    status: 'Active',
    seasons: [
      {
        id: 'eka-year-round',
        seasonName: 'Year Round STO Rate',
        startDate: '01-01',
        endDate: '12-31',
        description: 'All year standard STO',
        ppsUsd: 110.0,
        srsUsd: 65.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-kizingo-lamu',
    name: 'Kizingo Eco-Lodge (Lamu Island)',
    country: 'Kenya',
    region: 'Lamu Archipelago / Kenya Coast',
    parkOrConservancyId: 'park-lamu-marine',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Oceanfront Eco-Banda',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Kizingo FB and Rack Rates 2026 Final .._.jpg',
    sourceDate: '2026-01-10',
    status: 'Active',
    seasons: [
      {
        id: 'kiz-regular',
        seasonName: 'Regular / Mid Season',
        startDate: '01-06',
        endDate: '03-31',
        description: 'Jan 6 – Mar 31 & Jul 1 – Aug 31 & Nov 1 – Dec 19',
        ppsUsd: 295.0,
        srsUsd: 110.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Full Board (FB): 3 gourmet coastal meals daily, afternoon teas, filtered water, Wi-Fi, kayak & SUP usage.'
      },
      {
        id: 'kiz-green',
        seasonName: 'Green / Low Season',
        startDate: '04-15',
        endDate: '06-30',
        description: 'Apr 15 – Jun 30 & Sep 1 – Oct 31',
        ppsUsd: 220.0,
        srsUsd: 80.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Full Board (FB): Low season rate. Transfers from Manda Airstrip via private boat arranged.'
      },
      {
        id: 'kiz-festive',
        seasonName: 'Peak Festive Season',
        startDate: '12-20',
        endDate: '01-05',
        description: 'Dec 20 – Jan 5 (Christmas & New Year)',
        ppsUsd: 420.0,
        srsUsd: 160.0,
        childRateFactor: 0.5,
        minNights: 3,
        notes: 'Minimum 3 nights. Includes gala dinners, beach barbecue, and champagne celebration.'
      }
    ]
  },
  // SAROVA HOTELS & SAFARI LODGES (2026 STO CONTRACT)
  {
    id: 'prop-sarova-mara',
    name: 'Sarova Mara Game Camp',
    country: 'Kenya',
    region: 'Maasai Mara',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Deluxe Safari Tented Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-mara-low',
        seasonName: 'Green / Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31 (Zero SRS Special)',
        ppsUsd: 235.0,
        srsUsd: 0.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Full Board (FB) with 3 gourmet meals daily, afternoon tea & hospitality. Zero SRS special in low season.'
      },
      {
        id: 'sarova-mara-mid',
        seasonName: 'Mid / Shoulder Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Jun 1 – Jun 30 & Nov 1 – Dec 21',
        ppsUsd: 345.0,
        srsUsd: 110.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-mara-peak',
        seasonName: 'Peak Migration & Festive',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Dec 22 – Jan 2',
        ppsUsd: 495.0,
        srsUsd: 175.0,
        childRateFactor: 0.5,
        minNights: 2,
        notes: 'Great Migration river crossing period. High demand safari window.'
      }
    ]
  },
  {
    id: 'prop-sarova-lion-hill',
    name: 'Sarova Lion Hill Game Lodge',
    country: 'Kenya',
    region: 'Lake Nakuru',
    parkOrConservancyId: 'park-lake-nakuru',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Chalet Room (Lake View)',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-lh-low',
        seasonName: 'Green / Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 195.0,
        srsUsd: 0.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-lh-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Nov 1 – Dec 21',
        ppsUsd: 275.0,
        srsUsd: 85.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-lh-peak',
        seasonName: 'Peak High Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Festive',
        ppsUsd: 385.0,
        srsUsd: 135.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-sarova-shaba',
    name: 'Sarova Shaba Game Lodge',
    country: 'Kenya',
    region: 'Samburu & Shaba',
    parkOrConservancyId: 'park-samburu',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Riverfront Chalet',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-shaba-low',
        seasonName: 'Green Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 175.0,
        srsUsd: 0.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-shaba-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Nov 1 – Dec 21',
        ppsUsd: 245.0,
        srsUsd: 75.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-shaba-peak',
        seasonName: 'Peak High Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Festive',
        ppsUsd: 340.0,
        srsUsd: 115.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-sarova-whitesands',
    name: 'Sarova Whitesands Beach Resort & Spa',
    country: 'Kenya',
    region: 'Mombasa (North Coast)',
    parkOrConservancyId: 'park-mombasa-marine',
    boardBasis: 'Half Board (HB)',
    roomCategory: 'Sea Facing Deluxe Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-ws-low',
        seasonName: 'Green / Low Season',
        startDate: '04-15',
        endDate: '07-14',
        description: 'Apr 15 – Jul 14',
        ppsUsd: 145.0,
        srsUsd: 0.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'sarova-ws-mid',
        seasonName: 'Mid Season',
        startDate: '01-06',
        endDate: '04-14',
        description: 'Jan 6 – Apr 14 & Sep 1 – Dec 19',
        ppsUsd: 215.0,
        srsUsd: 65.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'sarova-ws-peak',
        seasonName: 'Peak Festive & Summer',
        startDate: '07-15',
        endDate: '08-31',
        description: 'Jul 15 – Aug 31 & Dec 20 – Jan 3',
        ppsUsd: 310.0,
        srsUsd: 110.0,
        childRateFactor: 0.5,
        minNights: 3
      }
    ]
  },
  {
    id: 'prop-sarova-stanley',
    name: 'Sarova Stanley Hotel',
    country: 'Kenya',
    region: 'Nairobi (City/Airport)',
    parkOrConservancyId: 'park-nairobi-city',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Deluxe Heritage Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-stanley-yr',
        seasonName: 'Year-Round STO Tariff',
        startDate: '01-01',
        endDate: '12-31',
        description: 'All Year Standard STO Rate',
        ppsUsd: 185.0,
        srsUsd: 95.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Includes breakfast at the historic Thorn Tree Cafe.'
      }
    ]
  },
  {
    id: 'prop-sarova-panafric',
    name: 'Sarova Panafric Hotel',
    country: 'Kenya',
    region: 'Nairobi (City/Airport)',
    parkOrConservancyId: 'park-nairobi-city',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Superior Safari Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-pan-yr',
        seasonName: 'Year-Round STO Tariff',
        startDate: '01-01',
        endDate: '12-31',
        description: 'All Year Standard STO Rate',
        ppsUsd: 165.0,
        srsUsd: 80.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-sarova-woodlands',
    name: 'Sarova Woodlands Hotel & Spa',
    country: 'Kenya',
    region: 'Lake Nakuru',
    parkOrConservancyId: 'park-lake-nakuru',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Deluxe City View Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sarova_Hotels_STO_Tariff_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sarova-wood-yr',
        seasonName: 'Year-Round STO Tariff',
        startDate: '01-01',
        endDate: '12-31',
        description: 'All Year Standard STO Rate',
        ppsUsd: 140.0,
        srsUsd: 65.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },

  // ELEWANA COLLECTION (2026 CONFIDENTIAL STO AGREEMENT)
  {
    id: 'prop-elewana-tortilis',
    name: 'Elewana Tortilis Camp',
    country: 'Kenya',
    region: 'Amboseli',
    parkOrConservancyId: 'park-amboseli',
    boardBasis: 'Game Package (GP)',
    roomCategory: 'Luxury Safari Tent',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'tortilis-low',
        seasonName: 'Low / Green Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 620.0,
        srsUsd: 180.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Game Package (GP): shared game drives in 4x4, bush breakfasts, sundowners, selected house beverages, laundry.'
      },
      {
        id: 'tortilis-mid',
        seasonName: 'Mid / Shoulder Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 – Mar 31 & Nov 1 – Dec 19',
        ppsUsd: 810.0,
        srsUsd: 260.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'tortilis-peak',
        seasonName: 'Peak Season',
        startDate: '06-01',
        endDate: '10-31',
        description: 'Jun 1 – Oct 31 & Dec 20 – Jan 4',
        ppsUsd: 1150.0,
        srsUsd: 420.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-elewana-sand-river',
    name: 'Elewana Sand River Masai Mara',
    country: 'Kenya',
    region: 'Maasai Mara',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Game Package (GP)',
    roomCategory: 'Luxury Tented Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'sand-river-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 890.0,
        srsUsd: 290.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'sand-river-mid',
        seasonName: 'Mid Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 – Mar 31 & Nov 1 – Dec 19',
        ppsUsd: 1250.0,
        srsUsd: 390.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'sand-river-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Dec 20 – Jan 4',
        ppsUsd: 1850.0,
        srsUsd: 680.0,
        childRateFactor: 0.5,
        minNights: 3,
        notes: 'Overlooking Sand River at the Kenya-Tanzania border. Prime migration crossing point.'
      }
    ]
  },
  {
    id: 'prop-elewana-arusha-coffee',
    name: 'Elewana Arusha Coffee Lodge',
    country: 'Tanzania',
    region: 'Arusha / Kilimanjaro',
    parkOrConservancyId: 'park-arusha-national',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Plantation Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'arusha-coffee-yr',
        seasonName: 'Year-Round STO Tariff',
        startDate: '01-01',
        endDate: '12-31',
        description: 'Jan 1 – Dec 31',
        ppsUsd: 290.0,
        srsUsd: 120.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: 'Ideal luxury transit lodge before or after Northern Tanzania circuit safari flights.'
      }
    ]
  },
  {
    id: 'prop-elewana-serengeti-pioneer',
    name: 'Elewana Serengeti Pioneer Camp',
    country: 'Tanzania',
    region: 'Serengeti',
    parkOrConservancyId: 'park-serengeti',
    boardBasis: 'Game Package (GP)',
    roomCategory: 'Safari Tented Pavilion',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'serengeti-pioneer-low',
        seasonName: 'Low / Green Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 740.0,
        srsUsd: 240.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'serengeti-pioneer-mid',
        seasonName: 'Mid Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 – Mar 31 & Nov 1 – Dec 19',
        ppsUsd: 1050.0,
        srsUsd: 340.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'serengeti-pioneer-peak',
        seasonName: 'Peak Migration Season',
        startDate: '06-01',
        endDate: '10-31',
        description: 'Jun 1 – Oct 31 & Dec 20 – Jan 4',
        ppsUsd: 1590.0,
        srsUsd: 580.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-elewana-elsas-kopje',
    name: "Elewana Elsa's Kopje",
    country: 'Kenya',
    region: 'Meru National Park',
    parkOrConservancyId: 'park-meru',
    boardBasis: 'Game Package (GP)',
    roomCategory: 'Luxury Cottage',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'elsas-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 680.0,
        srsUsd: 210.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'elsas-mid',
        seasonName: 'Mid Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 – Mar 31 & Nov 1 – Dec 19',
        ppsUsd: 920.0,
        srsUsd: 310.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'elsas-peak',
        seasonName: 'Peak Season',
        startDate: '06-01',
        endDate: '10-31',
        description: 'Jun 1 – Oct 31 & Festive',
        ppsUsd: 1340.0,
        srsUsd: 490.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-elewana-kilindi',
    name: 'Elewana Kilindi Zanzibar',
    country: 'Tanzania',
    region: 'Zanzibar (North Coast)',
    parkOrConservancyId: 'park-zanzibar-marine',
    boardBasis: 'All Inclusive (AI)',
    roomCategory: 'Luxury Pavilion Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Elewana_Collection_East_Africa_STO_2026.pdf',
    sourceDate: '2026-01-01',
    status: 'Active',
    seasons: [
      {
        id: 'kilindi-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 750.0,
        srsUsd: 250.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'kilindi-mid',
        seasonName: 'Mid Season',
        startDate: '01-06',
        endDate: '03-31',
        description: 'Jan 6 – Mar 31 & Jun 1 – Jun 30 & Sep 1 – Dec 19',
        ppsUsd: 980.0,
        srsUsd: 350.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'kilindi-peak',
        seasonName: 'Peak Season',
        startDate: '07-01',
        endDate: '08-31',
        description: 'Jul 1 – Aug 31 & Dec 20 – Jan 5',
        ppsUsd: 1480.0,
        srsUsd: 520.0,
        childRateFactor: 0.5,
        minNights: 3
      }
    ]
  },

  // ADDITIONAL EAST AFRICAN PREMIER SAFARI PORTFOLIO
  {
    id: 'prop-serengeti-serena',
    name: 'Serengeti Serena Safari Lodge',
    country: 'Tanzania',
    region: 'Serengeti',
    parkOrConservancyId: 'park-serengeti',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Safari Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Serena_Hotels_Tanzania_STO_2026.pdf',
    sourceDate: '2025-11-15',
    status: 'Active',
    seasons: [
      {
        id: 'ser-serengeti-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 280.0,
        srsUsd: 80.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ser-serengeti-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Nov 1 – Dec 21',
        ppsUsd: 395.0,
        srsUsd: 120.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ser-serengeti-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Dec 22 – Jan 2',
        ppsUsd: 550.0,
        srsUsd: 195.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-lake-manyara-serena',
    name: 'Lake Manyara Serena Safari Lodge',
    country: 'Tanzania',
    region: 'Lake Manyara',
    parkOrConservancyId: 'park-lake-manyara',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Safari Room',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Serena_Hotels_Tanzania_STO_2026.pdf',
    sourceDate: '2025-11-15',
    status: 'Active',
    seasons: [
      {
        id: 'ser-manyara-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 210.0,
        srsUsd: 65.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ser-manyara-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Nov 1 – Dec 21',
        ppsUsd: 295.0,
        srsUsd: 90.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'ser-manyara-peak',
        seasonName: 'Peak High Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Dec 22 – Jan 2',
        ppsUsd: 395.0,
        srsUsd: 130.0,
        childRateFactor: 0.5,
        minNights: 1
      }
    ]
  },
  {
    id: 'prop-serengeti-sopa',
    name: 'Serengeti Sopa Lodge',
    country: 'Tanzania',
    region: 'Serengeti',
    parkOrConservancyId: 'park-serengeti',
    boardBasis: 'Full Board (FB)',
    roomCategory: 'Standard Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sopa_Lodges_East_Africa_STO_2026.pdf',
    sourceDate: '2025-11-20',
    status: 'Active',
    seasons: [
      {
        id: 'serengeti-sopa-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 220.0,
        srsUsd: 70.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'serengeti-sopa-mid',
        seasonName: 'Mid Season',
        startDate: '01-03',
        endDate: '03-31',
        description: 'Jan 3 – Mar 31 & Nov 1 – Dec 21',
        ppsUsd: 295.0,
        srsUsd: 95.0,
        childRateFactor: 0.5,
        minNights: 1
      },
      {
        id: 'serengeti-sopa-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Festive',
        ppsUsd: 410.0,
        srsUsd: 140.0,
        childRateFactor: 0.5,
        minNights: 2
      }
    ]
  },
  {
    id: 'prop-sanctuary-olonana',
    name: 'Sanctuary Olonana',
    country: 'Kenya',
    region: 'Maasai Mara',
    parkOrConservancyId: 'park-maasai-mara',
    boardBasis: 'Game Package (GP)',
    roomCategory: 'Luxury Glass Suite',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Sanctuary_Retreats_STO_2026.pdf',
    sourceDate: '2025-12-01',
    status: 'Active',
    seasons: [
      {
        id: 'olonana-low',
        seasonName: 'Low Season',
        startDate: '04-01',
        endDate: '05-31',
        description: 'Apr 1 – May 31',
        ppsUsd: 850.0,
        srsUsd: 250.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'olonana-mid',
        seasonName: 'Mid Season',
        startDate: '01-05',
        endDate: '03-31',
        description: 'Jan 5 – Mar 31 & Jun 1 – Jun 30 & Nov 1 – Dec 19',
        ppsUsd: 1200.0,
        srsUsd: 400.0,
        childRateFactor: 0.5,
        minNights: 2
      },
      {
        id: 'olonana-peak',
        seasonName: 'Peak Migration Season',
        startDate: '07-01',
        endDate: '10-31',
        description: 'Jul 1 – Oct 31 & Dec 20 – Jan 4',
        ppsUsd: 1890.0,
        srsUsd: 650.0,
        childRateFactor: 0.5,
        minNights: 3,
        notes: 'Perched on the private bank of the Mara River with floor-to-ceiling glass riverfront suites.'
      }
    ]
  },
  {
    id: 'prop-hemingways-nairobi',
    name: 'Hemingways Nairobi',
    country: 'Kenya',
    region: 'Nairobi (City/Airport)',
    parkOrConservancyId: 'park-nairobi-city',
    boardBasis: 'Bed & Breakfast (BB)',
    roomCategory: 'Deluxe Suite with Butler Service',
    validityYear: 2026,
    sourceType: 'STO Rate Contract 2026',
    sourceDocument: 'Hemingways_Collection_STO_2026.pdf',
    sourceDate: '2025-10-01',
    status: 'Active',
    seasons: [
      {
        id: 'hemingways-yr',
        seasonName: 'Year-Round STO Tariff',
        startDate: '01-01',
        endDate: '12-31',
        description: 'All Year Standard STO',
        ppsUsd: 380.0,
        srsUsd: 190.0,
        childRateFactor: 0.5,
        minNights: 1,
        notes: '5-star boutique hotel in Karen with dedicated personal butler service and views of Ngong Hills.'
      }
    ]
  }
];
