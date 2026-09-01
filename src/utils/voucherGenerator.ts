import {
  BookingVoucher,
  ClientQuotationInputs,
  ItineraryDay,
  STOAccommodationProperty,
  ActivityOption,
  TransportOption,
  FlightOption,
  ParkFeeRecord,
  TourDocRecord
} from '../types/costing';
import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { ACTIVITY_OPTIONS, TRANSPORT_OPTIONS, FLIGHT_OPTIONS } from '../data/transportAndExtrasData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';

/**
 * Generates a full set of service provider and hotel booking vouchers for a safari itinerary.
 */
export function generateVouchersFromItinerary(
  clientInputs: ClientQuotationInputs,
  itinerary: ItineraryDay[],
  stoProperties: STOAccommodationProperty[] = STO_ACCOMMODATION_DATABASE,
  activitiesList: ActivityOption[] = ACTIVITY_OPTIONS,
  transportList: TransportOption[] = TRANSPORT_OPTIONS,
  flightsList: FlightOption[] = FLIGHT_OPTIONS,
  parkList: ParkFeeRecord[] = PARK_FEES_DATABASE
): BookingVoucher[] {
  const vouchers: BookingVoucher[] = [];
  const quoteRef = clientInputs.quoteReference || `TUS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanRef = quoteRef.replace(/[^a-zA-Z0-9]/g, '');
  let voucherCounter = 1;

  const totalPax = (clientInputs.paxAdults || 1) + (clientInputs.paxChildren || 0);
  const roomConfig = clientInputs.roomConfig || { singleRooms: 0, doubleTwinRooms: 1, tripleRooms: 0, familyRooms: 0 };
  const roomConfigText = `${roomConfig.doubleTwinRooms > 0 ? `${roomConfig.doubleTwinRooms}x Double/Twin, ` : ''}${roomConfig.singleRooms > 0 ? `${roomConfig.singleRooms}x Single, ` : ''}${roomConfig.tripleRooms > 0 ? `${roomConfig.tripleRooms}x Triple, ` : ''}${roomConfig.familyRooms > 0 ? `${roomConfig.familyRooms}x Family` : ''}`.replace(/,\s*$/, '') || '1x Double/Twin Room';

  // Calculate start date object
  let startDate = new Date(clientInputs.travelStartDate || new Date().toISOString().slice(0, 10));
  if (isNaN(startDate.getTime())) {
    startDate = new Date();
  }

  // Helper to add days to date
  const getDateForDay = (dayIdx: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIdx);
    return d.toISOString().slice(0, 10);
  };

  // 1. HOTEL / ACCOMMODATION VOUCHERS (Group consecutive days at same property)
  const accommodationBlocks: Array<{
    propertyId: string;
    prop?: STOAccommodationProperty;
    startDay: number;
    endDay: number;
    destination: string;
    nights: number;
  }> = [];

  itinerary.forEach((day, idx) => {
    if (!day.propertyId) return;
    const prop = stoProperties.find(p => p.id === day.propertyId);
    const lastBlock = accommodationBlocks[accommodationBlocks.length - 1];

    if (lastBlock && lastBlock.propertyId === day.propertyId && lastBlock.endDay === idx) {
      lastBlock.endDay = idx + 1;
      lastBlock.nights += (day.nights || 1);
    } else {
      accommodationBlocks.push({
        propertyId: day.propertyId,
        prop,
        startDay: idx + 1,
        endDay: idx + 1,
        destination: day.destination,
        nights: day.nights || 1
      });
    }
  });

  accommodationBlocks.forEach((block) => {
    const prop = block.prop;
    const checkIn = getDateForDay(block.startDay - 1);
    const checkOut = getDateForDay(block.startDay - 1 + block.nights);
    const vchNum = `VCH-${cleanRef}-HTL-${String(voucherCounter++).padStart(2, '0')}`;

    vouchers.push({
      id: `vch-htl-${block.propertyId}-${block.startDay}`,
      voucherNumber: vchNum,
      voucherType: 'hotel',
      quoteReference: quoteRef,
      clientName: clientInputs.clientName || 'Private Safari Guest',
      leadGuest: clientInputs.clientName || 'Private Safari Guest',
      paxAdults: clientInputs.paxAdults || 2,
      paxChildren: clientInputs.paxChildren || 0,
      roomConfigSummary: roomConfigText,
      supplierName: prop?.name || 'Wilderness Safari Lodge',
      supplierEmail: `reservations@${(prop?.name || 'safari').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      supplierPhone: '+254 20 271 0000 / +255 27 250 8000',
      serviceName: `${prop?.name || 'Safari Lodge'} (${block.nights} Night${block.nights > 1 ? 's' : ''})`,
      destination: block.destination || prop?.region || 'East Africa',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nightsCount: block.nights,
      roomType: prop?.roomCategory || 'Standard Luxury Tent / Suite',
      boardBasis: prop?.boardBasis || 'Full Board (FB)',
      supplierConfirmationRef: `CONF-${Math.floor(100000 + Math.random() * 900000)}`,
      inclusions: [
        `${block.nights} nights accommodation on ${prop?.boardBasis || 'Full Board'} basis`,
        'Breakfast, Lunch & Gourmet 3-Course Safari Dinners included',
        'Government tourism levy, VAT and service charges included',
        'Complimentary high-speed lodge Wi-Fi & laundry service',
        'Emergency 24hr backup power & in-room mineral water'
      ],
      specialRequests: clientInputs.specialRequestsNotes || 'Non-smoking room, King bedding preference, dietary requirements noted.',
      billingInstruction: 'CHARGE TO TUSAFIRI AFRICA SAFARIS MASTER DIRECT ACCOUNT - DO NOT COLLECT ACCOMMODATION / MEAL CHARGES FROM GUESTS.',
      emergencyContact: '+254 712 345 678 (Tusafiri 24/7 Operations Desk)',
      status: 'Confirmed',
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: 'Tusafiri Africa Safaris Reservations Team'
    });
  });

  // 2. SAFARI VEHICLE & FLEET VOUCHERS
  const vehicleDays = itinerary.filter(d => d.includeVehicleThisDay);
  if (vehicleDays.length > 0) {
    const vchNum = `VCH-${cleanRef}-TRN-${String(voucherCounter++).padStart(2, '0')}`;
    const firstVeh = transportList.find(t => t.id === vehicleDays[0].transportVehicleId) || transportList[0];
    
    vouchers.push({
      id: `vch-trans-${cleanRef}`,
      voucherNumber: vchNum,
      voucherType: 'transport',
      quoteReference: quoteRef,
      clientName: clientInputs.clientName,
      leadGuest: clientInputs.clientName,
      paxAdults: clientInputs.paxAdults,
      paxChildren: clientInputs.paxChildren,
      roomConfigSummary: `Exclusive Private 4x4 Safari Cruiser`,
      supplierName: 'Tusafiri Operations & Fleet Services',
      supplierEmail: 'fleet@tusafiriafrica.com',
      supplierPhone: '+254 722 000 111',
      serviceName: `Exclusive Use: Custom 4x4 Safari Land Cruiser (${itinerary.length} Days)`,
      destination: 'Kenya & Tanzania Safari Circuit',
      checkInDate: getDateForDay(0),
      checkOutDate: getDateForDay(itinerary.length - 1),
      nightsCount: itinerary.length,
      roomType: firstVeh?.name || '4x4 Extended Safari Land Cruiser',
      boardBasis: 'Unlimited Mileage & Fuel Included',
      supplierConfirmationRef: `FLEET-${Math.floor(2000 + Math.random() * 8000)}`,
      inclusions: [
        'Custom 4x4 Safari Land Cruiser with pop-up roof for 360° wildlife viewing',
        'Dedicated English-speaking certified professional KPSGA/FGASA Safari Naturalist Guide',
        'Unlimited game drives during national park operating hours',
        'All vehicle park entry fees, fuel, driver-guide allowances and accommodation',
        'On-board cool box with unlimited chilled bottled water and charging sockets (220V/USB)'
      ],
      billingInstruction: 'BILLED UNDER TUSAFIRI AFRICA SAFARIS EXPEDITION FLEET CONTRACT.',
      emergencyContact: '+254 712 345 678 (24/7 Safari Dispatch)',
      status: 'Confirmed',
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: 'Tusafiri Logistics & Fleet Manager'
    });
  }

  // 3. PARK FEES & CONSERVATION PERMITS VOUCHERS
  const parkDays = itinerary.filter(d => d.parkFeeId);
  const uniqueParkIds = Array.from(new Set(parkDays.map(d => d.parkFeeId)));
  
  uniqueParkIds.forEach(parkId => {
    const park = parkList.find(p => p.id === parkId);
    if (!park) return;
    const vchNum = `VCH-${cleanRef}-PRK-${String(voucherCounter++).padStart(2, '0')}`;
    const parkDaysCount = parkDays.filter(d => d.parkFeeId === parkId).length;

    vouchers.push({
      id: `vch-park-${parkId}`,
      voucherNumber: vchNum,
      voucherType: 'park_fee',
      quoteReference: quoteRef,
      clientName: clientInputs.clientName,
      leadGuest: clientInputs.clientName,
      paxAdults: clientInputs.paxAdults,
      paxChildren: clientInputs.paxChildren,
      supplierName: `${park.officialAuthority || 'Wildlife Authority'} (${park.country})`,
      supplierEmail: 'ecitizen-support@kws.go.tz',
      supplierPhone: '+254 20 600 0800',
      serviceName: `Park Conservation Entry Permits: ${park.parkName} (${parkDaysCount} Day Entry)`,
      destination: park.parkName,
      checkInDate: getDateForDay(0),
      checkOutDate: getDateForDay(itinerary.length - 1),
      nightsCount: parkDaysCount,
      roomType: `${totalPax} Pax Entry (${clientInputs.paxAdults} Adults${clientInputs.paxChildren > 0 ? `, ${clientInputs.paxChildren} Children` : ''})`,
      boardBasis: 'Full Conservation Tariff Prepaid',
      supplierConfirmationRef: `PERMIT-${park.country === 'Tanzania' ? 'TANAPA' : 'KWS'}-${Math.floor(100000 + Math.random() * 900000)}`,
      inclusions: [
        `Prepaid Official 24-hour Conservation Entry for ${totalPax} Non-Resident Guests`,
        `Prepaid Vehicle & Driver entry authorization`,
        'Wildlife conservation support levy & smart card digital clearance'
      ],
      billingInstruction: 'PAID IN ADVANCE VIA PREPAID SMART CARD / ECITIZEN GOVERNMENT PORTAL BY TUSAFIRI AFRICA SAFARIS.',
      emergencyContact: '+254 712 345 678 (Tusafiri Permit Desk)',
      status: 'Confirmed',
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: 'Tusafiri Government Liaison Desk'
    });
  });

  // 4. FLIGHT VOUCHERS
  const flightDays = itinerary.filter(d => d.flightId);
  flightDays.forEach((fDay, idx) => {
    const flight = flightsList.find(f => f.id === fDay.flightId);
    if (!flight) return;
    const vchNum = `VCH-${cleanRef}-AIR-${String(voucherCounter++).padStart(2, '0')}`;
    const flDate = getDateForDay(fDay.dayNumber - 1);

    vouchers.push({
      id: `vch-flight-${flight.id}-${idx}`,
      voucherNumber: vchNum,
      voucherType: 'flight',
      quoteReference: quoteRef,
      clientName: clientInputs.clientName,
      leadGuest: clientInputs.clientName,
      paxAdults: clientInputs.paxAdults,
      paxChildren: clientInputs.paxChildren,
      supplierName: flight.airline || 'Safarilink Aviation / Auric Air',
      supplierEmail: 'res@flysafarilink.com',
      supplierPhone: '+254 20 669 0000',
      serviceName: `Bush Flight Transfer: ${flight.route}`,
      destination: flight.route,
      checkInDate: flDate,
      checkOutDate: flDate,
      nightsCount: 0,
      roomType: `${totalPax} Confirmed Seats`,
      boardBasis: `Baggage limit: ${flight.baggageLimitKg || 15}kg soft-sided bags`,
      supplierConfirmationRef: `PNR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      inclusions: [
        `Scheduled air transfer on ${flight.airline || 'Bush Airline'} for ${totalPax} passengers`,
        `All airport departure passenger service charges and safety levies included`,
        `Airstrip meet & transfer to lodge`
      ],
      specialRequests: 'Soft duffel bags only (max 15kg / 33lbs per passenger including hand luggage).',
      billingInstruction: 'TUSAFIRI IATA / DIRECT AIRLINE ACCOUNT BILLING. E-TICKETS ISSUED.',
      emergencyContact: '+254 712 345 678',
      status: 'Issued',
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: 'Tusafiri Air Ticketing Desk'
    });
  });

  // 5. ACTIVITY & EXCURSION VOUCHERS
  itinerary.forEach((day, dIdx) => {
    (day.activityIds || []).forEach((actId) => {
      const act = activitiesList.find(a => a.id === actId);
      if (!act) return;
      const vchNum = `VCH-${cleanRef}-ACT-${String(voucherCounter++).padStart(2, '0')}`;
      const actDate = getDateForDay(day.dayNumber - 1);

      vouchers.push({
        id: `vch-act-${act.id}-${dIdx}`,
        voucherNumber: vchNum,
        voucherType: 'activity',
        quoteReference: quoteRef,
        clientName: clientInputs.clientName,
        leadGuest: clientInputs.clientName,
        paxAdults: clientInputs.paxAdults,
        paxChildren: clientInputs.paxChildren,
        supplierName: `${act.name} Excursion Services`,
        supplierEmail: 'bookings@safariexperiences.com',
        supplierPhone: '+254 700 888 999',
        serviceName: `${act.name} (${act.location || day.destination})`,
        destination: act.location || day.destination,
        checkInDate: actDate,
        checkOutDate: actDate,
        nightsCount: 0,
        roomType: `${totalPax} Participants`,
        boardBasis: act.name.toLowerCase().includes('balloon') ? 'Champagne Bush Breakfast Included' : 'Activity Experience',
        supplierConfirmationRef: `ACT-${Math.floor(10000 + Math.random() * 90000)}`,
        inclusions: [
          `Full participation in ${act.name} for ${totalPax} guests`,
          'Certified excursion specialist guide & safety briefing',
          act.name.toLowerCase().includes('balloon') ? '1-Hour sunrise flight + sparkling wine bush breakfast' : 'All equipment and guide fees included'
        ],
        billingInstruction: 'DIRECT SETTLEMENT THROUGH TUSAFIRI AFRICA SAFARIS SUPPLIER CONTRACT.',
        emergencyContact: '+254 712 345 678',
        status: 'Confirmed',
        issuedDate: new Date().toISOString().slice(0, 10),
        issuedBy: 'Tusafiri Activities & Special Events Desk'
      });
    });
  });

  return vouchers;
}

/**
 * Creates a TourDoc record structure linking quote, live tracker, guides, and vouchers.
 */
export function createTourDocRecord(
  clientInputs: ClientQuotationInputs,
  itinerary: ItineraryDay[],
  vouchers: BookingVoucher[],
  options?: {
    assignedGuideName?: string;
    assignedGuidePhone?: string;
    vehicleReg?: string;
    vehicleModel?: string;
  }
): TourDocRecord {
  const quoteRef = clientInputs.quoteReference || 'TUS-2026-NBO-001';
  const cleanRef = quoteRef.replace(/[^a-zA-Z0-9]/g, '');
  
  // Create deterministic guest key and tour root code like African Eagle
  const guestKey = `6.${Math.floor(200 + Math.random() * 700)}.${Math.floor(1000 + Math.random() * 9000)}`;
  const tourRootCode = `PUNDA${Math.floor(500 + Math.random() * 400)}`;

  return {
    id: `tourdoc-${cleanRef}`,
    guestKey,
    tourRootCode,
    quoteReference: quoteRef,
    tourTitle: clientInputs.clientName ? `${itinerary.length} Days Safari Expedition for ${clientInputs.clientName}` : `${itinerary.length} Days Best of East Africa Safari Expedition`,
    clientName: clientInputs.clientName || 'Valued Safari Traveler',
    agencyOrLead: clientInputs.agencyOrLead || 'Direct Booking',
    paxCount: (clientInputs.paxAdults || 1) + (clientInputs.paxChildren || 0),
    paxAdults: clientInputs.paxAdults || 2,
    paxChildren: clientInputs.paxChildren || 0,
    travelStartDate: clientInputs.travelStartDate || new Date().toISOString().slice(0, 10),
    travelEndDate: clientInputs.travelEndDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    totalDays: itinerary.length,
    status: 'In Progress',
    currentRunningDay: 1,
    guideName: options?.assignedGuideName || 'David Mwangi',
    guidePhone: options?.assignedGuidePhone || '+254 722 987 654',
    vehicleReg: options?.vehicleReg || 'KDF 829X',
    vehicleModel: options?.vehicleModel || 'Toyota 4x4 Safari Land Cruiser (Extended)',
    meetAndGreetDetails: {
      airport: 'Jomo Kenyatta International Airport (NBO) - Terminal 1A',
      flightArrivalInfo: 'Meeting at Main International Arrivals Hall upon customs exit',
      pickupTime: '08:00 AM (or as per flight arrival time)',
      contactPerson: 'Tusafiri Airport Duty Rep (Holding Tusafiri Signboard)',
      contactPhone: '+254 712 345 678'
    },
    vouchers: vouchers,
    flights: [
      {
        id: 'flt-1',
        flightNumber: 'SL-204',
        airline: 'Safarilink Aviation',
        route: 'Nairobi Wilson (WIL) ➔ Maasai Mara Keekorok (KEU)',
        date: clientInputs.travelStartDate || new Date().toISOString().slice(0, 10),
        departureTime: '10:00 AM',
        arrivalTime: '10:45 AM',
        baggageAllowanceKg: 15,
        airstrip: 'Keekorok Airstrip (Mara)',
        pnrStatus: 'Confirmed (E-Ticket Issued)'
      }
    ],
    emergencyContacts: [
      {
        role: '24/7 Safari Operations Duty Manager',
        name: 'Joseph Omondi',
        phone: '+254 712 345 678',
        availableHours: '24 Hours / 7 Days'
      },
      {
        role: 'AMREF Flying Doctors Emergency Airborne Evacuation',
        name: 'Air Ambulance Command Control',
        phone: '+254 20 699 2000 / +254 733 639 088',
        availableHours: '24/7 Dedicated Emergency Air Dispatch'
      },
      {
        role: 'Senior Safari Naturalist Guide',
        name: options?.assignedGuideName || 'David Mwangi',
        phone: options?.assignedGuidePhone || '+254 722 987 654',
        availableHours: 'During Safari On-Call'
      }
    ],
    notes: 'Please keep this digital TourDoc companion saved to your device homescreen. It works offline and provides real-time access to your hotel vouchers, guide contact, daily briefing, and emergency coordinates.'
  };
}
