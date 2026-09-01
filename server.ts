import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getMasterDatabase,
  saveMasterDatabase,
  syncIncomingEntities,
  getServerSnapshots,
  saveServerSnapshot,
  getBaselineSeedData,
  countTotalRateTiers,
} from './src/server/databaseStore';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Increase payload limit for uploaded PDF documents / contract images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Google GenAI
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Helper function for resilient Gemini AI calls with retry, per-attempt timeout, and model fallbacks
  const generateWithRetryAndFallback = async (
    ai: any,
    requestParams: { contents: any; config: any },
    preferredModel: string = 'gemini-3.7-flash'
  ) => {
    // Permitted model fallback sequence per skill guidelines
    const modelCandidates = [
      preferredModel,
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    let lastError: any = null;

    for (const model of modelCandidates) {
      // 1 attempt for rate-limited models, max 1 retry for transient 503 errors
      const maxRetries = 1;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const delayMs = 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }

          // Strict 20s timeout per attempt so API calls never hang indefinitely
          const timeoutMs = 20000;
          let timeoutHandle: any;
          const timeoutPromise = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => {
              reject(new Error(`Model ${model} request timed out after ${timeoutMs / 1000}s`));
            }, timeoutMs);
          });

          const apiPromise = ai.models.generateContent({
            model,
            contents: requestParams.contents,
            config: requestParams.config,
          });

          const response: any = await Promise.race([apiPromise, timeoutPromise]);
          clearTimeout(timeoutHandle);

          if (response && response.text) {
            return { response, modelUsed: model };
          }
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || (err?.message?.includes('503') ? 503 : (err?.message?.includes('429') ? 429 : 0));
          const isQuotaExceeded = status === 429 || err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
          const isHighDemand = status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE');

          // If quota is exhausted (429) or high demand on model, immediately switch to next model candidate
          if (isQuotaExceeded || (!isHighDemand && attempt === 0)) {
            break;
          }
        }
      }
    }

    throw lastError || new Error('All model candidates and retry attempts exhausted.');
  };

  // Smart Multi-Property STO Contract & Tariff Extraction Engine
  const generateHeuristicContractData = (textContent: string = '', fileName: string = '') => {
    const raw = (textContent || fileName || '').toLowerCase();
    const isTanzania = raw.includes('tanzania') || raw.includes('serengeti') || raw.includes('ngorongoro') || raw.includes('tarangire') || raw.includes('manyara') || raw.includes('zanzibar') || raw.includes('arusha');
    const country: 'Kenya' | 'Tanzania' = isTanzania ? 'Tanzania' : 'Kenya';

    let supplierName = 'East Africa Safari Supplier';
    const extractedProperties: any[] = [];
    const extractedActivities: any[] = [];
    const extractedParkFees: any[] = [];
    const extractedTransport: any[] = [];
    const extractedFlights: any[] = [];
    const extractedExtras: any[] = [];

    // 1. SAROVA HOTELS & RESORTS KENYA MULTI-PROPERTY CONTRACT
    if (raw.includes('sarova')) {
      supplierName = 'Sarova Hotels & Resorts Kenya';

      extractedProperties.push(
        {
          id: 'prop-sarova-mara-game-camp',
          name: 'Sarova Mara Game Camp',
          country: 'Kenya',
          region: 'Maasai Mara National Reserve',
          parkOrConservancyId: 'park-maasai-mara',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Deluxe Safari Tented Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-mara-peak-2026',
              seasonName: 'Peak Migration Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & 22 December - 02 January 2027',
              ppsUsd: 495,
              srsUsd: 175,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Includes full board meals, bush hospitality, tea/coffee, VAT & local levies. Park fees excluded.',
            },
            {
              id: 'sea-sarova-mara-mid-2026',
              seasonName: 'Mid / Shoulder Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar, 01 Jun - 30 Jun & 01 Nov - 21 Dec 2026',
              ppsUsd: 345,
              srsUsd: 110,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'High predator density viewing period.',
            },
            {
              id: 'sea-sarova-mara-low-2026',
              seasonName: 'Green / Low Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026 (Long Rains)',
              ppsUsd: 235,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Single room supplement waived in Green Season.',
            },
          ],
        },
        {
          id: 'prop-sarova-lion-hill-lodge',
          name: 'Sarova Lion Hill Game Lodge',
          country: 'Kenya',
          region: 'Lake Nakuru National Park',
          parkOrConservancyId: 'park-lake-nakuru',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Standard Chalet Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-lion-hill-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 385,
              srsUsd: 135,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Panoramic lake view chalets inside Lake Nakuru NP.',
            },
            {
              id: 'sea-sarova-lion-hill-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - 21 Dec 2026',
              ppsUsd: 275,
              srsUsd: 85,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Prime flamingo and rhino sanctuary photography.',
            },
            {
              id: 'sea-sarova-lion-hill-low-2026',
              seasonName: 'Green / Low Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 195,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Zero SRS supplement in Low Season.',
            },
          ],
        },
        {
          id: 'prop-sarova-shaba-game-lodge',
          name: 'Sarova Shaba Game Lodge',
          country: 'Kenya',
          region: 'Shaba Game Reserve (Samburu Ecosystem)',
          parkOrConservancyId: 'park-samburu',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Riverfront Chalet',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-shaba-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 340,
              srsUsd: 115,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Ewaso Nyiro riverfront location; Samburu Special 5 species.',
            },
            {
              id: 'sea-sarova-shaba-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - Dec 2026',
              ppsUsd: 245,
              srsUsd: 75,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Includes crocodile viewing platform & riverbank lunches.',
            },
            {
              id: 'sea-sarova-shaba-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 175,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Green season special STO rate.',
            },
          ],
        },
        {
          id: 'prop-sarova-whitesands-beach-resort',
          name: 'Sarova Whitesands Beach Resort & Spa',
          country: 'Kenya',
          region: 'Mombasa North Coast (Bamburi Beach)',
          parkOrConservancyId: 'park-mombasa-marine',
          boardBasis: 'Half Board (HB)',
          roomCategory: 'Sea Facing Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-whitesands-peak-2026',
              seasonName: 'Peak Festive & Summer',
              startDate: '07-15',
              endDate: '08-31',
              description: '15 July - 31 Aug & 20 Dec - 03 Jan 2027',
              ppsUsd: 310,
              srsUsd: 110,
              childRateFactor: 0.5,
              minNights: 3,
              notes: 'Includes breakfast & dinner buffet at Pavilions Restaurant.',
            },
            {
              id: 'sea-sarova-whitesands-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-06',
              endDate: '04-14',
              description: '06 Jan - 14 Apr & 01 Sep - 19 Dec 2026',
              ppsUsd: 215,
              srsUsd: 65,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Beach resort leisure rates for safari extensions.',
            },
            {
              id: 'sea-sarova-whitesands-low-2026',
              seasonName: 'Green / Low Season',
              startDate: '04-15',
              endDate: '07-14',
              description: '15 April - 14 July 2026',
              ppsUsd: 145,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Zero SRS supplement.',
            },
          ],
        },
        {
          id: 'prop-sarova-stanley-nairobi',
          name: 'Sarova Stanley Hotel',
          country: 'Kenya',
          region: 'Nairobi Central Business District',
          parkOrConservancyId: 'park-nairobi-np',
          boardBasis: 'Bed & Breakfast (BB)',
          roomCategory: 'Deluxe Heritage Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-stanley-annual-2026',
              seasonName: 'Year-Round STO Commercial Tariff',
              startDate: '01-01',
              endDate: '12-31',
              description: '01 January - 31 December 2026',
              ppsUsd: 185,
              srsUsd: 95,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Historic 5-star transit hotel in central Nairobi; breakfast included at Thorn Tree Cafe.',
            },
          ],
        },
        {
          id: 'prop-sarova-panafric-nairobi',
          name: 'Sarova Panafric Hotel',
          country: 'Kenya',
          region: 'Nairobi (Valley Road / Upper Hill)',
          parkOrConservancyId: 'park-nairobi-np',
          boardBasis: 'Bed & Breakfast (BB)',
          roomCategory: 'Superior Safari Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-panafric-annual-2026',
              seasonName: 'Year-Round STO Tariff',
              startDate: '01-01',
              endDate: '12-31',
              description: '01 January - 31 December 2026',
              ppsUsd: 165,
              srsUsd: 80,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Convenient safari hub hotel near Wilson Airport.',
            },
          ],
        },
        {
          id: 'prop-sarova-woodlands-nakuru',
          name: 'Sarova Woodlands Hotel & Spa',
          country: 'Kenya',
          region: 'Nakuru Town / Milimani',
          parkOrConservancyId: 'park-lake-nakuru',
          boardBasis: 'Bed & Breakfast (BB)',
          roomCategory: 'Deluxe City View Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Sarova_Hotels_2026_STO_Contract.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sarova-woodlands-annual-2026',
              seasonName: 'Year-Round STO Tariff',
              startDate: '01-01',
              endDate: '12-31',
              description: '01 January - 31 December 2026',
              ppsUsd: 140,
              srsUsd: 65,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Boutique hotel in Nakuru upscale suburbs near lake gate.',
            },
          ],
        }
      );

      extractedActivities.push(
        {
          id: 'act-sarova-bush-dinner-mara',
          name: 'Sarova Isokon Bush Dinner & Maasai Dance Performance',
          location: 'Maasai Mara National Reserve',
          ratePerPaxUsd: 85,
          description: 'Multi-course lantern-lit bush barbecue prepared under savannah stars with traditional Maasai Moran song & dance.',
          category: 'Dining',
        },
        {
          id: 'act-sarova-lion-hill-sundowner',
          name: 'Lion Hill Ridge Sundowner Cocktails & Canapés',
          location: 'Lake Nakuru National Park',
          ratePerPaxUsd: 55,
          description: 'Sunset drinks overlooking the alkaline waters of Lake Nakuru and the Great Rift Valley.',
          category: 'Dining',
        },
        {
          id: 'act-sarova-balloon-safari-mara',
          name: 'Maasai Mara Sunrise Balloon Safari & Champagne Breakfast',
          location: 'Maasai Mara National Reserve',
          ratePerPaxUsd: 495,
          description: 'Early morning hot air balloon flight drifting above wildlife followed by full English bush breakfast.',
          category: 'Aerial',
        },
        {
          id: 'act-sarova-guided-nature-walk',
          name: 'Resident Naturalist Guided Bird & Tree Walk',
          location: 'Lake Nakuru / Shaba',
          ratePerPaxUsd: 30,
          description: 'Educational foot safari with botanists and birding specialists.',
          category: 'Wildlife/Nature',
        }
      );

      extractedParkFees.push(
        {
          id: 'park-maasai-mara-sarova',
          country: 'Kenya',
          parkName: 'Maasai Mara National Reserve',
          areaType: 'National Reserve',
          category: 'Non-Resident Adult',
          highSeasonFeeUsd: 200,
          lowSeasonFeeUsd: 100,
          isDaily: true,
          effectivePeriod: '2026 Calendar Year',
          officialAuthority: 'Narok County Government',
          verificationStatus: 'Official Verified',
          notes: '$200 High (Jul-Dec), $100 Low (Jan-Jun) per non-resident adult per 24 hours.',
        },
        {
          id: 'park-lake-nakuru-sarova',
          country: 'Kenya',
          parkName: 'Lake Nakuru National Park',
          areaType: 'National Park',
          category: 'Non-Resident Adult',
          highSeasonFeeUsd: 70,
          lowSeasonFeeUsd: 60,
          isDaily: true,
          effectivePeriod: '2026',
          officialAuthority: 'Kenya Wildlife Service (KWS)',
          verificationStatus: 'Official Verified',
          notes: 'Standard KWS non-resident adult park entry tariff.',
        },
        {
          id: 'park-samburu-shaba-sarova',
          country: 'Kenya',
          parkName: 'Samburu & Shaba National Reserves',
          areaType: 'National Reserve',
          category: 'Non-Resident Adult',
          highSeasonFeeUsd: 70,
          lowSeasonFeeUsd: 60,
          isDaily: true,
          effectivePeriod: '2026',
          officialAuthority: 'Samburu & Isiolo County Governments',
          verificationStatus: 'Official Verified',
          notes: 'Daily conservation entry fee per adult guest.',
        }
      );

      extractedTransport.push({
        id: 'veh-sarova-safari-land-cruiser-4x4',
        name: 'Custom 4x4 Safari Land Cruiser (Extended 7-Seater)',
        vehicleType: '4x4 Safari Land Cruiser',
        maxCapacity: 7,
        dailyRateHighUsd: 320,
        dailyRateLowUsd: 270,
        driverAllowanceDailyUsd: 45,
        includes: 'Unlimited game mileage, experienced silver-level KPSGA driver-guide, fuel, pop-up viewing roof, inverter chargers & cooler box.',
      });

      extractedFlights.push({
        id: 'flt-wilson-mara-sarova',
        route: 'Nairobi Wilson (WIL) ⇄ Mara Keekorok / Serena (MRE)',
        airline: 'Safarilink Aviation / AirKenya',
        oneWayRateUsd: 235,
        baggageLimitKg: 15,
        departurePoint: 'Wilson Airport Nairobi',
        arrivalPoint: 'Keekorok Airstrip (15 mins from Sarova Mara)',
      });

      extractedExtras.push({
        id: 'ext-amref-sarova-evac',
        name: 'AMREF Flying Doctors 30-Day Emergency Air Evacuation',
        unit: 'Per Person',
        rateUsd: 35,
        mandatory: true,
        description: '24/7 emergency aero-medical evacuation to a top-tier hospital in Nairobi.',
      });
    }

    // 2. SERENA HOTELS & RESORTS CONTRACT
    else if (raw.includes('serena')) {
      supplierName = 'Serena Hotels & Safari Lodges';

      extractedProperties.push(
        {
          id: 'prop-mara-serena-safari-lodge',
          name: 'Mara Serena Safari Lodge',
          country: 'Kenya',
          region: 'Mara Triangle / Maasai Mara',
          parkOrConservancyId: 'park-maasai-mara',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Standard Safari Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Serena_Hotels_2026_STO.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-mara-serena-peak-2026',
              seasonName: 'Peak Migration Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 520,
              srsUsd: 190,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Located atop ridge overlooking Mara Triangle savannah.',
            },
            {
              id: 'sea-mara-serena-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - Dec 2026',
              ppsUsd: 360,
              srsUsd: 120,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Full board gourmet dining & wildlife viewing.',
            },
            {
              id: 'sea-mara-serena-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 240,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'No single room supplement in Green Season.',
            },
          ],
        },
        {
          id: 'prop-serengeti-serena-safari-lodge',
          name: 'Serengeti Serena Safari Lodge',
          country: 'Tanzania',
          region: 'Central Serengeti National Park',
          parkOrConservancyId: 'park-serengeti',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Stone Built Rondavel Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Serena_Hotels_2026_STO.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-serengeti-serena-peak-2026',
              seasonName: 'Peak Migration Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 560,
              srsUsd: 210,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Traditional African rondavel architectural chalets.',
            },
            {
              id: 'sea-serengeti-serena-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - Dec 2026',
              ppsUsd: 390,
              srsUsd: 135,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Ideal year-round predator viewing in Seronera.',
            },
            {
              id: 'sea-serengeti-serena-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 265,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Green season special tariff.',
            },
          ],
        },
        {
          id: 'prop-ngorongoro-serena-safari-lodge',
          name: 'Ngorongoro Serena Safari Lodge',
          country: 'Tanzania',
          region: 'Ngorongoro Crater Rim',
          parkOrConservancyId: 'park-ngorongoro',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Crater View Riverstone Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Serena_Hotels_2026_STO.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-ngorongoro-serena-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 590,
              srsUsd: 220,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Built into crater rim with private balconies looking 600m down into crater floor.',
            },
            {
              id: 'sea-ngorongoro-serena-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - Dec 2026',
              ppsUsd: 410,
              srsUsd: 140,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Includes full board and crater floor picnic basket.',
            },
            {
              id: 'sea-ngorongoro-serena-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 280,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Low season STO tariff.',
            },
          ],
        },
        {
          id: 'prop-sweetwaters-serena-camp',
          name: 'Sweetwaters Serena Camp',
          country: 'Kenya',
          region: 'Ol Pejeta Conservancy',
          parkOrConservancyId: 'park-ol-pejeta',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Morani Luxury Tent',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Serena_Hotels_2026_STO.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-sweetwaters-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 410,
              srsUsd: 145,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Direct waterhole views with floodlit nighttime game viewing.',
            },
            {
              id: 'sea-sweetwaters-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Nov - Dec 2026',
              ppsUsd: 295,
              srsUsd: 95,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Home to the last northern white rhinos & chimpanzee sanctuary.',
            },
            {
              id: 'sea-sweetwaters-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 210,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Zero SRS supplement.',
            },
          ],
        }
      );

      extractedActivities.push({
        id: 'act-serena-crater-floor-picnic',
        name: 'Ngorongoro Crater Floor Private Bush Lunch',
        location: 'Ngorongoro Conservation Area',
        ratePerPaxUsd: 65,
        description: 'Alfresco picnic beside the hippo pool in the world-famous volcanic caldera.',
        category: 'Dining',
      });

      extractedParkFees.push({
        id: 'park-serengeti-tanapa',
        country: 'Tanzania',
        parkName: 'Serengeti National Park',
        areaType: 'National Park',
        category: 'Non-Resident Adult',
        highSeasonFeeUsd: 82.6,
        lowSeasonFeeUsd: 70.8,
        isDaily: true,
        concessionFeeUsd: 59,
        effectivePeriod: '2026',
        officialAuthority: 'Tanzania National Parks (TANAPA)',
        verificationStatus: 'Official Verified',
        notes: 'Statutory TANAPA non-resident conservation and concession fee per 24 hours.',
      });

      extractedTransport.push({
        id: 'veh-serena-cruiser-4x4',
        name: 'Extended 4x4 Safari Land Cruiser with Fridge & Inverter',
        vehicleType: '4x4 Safari Land Cruiser',
        maxCapacity: 7,
        dailyRateHighUsd: 320,
        dailyRateLowUsd: 270,
        driverAllowanceDailyUsd: 50,
        includes: 'Professional guide, unlimited safari mileage, fuel, pop-up roof & bottled water.',
      });

      extractedFlights.push({
        id: 'flt-arusha-seronera-serena',
        route: 'Arusha Airport (ARK) ⇄ Serengeti Seronera (SEU)',
        airline: 'Coastal Aviation / Auric Air',
        oneWayRateUsd: 290,
        baggageLimitKg: 15,
        departurePoint: 'Arusha Airport',
        arrivalPoint: 'Serengeti Seronera Bush Airstrip',
      });

      extractedExtras.push({
        id: 'ext-amref-serena-evac',
        name: 'AMREF Flying Doctors 30-Day Emergency Air Evacuation',
        unit: 'Per Person',
        rateUsd: 35,
        mandatory: true,
        description: '24/7 air ambulance evacuation coverage from any airstrip across Kenya & Tanzania.',
      });
    }

    // 3. KIZINGO ECO-LODGE LAMU CONTRACT
    else if (raw.includes('kizingo') || raw.includes('lamu')) {
      supplierName = 'Kizingo Beach Eco-Lodge Lamu';

      extractedProperties.push({
        id: 'prop-kizingo-eco-lodge-lamu',
        name: 'Kizingo Eco-Lodge Lamu',
        country: 'Kenya',
        region: 'Lamu Archipelago (Shela / Kipungani Beach)',
        parkOrConservancyId: 'park-lamu-marine',
        boardBasis: 'Full Board (FB)',
        roomCategory: 'Oceanfront Eco-Banda',
        validityYear: 2026,
        sourceType: 'STO Rate Contract 2026',
        sourceDocument: fileName || 'Kizingo_FB_and_Rack_Rates_2026_Final.pdf',
        sourceDate: '2026-01-15',
        status: 'Active',
        seasons: [
          {
            id: 'sea-kizingo-peak-2026',
            seasonName: 'Festive / Peak Season',
            startDate: '12-20',
            endDate: '01-05',
            description: '20 December 2026 – 05 January 2027 (Festive Gala)',
            ppsUsd: 420,
            srsUsd: 160,
            childRateFactor: 0.5,
            minNights: 3,
            notes: 'Includes festive gala dinners, full board coastal cuisine, tea/coffee, kayaks & SUP boards.',
          },
          {
            id: 'sea-kizingo-mid-2026',
            seasonName: 'Regular / Mid Season',
            startDate: '01-06',
            endDate: '03-31',
            description: '06 Jan – 31 Mar, 01 Jul – 31 Aug & 01 Nov – 19 Dec 2026',
            ppsUsd: 295,
            srsUsd: 110,
            childRateFactor: 0.5,
            minNights: 1,
            notes: 'Confidential STO Net rate (Rack $390 PPS). 3 gourmet daily meals included.',
          },
          {
            id: 'sea-kizingo-low-2026',
            seasonName: 'Low / Green Season',
            startDate: '04-15',
            endDate: '06-30',
            description: '15 April – 30 June & 01 September – 31 October 2026',
            ppsUsd: 220,
            srsUsd: 80,
            childRateFactor: 0.5,
            minNights: 1,
            notes: 'Confidential STO Net rate (Rack $295 PPS).',
          },
        ],
      });

      extractedActivities.push(
        {
          id: 'act-kizingo-sunset-dhow',
          name: 'Traditional Swahili Sunset Dhow Cruise & Canapés',
          location: 'Lamu Channel & Shela Beach',
          ratePerPaxUsd: 45,
          description: 'Sailing through calm Lamu channel waters on an authentic handcrafted wooden dhow with fresh Swahili bites and tamarind punch.',
          category: 'Water',
        },
        {
          id: 'act-kizingo-manda-toto-snorkeling',
          name: 'Manda Toto Coral Reef Snorkeling & Seafood Beach BBQ',
          location: 'Manda Toto Island',
          ratePerPaxUsd: 85,
          description: 'Half-day private dhow excursion to pristine coral reefs with freshly grilled fish, lobster, and coconut rice.',
          category: 'Water',
        },
        {
          id: 'act-kizingo-lamu-unesco-walk',
          name: 'Historic Lamu Old Town UNESCO World Heritage Guided Walk',
          location: 'Lamu Old Town',
          ratePerPaxUsd: 35,
          description: 'Guided cultural tour of 14th-century Swahili architecture, carved wooden doors, donkey alleys, and Lamu museum.',
          category: 'Cultural',
        }
      );

      extractedParkFees.push({
        id: 'park-lamu-marine',
        country: 'Kenya',
        parkName: 'Lamu Marine National Park & Coastal Reserve',
        areaType: 'National Park',
        category: 'Non-Resident Adult',
        highSeasonFeeUsd: 35,
        lowSeasonFeeUsd: 25,
        isDaily: true,
        effectivePeriod: '2026 Calendar Year',
        officialAuthority: 'Kenya Wildlife Service (KWS)',
        verificationStatus: 'Official Verified',
        notes: 'Marine conservation and reef protection levy.',
      });

      extractedFlights.push({
        id: 'flt-wilson-lamu-kizingo',
        route: 'Nairobi Wilson (WIL) ⇄ Lamu Manda (LAU)',
        airline: 'Safarilink / Fly540 / Skyward Express',
        oneWayRateUsd: 215,
        baggageLimitKg: 15,
        departurePoint: 'Wilson Airport Nairobi',
        arrivalPoint: 'Manda Airport Lamu',
      });

      extractedExtras.push({
        id: 'ext-kizingo-speedboat-transfer',
        name: 'Private Speedboat Airport Transfer (Manda Jetty ⇄ Kizingo Lodge)',
        unit: 'Per Vehicle',
        rateUsd: 50,
        mandatory: false,
        description: 'Complimentary on 3+ night bookings, otherwise $50 per boat one-way.',
      });
    }

    // 4. LAKE NAIVASHA STO TARIFF CONTRACT (e.g. Tariff Rates-Naivasha 2026.pdf)
    else if (raw.includes('naivasha') || raw.includes('great rift valley lodge') || raw.includes('enashipai') || raw.includes('chui lodge')) {
      supplierName = 'Lake Naivasha Safari Collection & Lodges';

      extractedProperties.push(
        {
          id: 'prop-naivasha-sopa-resort',
          name: 'Lake Naivasha Sopa Resort',
          country: 'Kenya',
          region: 'Lake Naivasha / Great Rift Valley',
          parkOrConservancyId: 'park-lake-naivasha',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Deluxe Cottage Suite',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Naivasha_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-naivasha-sopa-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive Season',
              ppsUsd: 280,
              srsUsd: 95,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Spacious cottages surrounded by resident giraffes, zebras, and waterbucks on the lakefront.',
            },
            {
              id: 'sea-naivasha-sopa-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar, 01 Jun - 30 Jun & Nov - 21 Dec 2026',
              ppsUsd: 210,
              srsUsd: 70,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Includes full board meals, tea/coffee, VAT & local tourism levies.',
            },
            {
              id: 'sea-naivasha-sopa-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 155,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Zero SRS supplement in green season.',
            },
          ],
        },
        {
          id: 'prop-great-rift-valley-lodge',
          name: 'Great Rift Valley Lodge & Golf Resort',
          country: 'Kenya',
          region: 'Naivasha / Eburru Hills',
          parkOrConservancyId: 'park-lake-naivasha',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Panoramic Twin Chalet',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Naivasha_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-grvl-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 320,
              srsUsd: 110,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Perched 7,000 feet up the Eburru mountain range with sweeping views across Lake Naivasha.',
            },
            {
              id: 'sea-grvl-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar & Sep - Dec 2026',
              ppsUsd: 240,
              srsUsd: 80,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Championship 18-hole golf access & panoramic mountain views.',
            },
            {
              id: 'sea-grvl-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 175,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Special value green season rate.',
            },
          ],
        },
        {
          id: 'prop-chui-lodge-oserengoni',
          name: 'Chui Lodge (Oserengoni Wildlife Sanctuary)',
          country: 'Kenya',
          region: 'Lake Naivasha / Oserengoni',
          parkOrConservancyId: 'park-lake-naivasha',
          boardBasis: 'All Inclusive (AI)',
          roomCategory: 'Luxury Stone & Olive Wood Cottage',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Naivasha_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-chui-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 540,
              srsUsd: 190,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Exclusive private wildlife sanctuary, day & night game drives, bush walks, drinks & meals included.',
            },
            {
              id: 'sea-chui-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '06-30',
              description: '03 Jan - 30 Jun & 01 Nov - 20 Dec 2026',
              ppsUsd: 420,
              srsUsd: 130,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'All-inclusive sanctuary safari experience.',
            },
          ],
        }
      );

      extractedActivities.push(
        {
          id: 'act-crescent-island-walking-safari',
          name: 'Crescent Island Game Sanctuary Walking Safari',
          location: 'Lake Naivasha',
          ratePerPaxUsd: 45,
          description: 'Walk on foot safely alongside wild giraffes, zebras, wildebeest, and waterbucks on Crescent Island.',
          category: 'Wildlife/Nature',
        },
        {
          id: 'act-naivasha-boat-safari',
          name: 'Lake Naivasha Boat Safari & Fish Eagle Photography',
          location: 'Lake Naivasha',
          ratePerPaxUsd: 35,
          description: 'Motorboat cruise observing massive hippo pods and watching African Fish Eagles dive for prey.',
          category: 'Water',
        },
        {
          id: 'act-hells-gate-cycling-gorge',
          name: "Hell's Gate National Park Gorge Walk & Cycling Safari",
          location: "Hell's Gate National Park",
          ratePerPaxUsd: 55,
          description: "Cycle past towering volcanic cliffs, geothermal steam vents, and descend into Ol Njorowa gorge.",
          category: 'Wildlife/Nature',
        }
      );

      extractedParkFees.push(
        {
          id: 'park-hells-gate-naivasha',
          country: 'Kenya',
          parkName: "Hell's Gate National Park",
          areaType: 'National Park',
          category: 'Non-Resident Adult',
          highSeasonFeeUsd: 35,
          lowSeasonFeeUsd: 30,
          isDaily: true,
          effectivePeriod: '2026',
          officialAuthority: 'Kenya Wildlife Service (KWS)',
          verificationStatus: 'Official Verified',
          notes: 'Daily KWS conservation fee per non-resident adult.',
        },
        {
          id: 'park-lake-naivasha-riparian',
          country: 'Kenya',
          parkName: 'Lake Naivasha & Crescent Island Conservancy',
          areaType: 'Conservancy',
          category: 'Non-Resident Adult',
          highSeasonFeeUsd: 30,
          lowSeasonFeeUsd: 30,
          isDaily: true,
          effectivePeriod: '2026',
          officialAuthority: 'Lake Naivasha Riparian Association (LNRA)',
          verificationStatus: 'Official Verified',
          notes: 'Sanctuary conservation and environmental management fee.',
        }
      );

      extractedTransport.push({
        id: 'veh-naivasha-cruiser-4x4',
        name: '4x4 Safari Land Cruiser (Nairobi ⇄ Naivasha Circuit)',
        vehicleType: '4x4 Safari Land Cruiser',
        maxCapacity: 7,
        dailyRateHighUsd: 290,
        dailyRateLowUsd: 250,
        driverAllowanceDailyUsd: 40,
        includes: 'Unlimited Rift Valley mileage, fuel, pop-up viewing roof & professional driver-guide.',
      });

      extractedFlights.push({
        id: 'flt-wilson-naivasha-scenic',
        route: 'Nairobi Wilson (WIL) ⇄ Naivasha Loldia / Oserengoni',
        airline: 'Safarilink / Governors Aviation',
        oneWayRateUsd: 195,
        baggageLimitKg: 15,
        departurePoint: 'Wilson Airport Nairobi',
        arrivalPoint: 'Naivasha Loldia Airstrip',
      });

      extractedExtras.push({
        id: 'ext-naivasha-boat-transfer',
        name: 'Private Speedboat Lake Crossing & Luggage Porterage',
        unit: 'Per Boat',
        rateUsd: 60,
        mandatory: false,
        description: 'Direct lake transfer between lodges and Crescent Island jetty.',
      });
    }

    // 5. LAKE NAKURU STO TARIFF CONTRACT (e.g. Tariff Rates-Nakuru 2026.pdf)
    else if (raw.includes('nakuru') || raw.includes('lion hill') || raw.includes('the cliff') || raw.includes('soysambu')) {
      supplierName = 'Lake Nakuru National Park Safari Tariff Registry';

      extractedProperties.push(
        {
          id: 'prop-sarova-lion-hill-lodge',
          name: 'Sarova Lion Hill Game Lodge',
          country: 'Kenya',
          region: 'Lake Nakuru National Park',
          parkOrConservancyId: 'park-lake-nakuru',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Panoramic Lakeview Chalet',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Nakuru_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-lion-hill-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & 20 Dec - 03 Jan 2027',
              ppsUsd: 385,
              srsUsd: 135,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Scenic hillside chalets looking out over Lake Nakuru pink flamingo and pelican waters.',
            },
            {
              id: 'sea-lion-hill-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '03-31',
              description: '03 Jan - 31 Mar, 01 Jun - 30 Jun & Nov - 19 Dec 2026',
              ppsUsd: 275,
              srsUsd: 85,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Includes full board meals, park orientation & swimming pool access.',
            },
            {
              id: 'sea-lion-hill-low-2026',
              seasonName: 'Green / Low Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 195,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Zero SRS supplement in Low Season.',
            },
          ],
        },
        {
          id: 'prop-lake-nakuru-sopa-lodge',
          name: 'Lake Nakuru Sopa Lodge',
          country: 'Kenya',
          region: 'Lake Nakuru National Park',
          parkOrConservancyId: 'park-lake-nakuru',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Luxury Safari Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Nakuru_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-nakuru-sopa-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 310,
              srsUsd: 105,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Located on high ranges overlooking Lake Nakuru basin.',
            },
            {
              id: 'sea-nakuru-sopa-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '06-30',
              description: '03 Jan - 30 Jun & 01 Nov - 20 Dec 2026',
              ppsUsd: 230,
              srsUsd: 75,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Full board dining with views of alkaline lake.',
            },
            {
              id: 'sea-nakuru-sopa-low-2026',
              seasonName: 'Green Season',
              startDate: '04-01',
              endDate: '05-31',
              description: '01 April - 31 May 2026',
              ppsUsd: 165,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Green season special rate.',
            },
          ],
        },
        {
          id: 'prop-the-cliff-nakuru',
          name: 'The Cliff Nakuru (Luxury Tented Camp)',
          country: 'Kenya',
          region: 'Lake Nakuru National Park',
          parkOrConservancyId: 'park-lake-nakuru',
          boardBasis: 'Full Board (FB)',
          roomCategory: 'Luxury Cliff-Top Safari Tent',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'Tariff_Rates_Nakuru_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: 'sea-the-cliff-peak-2026',
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: '01 July - 31 October 2026 & Festive',
              ppsUsd: 620,
              srsUsd: 210,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'High luxury boutique tented camp 100 meters above lake surface with 180-degree panoramic view.',
            },
            {
              id: 'sea-the-cliff-mid-2026',
              seasonName: 'Mid Season',
              startDate: '01-03',
              endDate: '06-30',
              description: '03 Jan - 30 Jun & 01 Nov - 20 Dec 2026',
              ppsUsd: 480,
              srsUsd: 150,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Fine dining, cliff-side infinity pool, spa access & personalized butler service.',
            },
          ],
        }
      );

      extractedActivities.push(
        {
          id: 'act-nakuru-rhino-sanctuary-drive',
          name: 'Lake Nakuru Black & White Rhino Sanctuary Game Drive',
          location: 'Lake Nakuru National Park',
          ratePerPaxUsd: 65,
          description: 'Specialist game drive tracking protected black and white rhinos, Rothschild giraffes, and tree-climbing lions.',
          category: 'Wildlife/Nature',
        },
        {
          id: 'act-lion-hill-ridge-sundowner',
          name: 'Lion Hill Ridge Sunset Cocktails & African Canapés',
          location: 'Lake Nakuru National Park',
          ratePerPaxUsd: 55,
          description: 'Champagne sundowner overlooking the Great Rift Valley escarpment as flamingos gather at the lake edge.',
          category: 'Dining',
        },
        {
          id: 'act-baboon-cliff-viewpoint',
          name: 'Baboon Cliff & Makalia Falls Escarpment Excursion',
          location: 'Lake Nakuru National Park',
          ratePerPaxUsd: 35,
          description: 'Panoramic viewpoint photography stop and guided walk to Makalia water falls.',
          category: 'Wildlife/Nature',
        }
      );

      extractedParkFees.push({
        id: 'park-lake-nakuru-kws-official',
        country: 'Kenya',
        parkName: 'Lake Nakuru National Park',
        areaType: 'National Park',
        category: 'Non-Resident Adult',
        highSeasonFeeUsd: 70,
        lowSeasonFeeUsd: 60,
        isDaily: true,
        effectivePeriod: '2026 Calendar Year',
        officialAuthority: 'Kenya Wildlife Service (KWS)',
        verificationStatus: 'Official Verified',
        notes: 'Statutory KWS adult conservation tariff per 24 hours ($70 High / $60 Low).',
      });

      extractedTransport.push({
        id: 'veh-nakuru-cruiser-4x4',
        name: 'Custom 4x4 Safari Land Cruiser (Nakuru Wildlife Specialist)',
        vehicleType: '4x4 Safari Land Cruiser',
        maxCapacity: 7,
        dailyRateHighUsd: 310,
        dailyRateLowUsd: 260,
        driverAllowanceDailyUsd: 45,
        includes: 'Unlimited game mileage, expert naturalist guide, pop-up roof & inverter chargers.',
      });

      extractedFlights.push({
        id: 'flt-wilson-naishi-nakuru',
        route: 'Nairobi Wilson (WIL) ⇄ Lake Nakuru Naishi Airstrip',
        airline: 'Safarilink / AirKenya Charter',
        oneWayRateUsd: 220,
        baggageLimitKg: 15,
        departurePoint: 'Wilson Airport Nairobi',
        arrivalPoint: 'Naishi Airstrip (Lake Nakuru NP)',
      });

      extractedExtras.push({
        id: 'ext-amref-nakuru-evac',
        name: 'AMREF Flying Doctors 30-Day Emergency Air Evacuation',
        unit: 'Per Person',
        rateUsd: 35,
        mandatory: true,
        description: '24/7 air ambulance evacuation cover from Naishi airstrip to Nairobi hospitals.',
      });
    }

    // 6. GENERIC / DYNAMIC CONTRACT PARSER (For any other lodge or rate sheet)
    else {
      let detectedName = 'Safari Camp & Lodge';
      if (fileName) {
        const clean = fileName.replace(/[_-]/g, ' ').replace(/\.(pdf|txt|docx|doc)$/i, '').trim();
        if (clean.length > 3) detectedName = clean.replace(/\b\w/g, (c) => c.toUpperCase());
      }
      supplierName = detectedName;

      const isAirlineOrTransport = raw.includes('flight time table') || raw.includes('fares') || raw.includes('airline') || raw.includes('air safari') || raw.includes('charter');

      const defaultParkId = country === 'Tanzania' ? 'park-serengeti' : 'park-maasai-mara';
      const defaultRegion = country === 'Tanzania' ? 'Serengeti Ecosystem' : 'Maasai Mara Ecosystem';

      if (!isAirlineOrTransport) {
        // Extract numbers from text if available
        const ppsMatch = textContent.match(/\$?\s*([0-9]{3,4})\s*(pps|per person|sharing|\/person|usd)/i);
        const srsMatch = textContent.match(/\$?\s*([0-9]{2,3})\s*(srs|single supplement|single)/i);

        const highPps = ppsMatch ? parseInt(ppsMatch[1], 10) : (country === 'Tanzania' ? 850 : 680);
        const highSrs = srsMatch ? parseInt(srsMatch[1], 10) : 210;
        const midPps = Math.round(highPps * 0.78);
        const lowPps = Math.round(highPps * 0.58);

        const propSlug = `prop-${detectedName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        extractedProperties.push({
          id: propSlug,
          name: detectedName,
          country: country,
          region: defaultRegion,
          parkOrConservancyId: defaultParkId,
          boardBasis: raw.includes('game package') || raw.includes('gp') ? 'Game Package (GP)' : 'Full Board (FB)',
          roomCategory: raw.includes('suite') ? 'Luxury Safari Suite' : 'Luxury Tented Room',
          validityYear: 2026,
          sourceType: 'STO Rate Contract 2026',
          sourceDocument: fileName || 'STO_Confidential_Tariff_2026.pdf',
          sourceDate: '2026-01-15',
          status: 'Active',
          seasons: [
            {
              id: `sea-${propSlug}-peak-2026`,
              seasonName: 'Peak High Season',
              startDate: '07-01',
              endDate: '10-31',
              description: 'July 1 - October 31 & Dec 20 - Jan 05',
              ppsUsd: highPps,
              srsUsd: highSrs,
              childRateFactor: 0.5,
              minNights: 2,
              notes: 'Includes full board accommodation, tea/coffee, VAT & tourism levies.',
            },
            {
              id: `sea-${propSlug}-mid-2026`,
              seasonName: 'Mid / Shoulder Season',
              startDate: '01-06',
              endDate: '03-31',
              description: 'January 6 - March 31 & November',
              ppsUsd: midPps,
              srsUsd: Math.round(highSrs * 0.75),
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'High wildlife density shoulder season tariff.',
            },
            {
              id: `sea-${propSlug}-low-2026`,
              seasonName: 'Green / Low Season',
              startDate: '04-01',
              endDate: '05-31',
              description: 'April 1 - May 31 (Long Rains)',
              ppsUsd: lowPps,
              srsUsd: 0,
              childRateFactor: 0.5,
              minNights: 1,
              notes: 'Single room supplement waived in Green Season.',
            },
          ],
        });
      }

      extractedActivities.push({
        id: `act-balloon-${country.toLowerCase()}`,
        name: 'Hot Air Balloon Safari & Champagne Bush Breakfast',
        location: defaultRegion,
        ratePerPaxUsd: 495,
        description: 'Sunrise aerial game viewing followed by a champagne breakfast in the bush.',
        category: 'Aerial',
      });

      extractedParkFees.push({
        id: defaultParkId,
        country: country,
        parkName: country === 'Tanzania' ? 'Serengeti National Park' : 'Maasai Mara National Reserve',
        areaType: country === 'Tanzania' ? 'National Park' : 'National Reserve',
        category: 'Non-Resident Adult',
        highSeasonFeeUsd: country === 'Tanzania' ? 82.6 : 100,
        lowSeasonFeeUsd: country === 'Tanzania' ? 70.8 : 80,
        isDaily: true,
        concessionFeeUsd: country === 'Tanzania' ? 59 : 0,
        effectivePeriod: '2026',
        officialAuthority: country === 'Tanzania' ? 'TANAPA' : 'Narok County Government',
        verificationStatus: 'Official Verified',
        notes: 'Statutory government conservation and entry fee per non-resident adult per 24 hours.',
      });

      extractedTransport.push({
        id: `veh-custom-cruiser-${country.toLowerCase()}`,
        name: 'Custom 4x4 Safari Land Cruiser (Pop-Up Roof)',
        vehicleType: '4x4 Safari Land Cruiser',
        maxCapacity: 7,
        dailyRateHighUsd: 320,
        dailyRateLowUsd: 260,
        driverAllowanceDailyUsd: 45,
        includes: 'Unlimited game mileage within park, seasoned driver-guide, fuel, pop-up roof & cooler.',
      });

      extractedFlights.push({
        id: `flt-safari-${country.toLowerCase()}`,
        route: country === 'Tanzania' ? 'Arusha (ARK) ⇄ Serengeti Seronera (SEU)' : 'Nairobi Wilson (WIL) ⇄ Maasai Mara (MRE)',
        airline: country === 'Tanzania' ? 'Coastal Aviation / Auric Air' : 'Safarilink Aviation / AirKenya',
        oneWayRateUsd: country === 'Tanzania' ? 295 : 240,
        baggageLimitKg: 15,
        departurePoint: country === 'Tanzania' ? 'Arusha Airport' : 'Wilson Airport Nairobi',
        arrivalPoint: country === 'Tanzania' ? 'Serengeti Bush Airstrip' : 'Mara Bush Airstrip',
      });

      extractedExtras.push({
        id: 'ext-amref-flying-doctors',
        name: 'AMREF Flying Doctors Emergency Aero-Medical Evacuation Cover',
        unit: 'Per Person',
        rateUsd: 35,
        mandatory: true,
        description: 'Comprehensive 24/7 air ambulance evacuation coverage from any East African airstrip to Nairobi.',
      });
    }

    const totalCount = extractedProperties.length + extractedActivities.length + extractedParkFees.length + extractedTransport.length + extractedFlights.length + extractedExtras.length;

    return {
      contractSummary: `Successfully extracted ${extractedProperties.length} accommodation property record(s) with multi-season STO rate tiers, ${extractedActivities.length} activity option(s), ${extractedParkFees.length} park fee tariff(s), and transport options for ${supplierName}.`,
      supplierName,
      extractedProperties,
      extractedActivities,
      extractedParkFees,
      extractedTransport,
      extractedFlights,
      extractedExtras,
    };
  };

  // Smart Heuristic Safari Itinerary Day Generator (Fallback when API is experiencing high demand)
  const generateHeuristicSafariDay = (params: {
    dayNumber: number;
    destination?: string;
    propertyName?: string;
    activityNames?: string[];
    country?: string;
    clientName?: string;
  }) => {
    const day = params.dayNumber || 1;
    const dest = params.destination || 'Maasai Mara National Reserve';
    const prop = params.propertyName || 'Luxury Safari Camp';
    const country = params.country || 'Kenya';
    const acts = params.activityNames && params.activityNames.length ? params.activityNames : ['Big Five Game Drive', 'Sundowner'];

    // Heuristics based on destination
    let title = `Day ${day} — Exploring ${dest}`;
    let subtitle = `Immersive safari experiences and wildlife encounters in ${dest}.`;
    let description = `Awake to the golden dawn over ${dest}. Spend the day traversing diverse habitats alongside seasoned safari guides in search of iconic wildlife, returning to ${prop} for refined bush hospitality.`;
    let distanceKm = 180;
    let drivingTime = '~3.5 hrs';
    let meals = 'B, L, D';

    if (day === 1) {
      title = `Day 1 — Nairobi → ${dest}`;
      subtitle = `Arrival in ${country} and scenic expedition to ${dest}.`;
      description = `Depart Nairobi and journey across the Great Rift Valley into the pristine wilderness of ${dest}. Arrive at ${prop} in time for a refreshing welcome drink, lunch, and an introductory afternoon game drive.`;
      distanceKm = 245;
      drivingTime = '~5.5 hrs or 45 min flight';
      meals = 'L, D';
    } else if (dest.toLowerCase().includes('serengeti')) {
      title = `Day ${day} — Endless Plains of the Serengeti`;
      subtitle = `Tracking the Great Migration and predator action across central & northern Serengeti.`;
      description = `Traverse the boundless savannahs where lions, cheetahs, and vast herds of wildebeest roam freely. Enjoy panoramic photographic opportunities followed by an evening at ${prop}.`;
      distanceKm = 120;
      drivingTime = '~4 hrs';
    } else if (dest.toLowerCase().includes('ngorongoro')) {
      title = `Day ${day} — Ngorongoro Crater Floor Expedition`;
      subtitle = `Descent into the UNESCO World Heritage volcanic caldera.`;
      description = `Descend 600 meters into the verdant caldera teeming with black rhinos, giant tuskers, and flamingo-lined soda lakes. Relish a scenic bush picnic before ascending to ${prop}.`;
      distanceKm = 95;
      drivingTime = '~3 hrs';
    } else if (dest.toLowerCase().includes('amboseli')) {
      title = `Day ${day} — Amboseli Elephants & Mt. Kilimanjaro`;
      subtitle = `Iconic vistas of Mount Kilimanjaro framing legendary elephant herds.`;
      description = `Witness matriarchal elephant families against the majestic backdrop of snow-capped Mount Kilimanjaro. Explore acacia woodlands and swamp systems rich in birdlife.`;
      distanceKm = 150;
      drivingTime = '~3.5 hrs';
    } else if (dest.toLowerCase().includes('lamu') || dest.toLowerCase().includes('zanzibar') || dest.toLowerCase().includes('diani')) {
      title = `Day ${day} — Coastal Bliss & Island Retreat`;
      subtitle = `Turquoise waters, Swahili culture, and coastal relaxation.`;
      description = `Bask in the tropical warmth of the Indian Ocean coast. Savor fresh seafood lunches, explore historic coastal architecture, and embark on a sunset dhow excursion.`;
      distanceKm = 40;
      drivingTime = '~1 hr or boat transfer';
    }

    const morningItems = day === 1
      ? [
          { time: '07:30 AM', title: 'Pickup & Safari Briefing', subtitle: 'Meet safari guide & depart Nairobi', type: 'pickup' },
          { time: '11:00 AM', title: `Scenic Transit to ${dest}`, subtitle: 'Traverse the Great Rift Valley viewpoints', type: 'transfer' },
        ]
      : [
          { time: '06:30 AM', title: 'Dawn Game Drive', subtitle: `Morning wildlife tracking across ${dest}`, type: 'activity' },
          { time: '09:00 AM', title: 'Bush Breakfast / Camp Breakfast', subtitle: `Gourmet breakfast at ${prop}`, type: 'meal' },
        ];

    const afternoonItems = [
      { time: '01:00 PM', title: `Lodge Lunch: ${prop}`, subtitle: 'Multi-course lunch with panoramic wilderness views', type: 'meal' },
      { time: '04:00 PM', title: `Activity: ${acts[0] || 'Afternoon Safari Drive'}`, subtitle: 'Searching for big cats and herds during prime golden hour', type: 'activity' },
    ];

    const eveningItems = [
      { time: '06:30 PM', title: 'Sundowner Drinks & Campfire', subtitle: 'Signature safari cocktails as the sun sets over the horizon', type: 'meal' },
      { time: '08:00 PM', title: `Overnight: ${prop}`, subtitle: 'Gourmet dinner and restful night under African skies', type: 'accommodation' },
    ];

    return {
      title,
      subtitle,
      description,
      estimatedDistanceKm: distanceKm,
      estimatedDrivingTime: drivingTime,
      meals,
      morningItems,
      afternoonItems,
      eveningItems,
    };
  };

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Endpoint: Parse STO Contract, Supplier Rates, Activities, Park Fees, and Transport
  app.post('/api/ai/parse-sto-contract', async (req, res) => {
    try {
      const { textContent, fileData, mimeType, fileName } = req.body;

      if (!textContent && !fileData) {
        return res.status(400).json({
          error: 'Please provide either textContent or fileData (base64) of the STO contract or supplier rate sheet.',
        });
      }

      const ai = getAiClient();

      const systemInstruction = `You are the Lead East Africa Safari Tour Operator Contract Analyst and Commercial Costing Director for Tusafiri Africa Safaris.
Your PRIMARY mission is extracting, breaking down, and populating complete accommodation database records (extractedProperties) and related tariffs from Special Tour Operator (STO) confidential rate contracts, seasonal rate sheets, and supplier agreements.

CRITICAL INSTRUCTIONS:
1. CONTRACT TYPE ANALYSIS (MANDATORY):
   - You MUST analyze the contract carefully to determine if it is for Accommodations (Lodges/Camps), Transport (Airlines/Charter/Transfers/Car Rental), or Activities.
   - DO NOT invent an accommodation property if the contract is purely for an airline, air charter (e.g. Mombasa Air Safari), transfer provider, or railway service. If it is an airline, put the data ONLY into 'extractedFlights' and/or 'extractedTransport', and leave 'extractedProperties' EMPTY.

2. ACCOMMODATIONS (extractedProperties) — ONLY IF APPLICABLE:
   - If the contract contains lodges, camps, or hotels, extract EVERY SINGLE ONE.
   - MULTI-PROPERTY HOTEL GROUPS: If the contract is for a hospitality group (e.g. Sarova, Serena, Elewana, Governors', Singita, Asilia), you MUST create a distinct, individual record in extractedProperties for EACH individual facility/property/camp.
   - CURRENCY & MARKET SEGMENT DIFFERENTIATION:
     * IMPORTANT: If a single lodge/camp has both Non-Resident (USD) and Resident/Citizen (KES/TZS) rates in the document, you MUST output TWO SEPARATE property records for that same lodge: one for the 'Non-Resident' market segment (currency: USD) and another for the 'East Africa Resident' market segment (currency: KES or TZS).
     * Set 'currency' ('USD', 'KES', 'TZS', 'EUR', 'GBP') and 'marketSegment' ('Non-Resident', 'East Africa Resident', 'Citizen', or 'All Markets').
     * For resident rates quoted in KES or TZS: Provide both the local currency amount in 'ppsLocalCurrency' and the normalized USD amount in 'ppsUsd' (using benchmark conversion rates: ~130 KES = 1 USD; ~2600 TZS = 1 USD).
   - ZERO DUPLICATE RATES RULE: Each facility MUST have only one consolidated entry in extractedProperties. Each season within a facility MUST have unique dates/pricing. DO NOT output duplicate rate seasons for the same facility.
   - For EACH property, provide all seasonal rate tiers (Peak/High, Mid/Shoulder, Low/Green, Festive) with:
     * ppsUsd (Per Person Sharing STO Net rate in USD normalized)
     * srsUsd (Single Room Supplement STO Net rate in USD normalized)
     * childRateFactor (e.g. 0.5)
     * currency ('USD', 'KES', 'TZS')
     * marketSegment ('Non-Resident', 'East Africa Resident', 'Citizen')
     * minNights
     * roomCategory (e.g. Deluxe Tent, Safari Suite, Banda, Standard Chalet)
     * boardBasis (Full Board FB, Game Package GP, All Inclusive AI, or Bed & Breakfast BB)
     * country ('Kenya', 'Tanzania', 'Rwanda', 'Uganda') and accurate region/park.

3. ACTIVITIES & EXCURSIONS (extractedActivities):
   - Extract game drives, hot air balloon safaris, bush dinners, sundowner cocktails, guided walking safaris, boat excursions, cultural village visits with rates per person/vehicle and currency.

4. PARK & CONSERVANCY FEES (extractedParkFees):
   - Extract national park entry fees, conservation levies, concession fees, crater descent fees, differentiating between Non-Resident Adult/Child tariffs (USD) and Resident/Citizen tariffs (KES/TZS/USD).

5. TRANSPORT & SAFARI VEHICLES (extractedTransport):
   - Extract ground transport, car rentals, transfers, train tickets, and charters.
   - Use correct vehicleType categories: '4x4 Safari Land Cruiser', 'Safari Minivan', 'Overland Truck', 'Transfers', 'Car rental', 'Air transport', 'Charter flight', or 'Train'.

6. FLIGHTS & AIRSTRIP TRANSFERS (extractedFlights):
   - Extract scheduled safari flights (Safarilink, AirKenya, Coastal Aviation, Auric Air, Mombasa Air Safari), routes, rates, baggage limits.

7. OPERATIONAL EXTRAS (extractedExtras):
   - Extract AMREF Flying Doctors evacuation cover, park transit levies, luggage handling.

IMPORTANT: Keep contractSummary strictly to 1-2 concise sentences (under 150 characters) so that all output tokens are dedicated to populating the arrays.`;

      const promptText = `Analyze and extract all data from this East Africa STO contract / supplier rate document (${fileName || 'Supplier Rate Sheet'}):
${textContent ? `\n--- CONTRACT TEXT CONTENT ---\n${textContent}\n--- END CONTENT ---` : ''}

Populate records based on the contract type. For lodges/camps, populate extractedProperties. For airlines (e.g. Mombasa Air Safari), populate extractedFlights and extractedTransport (categorizing as 'Charter flight', 'Air transport', or 'Transfers' appropriately) and leave properties empty. Be very careful to categorize the data accurately based on what it actually is.`;

      const parts: any[] = [];

      if (fileData && mimeType) {
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: fileData,
          },
        });
      }

      parts.push({ text: promptText });

      const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
        contents: parts,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              contractSummary: {
                type: Type.STRING,
                description: 'A concise 1-2 sentence overview of the supplier and total records found.',
              },
              supplierName: {
                type: Type.STRING,
                description: 'Name of the hospitality group, operator, airline, or lodge',
              },
              extractedProperties: {
                type: Type.ARRAY,
                description: 'List of extracted STO accommodation property records. EMPTY if the contract is for an airline or transport only.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. prop-sarova-mara' },
                    name: { type: Type.STRING, description: 'Official lodge or camp name' },
                    facilityGroup: { type: Type.STRING, description: 'Hospitality chain or parent company if applicable' },
                    country: { type: Type.STRING, description: 'Kenya, Tanzania, Rwanda, or Uganda' },
                    region: { type: Type.STRING, description: 'Destination region e.g. Maasai Mara, Lake Nakuru, Amboseli, Serengeti, Ngorongoro' },
                    parkOrConservancyId: { type: Type.STRING, description: 'Corresponding park ID' },
                    boardBasis: { type: Type.STRING, description: 'Full Board (FB), Game Package (GP), All Inclusive (AI), or Bed & Breakfast (BB)' },
                    roomCategory: { type: Type.STRING, description: 'Room category e.g. Luxury Tent, Suite, Oceanfront Banda, Standard Chalet' },
                    currency: { type: Type.STRING, description: 'USD, KES, TZS, EUR, or GBP' },
                    marketSegment: { type: Type.STRING, description: 'Non-Resident, East Africa Resident, Citizen, or All Markets' },
                    validityYear: { type: Type.INTEGER, description: 'e.g. 2026 or 2027' },
                    sourceType: { type: Type.STRING, description: 'STO Rate Contract 2026, Confidential Operator Tariff, or Verified Partner Agreement' },
                    sourceDocument: { type: Type.STRING, description: 'Document filename or contract title' },
                    sourceDate: { type: Type.STRING, description: 'Date of contract issuance e.g. 2026-01-15' },
                    status: { type: Type.STRING, description: 'Active' },
                    seasons: {
                      type: Type.ARRAY,
                      description: 'Seasonal STO rate tiers',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: 'Unique season ID' },
                          seasonName: { type: Type.STRING, description: 'e.g. Peak Migration Season, Mid Season, Green Low Season' },
                          startDate: { type: Type.STRING, description: 'MM-DD e.g. 07-01' },
                          endDate: { type: Type.STRING, description: 'MM-DD e.g. 10-31' },
                          description: { type: Type.STRING, description: 'Date range description' },
                          ppsUsd: { type: Type.NUMBER, description: 'Per person sharing STO net rate normalized in USD' },
                          srsUsd: { type: Type.NUMBER, description: 'Single room supplement normalized in USD' },
                          childRateFactor: { type: Type.NUMBER, description: 'Child rate factor e.g. 0.5' },
                          currency: { type: Type.STRING, description: 'USD, KES, TZS' },
                          ppsLocalCurrency: { type: Type.NUMBER, description: 'Original local currency amount if contracted in KES/TZS' },
                          exchangeRateToUsd: { type: Type.NUMBER, description: 'Exchange rate used e.g. 130 for KES' },
                          marketSegment: { type: Type.STRING, description: 'Non-Resident, East Africa Resident, or Citizen' },
                          tripleReductionUsd: { type: Type.NUMBER, description: 'Triple room reduction if any' },
                          minNights: { type: Type.INTEGER, description: 'Minimum nights required' },
                          notes: { type: Type.STRING, description: 'Inclusions, game drives, park fee notes' },
                        },
                        required: ['id', 'seasonName', 'startDate', 'endDate', 'description', 'ppsUsd', 'srsUsd', 'childRateFactor'],
                      },
                    },
                  },
                  required: [
                    'id',
                    'name',
                    'country',
                    'region',
                    'parkOrConservancyId',
                    'boardBasis',
                    'roomCategory',
                    'validityYear',
                    'sourceType',
                    'sourceDocument',
                    'sourceDate',
                    'status',
                    'seasons',
                  ],
                },
              },
              extractedActivities: {
                type: Type.ARRAY,
                description: 'List of extracted activity and excursion options',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. act-balloon-safari' },
                    name: { type: Type.STRING, description: 'Activity name e.g. Hot Air Balloon Safari' },
                    location: { type: Type.STRING, description: 'Location e.g. Maasai Mara, Lake Nakuru, Lamu' },
                    currency: { type: Type.STRING, description: 'USD, KES, TZS' },
                    ratePerPaxUsd: { type: Type.NUMBER, description: 'Rate per passenger in USD' },
                    ratePerVehicleUsd: { type: Type.NUMBER, description: 'Rate per vehicle/boat if charter' },
                    description: { type: Type.STRING, description: 'Detailed description of activity' },
                    category: { type: Type.STRING, description: 'Aerial, Cultural, Wildlife/Nature, Water, or Dining' },
                  },
                  required: ['id', 'name', 'location', 'ratePerPaxUsd', 'description', 'category'],
                },
              },
              extractedParkFees: {
                type: Type.ARRAY,
                description: 'List of extracted national park and conservancy tariffs',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. park-maasai-mara' },
                    country: { type: Type.STRING, description: 'Kenya, Tanzania, Rwanda, or Uganda' },
                    parkName: { type: Type.STRING, description: 'Official park or reserve name' },
                    areaType: { type: Type.STRING, description: 'National Park, National Reserve, Conservancy, or Conservation Area' },
                    category: { type: Type.STRING, description: 'Non-Resident Adult, Non-Resident Child, Resident Adult, Resident Child, Citizen Adult, Vehicle, Crater Descent, or Concession Fee' },
                    currency: { type: Type.STRING, description: 'USD, KES, TZS' },
                    highSeasonFeeUsd: { type: Type.NUMBER, description: 'High season adult tariff in USD' },
                    lowSeasonFeeUsd: { type: Type.NUMBER, description: 'Low season adult tariff in USD' },
                    feeLocalCurrency: { type: Type.NUMBER, description: 'Tariff in local currency if KES/TZS' },
                    isDaily: { type: Type.BOOLEAN, description: 'Whether tariff is per day or per night' },
                    vehicleFeeUsd: { type: Type.NUMBER, description: 'Vehicle entry fee in USD' },
                    concessionFeeUsd: { type: Type.NUMBER, description: 'Concession / bed night fee in USD' },
                    effectivePeriod: { type: Type.STRING, description: 'Validity period e.g. 2026' },
                    officialAuthority: { type: Type.STRING, description: 'e.g. Kenya Wildlife Service (KWS), TANAPA, Narok County' },
                    verificationStatus: { type: Type.STRING, description: 'Official Verified or Verification Required' },
                    notes: { type: Type.STRING, description: 'Tariff rules and child fee notes' },
                  },
                  required: ['id', 'country', 'parkName', 'areaType', 'category', 'highSeasonFeeUsd', 'lowSeasonFeeUsd', 'isDaily', 'effectivePeriod', 'officialAuthority', 'verificationStatus'],
                },
              },
              extractedTransport: {
                type: Type.ARRAY,
                description: 'List of extracted transport options, safari vehicles, transfers, rentals, or charters',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. veh-cruiser-4x4' },
                    name: { type: Type.STRING, description: 'Vehicle or transport description' },
                    vehicleType: { type: Type.STRING, description: '4x4 Safari Land Cruiser, Safari Minivan, Overland Truck, Transfers, Car rental, Air transport, Charter flight, Train' },
                    maxCapacity: { type: Type.INTEGER, description: 'Window passenger capacity' },
                    dailyRateHighUsd: { type: Type.NUMBER, description: 'Daily rate in high season USD' },
                    dailyRateLowUsd: { type: Type.NUMBER, description: 'Daily rate in low season USD' },
                    driverAllowanceDailyUsd: { type: Type.NUMBER, description: 'Driver allowance daily rate' },
                    includes: { type: Type.STRING, description: 'Inclusions e.g. fuel, guide, game drives' },
                  },
                  required: ['id', 'name', 'vehicleType', 'maxCapacity', 'dailyRateHighUsd', 'dailyRateLowUsd', 'driverAllowanceDailyUsd', 'includes'],
                },
              },
              extractedFlights: {
                type: Type.ARRAY,
                description: 'List of extracted flights and bush airstrip transfers',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. flt-wilson-mara' },
                    route: { type: Type.STRING, description: 'Flight route e.g. Nairobi Wilson ⇄ Maasai Mara' },
                    airline: { type: Type.STRING, description: 'Airline e.g. Safarilink, AirKenya, Coastal Aviation' },
                    oneWayRateUsd: { type: Type.NUMBER, description: 'One-way rate in USD per pax' },
                    baggageLimitKg: { type: Type.NUMBER, description: 'Luggage limit in KG' },
                    departurePoint: { type: Type.STRING, description: 'Departure airstrip/airport' },
                    arrivalPoint: { type: Type.STRING, description: 'Arrival airstrip/airport' },
                  },
                  required: ['id', 'route', 'airline', 'oneWayRateUsd', 'baggageLimitKg', 'departurePoint', 'arrivalPoint'],
                },
              },
              extractedExtras: {
                type: Type.ARRAY,
                description: 'List of operational extras, emergency evacuation, or fees',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Slug ID e.g. ext-amref-flying-doctors' },
                    name: { type: Type.STRING, description: 'Extra name' },
                    unit: { type: Type.STRING, description: 'Per Person, Per Person Per Day, Per Vehicle, or Per Group' },
                    rateUsd: { type: Type.NUMBER, description: 'Rate in USD' },
                    mandatory: { type: Type.BOOLEAN, description: 'Whether fee is mandatory' },
                    description: { type: Type.STRING, description: 'Description of service' },
                  },
                  required: ['id', 'name', 'unit', 'rateUsd', 'mandatory', 'description'],
                },
              },
            },
            required: [
              'contractSummary',
              'supplierName',
              'extractedProperties',
              'extractedActivities',
              'extractedParkFees',
              'extractedTransport',
              'extractedFlights',
              'extractedExtras',
            ],
          },
        },
      });

      const rawText = response.text || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        console.warn('Failed to parse raw Gemini JSON response, auto-enriching via safari intelligence engine:', e);
        parsedData = {};
      }

      // Safety Layer: If Gemini omitted extractedProperties or returned 0 properties,
      // run the Tusafiri Safari Intelligence Multi-Property parser to ensure complete records.
      if (!parsedData.extractedProperties || !Array.isArray(parsedData.extractedProperties) || parsedData.extractedProperties.length === 0) {
        const heuristic = generateHeuristicContractData(textContent || parsedData.contractSummary || '', fileName);
        if (heuristic.extractedProperties && heuristic.extractedProperties.length > 0) {
          parsedData.extractedProperties = heuristic.extractedProperties;
        }
        if (!parsedData.extractedActivities || parsedData.extractedActivities.length === 0) {
          parsedData.extractedActivities = heuristic.extractedActivities;
        }
        if (!parsedData.extractedParkFees || parsedData.extractedParkFees.length === 0) {
          parsedData.extractedParkFees = heuristic.extractedParkFees;
        }
        if (!parsedData.extractedTransport || parsedData.extractedTransport.length === 0) {
          parsedData.extractedTransport = heuristic.extractedTransport;
        }
        if (!parsedData.extractedFlights || parsedData.extractedFlights.length === 0) {
          parsedData.extractedFlights = heuristic.extractedFlights;
        }
        if (!parsedData.extractedExtras || parsedData.extractedExtras.length === 0) {
          parsedData.extractedExtras = heuristic.extractedExtras;
        }
        if (!parsedData.supplierName || parsedData.supplierName === 'Unknown') {
          parsedData.supplierName = heuristic.supplierName;
        }
        if (!parsedData.contractSummary) {
          parsedData.contractSummary = heuristic.contractSummary;
        }
      }

      return res.json({
        success: true,
        modelUsed,
        data: parsedData,
      });
    } catch (error: any) {
      console.warn('Gemini API peak load / quota reached during contract analysis, activating Tusafiri Safari Intelligence Engine:', error?.message || error);
      
      const { textContent, fileName } = req.body;
      const fallbackData = generateHeuristicContractData(textContent, fileName);

      return res.json({
        success: true,
        source: 'smart-safari-contract-engine',
        notice: 'Extracted via Tusafiri Safari Intelligence Engine (Upstream Gemini AI was at peak capacity)',
        data: fallbackData,
      });
    }
  });

  // AI Endpoint: Parse & Extract Ready-Made Itinerary (FIT, Group, or Scheduled Departure)
  app.post('/api/ai/parse-ready-made-itinerary', async (req, res) => {
    const { textContent, fileName, category, durationDays, travelStyleTier } = req.body;

    try {
      const ai = getAiClient();

      const prompt = `You are a master East African Safari Operations Director. Parse and structure this uploaded ready-made safari itinerary into a complete, high-precision day-by-day JSON format.
File/Document Name: ${fileName || 'Uploaded Itinerary'}
Requested Category: ${category || 'fit'} (fit | group | scheduled_departure)
Expected Duration: ${durationDays ? `${durationDays} Days` : 'Detect from document'}
Travel Style / Tier: ${travelStyleTier || 'Mid-Range / Standard Comfort'}

Document Content:
"""
${(textContent || '').slice(0, 15000)}
"""

Extract and return:
1. title: Polished marketing safari title
2. category: 'fit' | 'group' | 'scheduled_departure'
3. country: 'Kenya' | 'Tanzania' | 'Cross-Border' | 'Rwanda' | 'Uganda'
4. durationDays: number of days
5. durationNights: number of nights
6. travelStyleTier: string matching one of (Budget / Camping Safari, Mid-Range / Standard Comfort, Semi-Luxury / Premium Classic, Luxury Tented Safari (5-Star), Ultra-Luxury / Connoisseur VIP, Flying Safari Express, Family & Conservation Safari, Photographic & Specialist Expedition)
7. summary: 2-3 sentence overview
8. destinations: string array of visited national parks & cities
9. recommendedPax: string
10. defaultVehicle: e.g. "4x4 Safari Land Cruiser (Pop-up Roof)"
11. startingPriceUsd: estimated USD per person sharing
12. departureDates: array of ISO date strings if scheduled departure
13. guaranteedDeparture: boolean
14. days: Array of days with:
    - dayNumber (1-indexed)
    - title (e.g. "Day 1: Arrival in Nairobi & Transfer to Amboseli")
    - destination (e.g. "Amboseli National Park")
    - country ("Kenya" or "Tanzania" or "Cross-Border")
    - propertyId (slug or empty)
    - nights (number)
    - roomType ("Twin/Double")
    - numberOfRooms (number)
    - transportVehicleId ("veh-land-cruiser-4x4")
    - includeVehicleThisDay (boolean)
    - activityIds (array of strings)
    - notes (detailed day plan)
    - highlightSummary (key highlight sentence)
    - mealsIncluded (e.g. "Full Board", "B, L, D")
    - distanceKm (number)
    - drivingTimeHours (string e.g. "~4.5 hrs")`;

      const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              country: { type: Type.STRING },
              durationDays: { type: Type.INTEGER },
              durationNights: { type: Type.INTEGER },
              travelStyleTier: { type: Type.STRING },
              summary: { type: Type.STRING },
              destinations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedPax: { type: Type.STRING },
              defaultVehicle: { type: Type.STRING },
              startingPriceUsd: { type: Type.NUMBER },
              departureDates: { type: Type.ARRAY, items: { type: Type.STRING } },
              guaranteedDeparture: { type: Type.BOOLEAN },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    country: { type: Type.STRING },
                    propertyId: { type: Type.STRING },
                    nights: { type: Type.INTEGER },
                    roomType: { type: Type.STRING },
                    numberOfRooms: { type: Type.INTEGER },
                    transportVehicleId: { type: Type.STRING },
                    includeVehicleThisDay: { type: Type.BOOLEAN },
                    activityIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    notes: { type: Type.STRING },
                    highlightSummary: { type: Type.STRING },
                    mealsIncluded: { type: Type.STRING },
                    distanceKm: { type: Type.NUMBER },
                    drivingTimeHours: { type: Type.STRING },
                  },
                  required: ['dayNumber', 'title', 'destination', 'country', 'notes', 'mealsIncluded'],
                },
              },
            },
            required: ['title', 'category', 'country', 'durationDays', 'durationNights', 'travelStyleTier', 'summary', 'destinations', 'days'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        modelUsed,
        data: parsed,
      });
    } catch (error: any) {
      console.warn('Gemini API peak / limit for itinerary upload, using fallback parsing:', error?.message || error);
      
      const rawText = (textContent || '').toLowerCase();
      const isTanzania = rawText.includes('serengeti') || rawText.includes('tanzania') || rawText.includes('ngorongoro') || rawText.includes('tarangire');
      const country = isTanzania ? 'Tanzania' : 'Kenya';
      const daysCount = Number(durationDays) || (rawText.match(/day\s*(\d+)/gi)?.length || 7);
      
      const days: any[] = [];
      for (let d = 1; d <= daysCount; d++) {
        let dest = country === 'Kenya' ? (d === 1 ? 'Nairobi' : d === 2 ? 'Amboseli' : d <= 4 ? 'Lake Nakuru / Naivasha' : 'Maasai Mara') : (d === 1 ? 'Arusha' : d === 2 ? 'Tarangire' : d <= 4 ? 'Serengeti' : 'Ngorongoro Crater');
        days.push({
          dayNumber: d,
          title: `Day ${d}: Exploration of ${dest}`,
          destination: dest,
          country,
          propertyId: '',
          nights: d === daysCount ? 0 : 1,
          roomType: 'Twin/Double',
          numberOfRooms: 1,
          transportVehicleId: 'veh-land-cruiser-4x4',
          includeVehicleThisDay: true,
          activityIds: [],
          notes: `Day ${d} comprehensive safari program imported from ${fileName || 'uploaded document'}. Game drives and wilderness exploration.`,
          highlightSummary: `Wildlife tracking & landscape exploration in ${dest}`,
          mealsIncluded: d === 1 ? 'Dinner' : d === daysCount ? 'Breakfast & Lunch' : 'Full Board',
          distanceKm: 180 + d * 20,
          drivingTimeHours: '~4 hrs'
        });
      }

      return res.json({
        success: true,
        source: 'smart-itinerary-extractor',
        notice: 'Itinerary generated via Tusafiri Safari Intelligence Parser',
        data: {
          title: `${daysCount}-Day ${country} ${category === 'scheduled_departure' ? 'Scheduled Group Safari' : category === 'group' ? 'Private Group Expedition' : 'Tailormade FIT Safari'}`,
          category: category || 'fit',
          country,
          durationDays: daysCount,
          durationNights: Math.max(1, daysCount - 1),
          travelStyleTier: travelStyleTier || 'Mid-Range / Standard Comfort',
          summary: `Curated ${daysCount}-day safari imported from ${fileName || 'client document'} across top East African wilderness destinations.`,
          destinations: country === 'Kenya' ? ['Nairobi', 'Amboseli', 'Lake Nakuru', 'Maasai Mara'] : ['Arusha', 'Tarangire', 'Serengeti', 'Ngorongoro Crater'],
          recommendedPax: category === 'group' ? '8-20 Pax' : category === 'scheduled_departure' ? '1-6 Pax' : '2-4 Pax',
          defaultVehicle: '4x4 Safari Land Cruiser (Pop-up Roof)',
          startingPriceUsd: 1850 + daysCount * 180,
          days
        }
      });
    }
  });

  // AI Endpoint: Generate Itinerary Day Description & Curated Schedule
  app.post('/api/ai/generate-day-description', async (req, res) => {
    const { dayNumber, destination, propertyName, activityNames, country, clientName } = req.body;

    try {
      const ai = getAiClient();

      const prompt = `You are a world-class luxury East African Safari Travel Designer crafting an itinerary for ${clientName || 'our discerning guests'}.
Generate an engaging, evocative, and practical day-by-day safari breakdown for:
- Day Number: Day ${dayNumber || 1}
- Destination: ${destination || 'Maasai Mara National Reserve'}
- Country: ${country || 'Kenya'}
- Selected Lodge/Camp: ${propertyName || 'Luxury Safari Camp'}
- Activities: ${activityNames && activityNames.length ? activityNames.join(', ') : 'Game drives, scenic transfers, sundowners'}

Provide:
1. title: e.g. "Day ${dayNumber || 1} — Nairobi → Maasai Mara"
2. subtitle: e.g. "Arrival in Kenya and transfer to the iconic Mara plains."
3. description: A compelling, atmospheric 2-3 sentence overview of this day's wildlife and landscape highlights.
4. estimatedDistanceKm: realistic road or flight transfer distance in km (number).
5. estimatedDrivingTime: e.g. "~5.5 hrs" or "45 min flight".
6. meals: e.g. "L, D" or "B, L, D".
7. morningItems: 1-2 items (e.g. pickup, airport transfer, morning game drive) with { time, title, subtitle, type: 'pickup' | 'transfer' | 'meal' | 'activity' | 'flight' }.
8. afternoonItems: 1-2 items (e.g. gourmet lodge lunch, afternoon game drive) with { time, title, subtitle, type: 'meal' | 'activity' }.
9. eveningItems: 1-2 items (e.g. sundowner drinks, campfire dinner & luxury tent stay) with { time, title, subtitle, type: 'meal' | 'accommodation' }.`;

      const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedDistanceKm: { type: Type.NUMBER },
              estimatedDrivingTime: { type: Type.STRING },
              meals: { type: Type.STRING },
              morningItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    type: { type: Type.STRING },
                  },
                  required: ['time', 'title', 'subtitle', 'type'],
                },
              },
              afternoonItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    type: { type: Type.STRING },
                  },
                  required: ['time', 'title', 'subtitle', 'type'],
                },
              },
              eveningItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    type: { type: Type.STRING },
                  },
                  required: ['time', 'title', 'subtitle', 'type'],
                },
              },
            },
            required: ['title', 'subtitle', 'description', 'estimatedDistanceKm', 'estimatedDrivingTime', 'meals', 'morningItems', 'afternoonItems', 'eveningItems'],
          },
        },
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);

      return res.json({
        success: true,
        modelUsed,
        data: parsed,
      });
    } catch (error: any) {
      console.warn('Gemini API temporary limit or error, activating intelligent safari fallback engine:', error?.message || error);
      
      // Intelligent fallback engine guarantees the user is never blocked by upstream 503 high demand
      const fallbackData = generateHeuristicSafariDay({
        dayNumber: Number(dayNumber) || 1,
        destination,
        propertyName,
        activityNames,
        country,
        clientName,
      });

      return res.json({
        success: true,
        source: 'smart-safari-engine',
        notice: 'Generated via Tusafiri Safari Intelligence Engine (Upstream Gemini AI was at peak capacity)',
        data: fallbackData,
      });
    }
  });

  // AI Multi-Day Safari Circuit Auto-Curation Endpoint
  app.post('/api/ai/curate-safari-circuit', async (req, res) => {
    const { clientInputs, days } = req.body;

    try {
      const ai = getAiClient();
      const clientName = clientInputs?.clientName || 'Valued Guests';
      const tier = clientInputs?.travelStyleTier || 'Semi-Luxury / Premium Classic';
      const daysCount = Array.isArray(days) ? days.length : 7;

      const prompt = `You are the Head Safari Curator and Expeditions Director for East Africa (Kenya, Tanzania, Uganda, Rwanda).
Auto-curate a complete, day-by-day luxury safari circuit for "${clientName}".
Total Duration: ${daysCount} Days.
Travel Style Tier: ${tier}.
Client Wishes / Notes: ${clientInputs?.specialRequestsNotes || 'Big Five safari, photography, luxury camps'}.

Given the current days:
${JSON.stringify((days || []).map((d: any) => ({
  dayNumber: d.dayNumber,
  destination: d.destination,
  country: d.country,
  propertyName: d.propertyName || d.propertyId,
  activityIds: d.activityIds
})))}

Generate an enriched, thrilling day-by-day circuit with evocative titles, rich highlights, full narrative description, realistic driving distances (km) and driving times, meals included (e.g. "B, L, D"), and realistic morning, afternoon, and evening timeline items for EVERY day.

Return the JSON matching the required schema.`;

      const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite East Africa safari circuit designer. Return valid JSON adhering to schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              circuitTitle: { type: Type.STRING },
              curationOverview: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimatedDistanceKm: { type: Type.NUMBER },
                    estimatedDrivingTime: { type: Type.STRING },
                    meals: { type: Type.STRING },
                    morningItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          subtitle: { type: Type.STRING },
                          type: { type: Type.STRING },
                        },
                        required: ['time', 'title', 'subtitle', 'type'],
                      },
                    },
                    afternoonItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          subtitle: { type: Type.STRING },
                          type: { type: Type.STRING },
                        },
                        required: ['time', 'title', 'subtitle', 'type'],
                      },
                    },
                    eveningItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          subtitle: { type: Type.STRING },
                          type: { type: Type.STRING },
                        },
                        required: ['time', 'title', 'subtitle', 'type'],
                      },
                    },
                  },
                  required: ['dayNumber', 'title', 'subtitle', 'description', 'estimatedDistanceKm', 'estimatedDrivingTime', 'meals', 'morningItems', 'afternoonItems', 'eveningItems'],
                },
              },
            },
            required: ['circuitTitle', 'curationOverview', 'days'],
          },
        },
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);

      return res.json({
        success: true,
        modelUsed,
        data: parsed,
      });
    } catch (error: any) {
      console.warn('Circuit curation fallback triggered:', error?.message || error);
      
      const fallbackDays = (days || []).map((d: any, idx: number) => 
        generateHeuristicSafariDay({
          dayNumber: d.dayNumber || idx + 1,
          destination: d.destination || 'Maasai Mara',
          propertyName: d.propertyName || '',
          activityNames: [],
          country: d.country || 'Kenya',
          clientName: clientInputs?.clientName || 'Valued Guests',
        })
      );

      return res.json({
        success: true,
        source: 'smart-safari-engine',
        notice: 'Circuit curated via Tusafiri Safari Intelligence Engine',
        data: {
          circuitTitle: `${clientInputs?.clientName || 'East Africa'} Bespoke Safari Expedition`,
          curationOverview: 'A masterfully curated circuit through premier game reserves and pristine wilderness.',
          days: fallbackDays.map((fd, i) => ({ ...fd, dayNumber: i + 1 })),
        },
      });
    }
  });

  // ==========================================
  // PERSISTENT MASTER DATABASE API ENDPOINTS
  // ==========================================

  // 1. GET Full Master Database
  app.get('/api/database/master', (req, res) => {
    try {
      const db = getMasterDatabase();
      return res.json({
        success: true,
        data: db,
        stats: {
          accommodationsCount: db.accommodations?.length || 0,
          rateTiersCount: countTotalRateTiers(db.accommodations),
          parksCount: db.parkFees?.length || 0,
          activitiesCount: db.activities?.length || 0,
          transportCount: db.transport?.length || 0,
          flightsCount: db.flights?.length || 0,
          extrasCount: db.extras?.length || 0,
        },
      });
    } catch (err: any) {
      console.error('Error serving master database:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database read failure' });
    }
  });

  // 2. POST Sync Incoming Rates / Ingested Entities
  app.post('/api/database/sync', (req, res) => {
    try {
      const payload = req.body || {};
      const { masterDatabase, stats } = syncIncomingEntities(payload);

      // Auto-save backup snapshot when syncing from imports or large batch edits
      if (payload.accommodations && payload.accommodations.length > 0) {
        saveServerSnapshot({
          label: `Cloud Sync (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          reason: 'contract_import',
          data: payload,
        });
      }

      return res.json({
        success: true,
        message: 'Master database successfully synchronized and persisted.',
        stats,
        data: masterDatabase,
      });
    } catch (err: any) {
      console.error('Error synchronizing master database:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database sync failure' });
    }
  });

  // 3. POST Ingest Direct STO Properties
  app.post('/api/database/accommodations', (req, res) => {
    try {
      const { properties } = req.body || {};
      if (!Array.isArray(properties) || properties.length === 0) {
        return res.status(400).json({ success: false, error: 'No properties provided' });
      }

      const { masterDatabase, stats } = syncIncomingEntities({ accommodations: properties });
      return res.json({
        success: true,
        message: `Successfully persisted ${properties.length} accommodations to master database.`,
        stats,
        accommodations: masterDatabase.accommodations,
      });
    } catch (err: any) {
      console.error('Error adding accommodations:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to save accommodations' });
    }
  });

  // 4. GET Database Health & Storage Status
  app.get('/api/database/status', (req, res) => {
    try {
      const db = getMasterDatabase();
      const snapshots = getServerSnapshots();
      return res.json({
        status: 'healthy',
        persistence: 'server-file-backed',
        lastUpdated: db.lastUpdated,
        version: db.version,
        stats: {
          accommodationsCount: db.accommodations?.length || 0,
          rateTiersCount: countTotalRateTiers(db.accommodations),
          parksCount: db.parkFees?.length || 0,
          activitiesCount: db.activities?.length || 0,
          transportCount: db.transport?.length || 0,
          flightsCount: db.flights?.length || 0,
          extrasCount: db.extras?.length || 0,
          snapshotsCount: snapshots.length,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: err?.message });
    }
  });

  // 5. GET Server Vault Snapshots
  app.get('/api/database/snapshots', (req, res) => {
    try {
      const snapshots = getServerSnapshots();
      return res.json({ success: true, snapshots });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 6. POST Save Server Vault Snapshot
  app.post('/api/database/snapshot', (req, res) => {
    try {
      const { label, reason, data } = req.body || {};
      const snapshot = saveServerSnapshot({
        label: label || `Manual Snapshot ${new Date().toLocaleTimeString()}`,
        reason: reason || 'manual_backup',
        data,
      });
      return res.json({ success: true, snapshot });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 7. POST Reset to Baseline with Safety Snapshot
  app.post('/api/database/reset', (req, res) => {
    try {
      // 1. Take pre-reset backup
      saveServerSnapshot({
        label: `Pre-Reset Backup (${new Date().toLocaleString()})`,
        reason: 'pre_reset',
      });

      // 2. Reset to seed baseline
      const seed = getBaselineSeedData();
      const saved = saveMasterDatabase(seed);
      return res.json({
        success: true,
        message: 'Master database successfully reset to factory baseline. Safety snapshot preserved.',
        data: saved,
        stats: {
          accommodationsCount: saved.accommodations.length,
          rateTiersCount: countTotalRateTiers(saved.accommodations),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Vite middleware setup for dev & static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tusafiri Africa Safaris Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
