import { ActiveSafariExpedition, CompanySettings, EnquiryItem, FleetVehicle, InvoiceItem, SafariGuide, UpcomingTripItem } from '../types/costing';

export const INITIAL_EXPEDITIONS: ActiveSafariExpedition[] = [
  {
    id: 'exp-1',
    name: 'Serengeti Luxury Corridor',
    destination: 'Serengeti',
    currentDay: 4,
    totalDays: 7,
    guideName: 'Amara O.',
    guidePhone: '+255 784 112 390',
    vehiclePlate: 'T 482 DWY',
    departureTime: '06:00 GMT+3',
    progressPercent: 57,
    paxCount: 4,
    country: 'Tanzania'
  },
  {
    id: 'exp-2',
    name: 'Masaai Mara Migration',
    destination: 'Masai Mara',
    currentDay: 2,
    totalDays: 5,
    guideName: 'David N.',
    guidePhone: '+254 722 890 144',
    vehiclePlate: 'KDG 839P',
    departureTime: '05:30 GMT+3',
    progressPercent: 40,
    paxCount: 6,
    country: 'Kenya'
  },
  {
    id: 'exp-3',
    name: 'Kruger Big Five Safari',
    destination: 'Kruger',
    currentDay: 6,
    totalDays: 8,
    guideName: 'Sipho M.',
    guidePhone: '+27 82 459 2810',
    vehiclePlate: 'CA 992-108',
    departureTime: '06:30 GMT+2',
    progressPercent: 75,
    paxCount: 4,
    country: 'South Africa'
  }
];

export const INITIAL_UPCOMING_TRIPS: UpcomingTripItem[] = [
  {
    id: 'trip-1',
    client: 'Aris Thorne',
    destination: '8-Day Serengeti Sky',
    travelDate: 'Oct 12, 2024',
    pax: 4,
    status: 'Confirmed',
    consultant: 'Sarah M.',
    itineraryDays: 8,
    totalUsd: 14940
  },
  {
    id: 'trip-2',
    client: 'Priya Nair',
    destination: 'Rwanda Gorilla Trekking',
    travelDate: 'Oct 18, 2024',
    pax: 2,
    status: 'Pending',
    consultant: 'James K.',
    itineraryDays: 5,
    totalUsd: 18400
  },
  {
    id: 'trip-3',
    client: 'Lukas Brandt',
    destination: 'Namibia Dune Safari',
    travelDate: 'Nov 02, 2024',
    pax: 6,
    status: 'Confirmed',
    consultant: 'Amara O.',
    itineraryDays: 10,
    totalUsd: 22800
  },
  {
    id: 'trip-4',
    client: 'Hana Sato',
    destination: 'Zanzibar Beach Escape',
    travelDate: 'Nov 11, 2024',
    pax: 3,
    status: 'Planned',
    consultant: 'David N.',
    itineraryDays: 6,
    totalUsd: 9450
  },
  {
    id: 'trip-5',
    client: 'Tomás Reyes',
    destination: 'Victoria Falls Expedition',
    travelDate: 'Nov 24, 2024',
    pax: 5,
    status: 'Pending',
    consultant: 'Sarah M.',
    itineraryDays: 7,
    totalUsd: 16200
  }
];

export const INITIAL_ENQUIRIES: EnquiryItem[] = [
  {
    id: 'enq-101',
    clientName: 'Aris Thorne',
    email: 'aris.thorne@globalvoyages.com',
    phone: '+1 415 890 2311',
    destination: 'Serengeti & Maasai Mara',
    travelMonth: 'October 2024',
    paxAdults: 4,
    paxChildren: 2,
    estimatedBudgetUsd: 16000,
    source: 'Agent Lead',
    status: 'Quoted',
    assignedTo: 'Sarah M.',
    createdAt: '2024-09-15',
    notes: 'High-end luxury tented suites, private game drives with hot air balloon experience.'
  },
  {
    id: 'enq-102',
    clientName: 'Miller Family',
    email: 'david.miller@nycapitol.org',
    phone: '+1 212 555 0192',
    destination: 'Volcanoes National Park, Rwanda',
    travelMonth: 'November 2024',
    paxAdults: 2,
    paxChildren: 0,
    estimatedBudgetUsd: 19000,
    source: 'SafariBookings',
    status: 'Won',
    assignedTo: 'James K.',
    createdAt: '2024-09-18',
    notes: 'Silverback Gorilla trek permits confirmed; requested luxury helicopter charter transfer.'
  },
  {
    id: 'enq-103',
    clientName: 'Chen Wei',
    email: 'wei.chen@shanghaitech.cn',
    phone: '+86 21 6888 1234',
    destination: 'Maasai Mara River Crossing',
    travelMonth: 'October 2024',
    paxAdults: 2,
    paxChildren: 0,
    estimatedBudgetUsd: 13500,
    source: 'Web Direct',
    status: 'In Contact',
    assignedTo: 'Amara O.',
    createdAt: '2024-09-22',
    notes: 'Wants photography-adapted 4x4 cruiser with beanbags and wide lens mounts.'
  },
  {
    id: 'enq-104',
    clientName: 'Okafor Group',
    email: 'chidi.okafor@lagosholdings.ng',
    phone: '+234 803 112 9900',
    destination: 'Kruger & Sabi Sands',
    travelMonth: 'December 2024',
    paxAdults: 6,
    paxChildren: 2,
    estimatedBudgetUsd: 26000,
    source: 'Repeat Client',
    status: 'Quoted',
    assignedTo: 'Sarah M.',
    createdAt: '2024-09-25',
    notes: 'Exclusive safari lodge buyout requested; festive season safari dinner setup.'
  }
];

export const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: 'veh-1',
    regNumber: 'KDG 839P',
    model: 'Toyota Land Cruiser 79 Series (Custom Safari Spec)',
    vehicleType: '4x4 Safari Land Cruiser',
    year: 2023,
    capacity: 7,
    status: 'On Safari',
    currentDriver: 'David N.',
    location: 'Maasai Mara National Reserve',
    mileageKm: 42150,
    lastServiceDate: '2024-09-10'
  },
  {
    id: 'veh-2',
    regNumber: 'T 482 DWY',
    model: 'Toyota Land Cruiser Extended Pop-Up Top',
    vehicleType: 'Extended Land Cruiser',
    year: 2024,
    capacity: 7,
    status: 'On Safari',
    currentDriver: 'Amara O.',
    location: 'Central Serengeti, Tanzania',
    mileageKm: 28400,
    lastServiceDate: '2024-09-20'
  },
  {
    id: 'veh-3',
    regNumber: 'KCY 109M',
    model: 'Toyota Land Cruiser Heavy Duty Winch',
    vehicleType: '4x4 Safari Land Cruiser',
    year: 2022,
    capacity: 6,
    status: 'Available',
    currentDriver: 'Kato K.',
    location: 'Nairobi Operations Depot',
    mileageKm: 68900,
    lastServiceDate: '2024-09-28'
  },
  {
    id: 'veh-4',
    regNumber: 'CA 992-108',
    model: 'Toyota Land Cruiser Open-Sided Game Viewer',
    vehicleType: '4x4 Safari Land Cruiser',
    year: 2023,
    capacity: 9,
    status: 'On Safari',
    currentDriver: 'Sipho M.',
    location: 'Greater Kruger, South Africa',
    mileageKm: 35120,
    lastServiceDate: '2024-09-15'
  },
  {
    id: 'veh-5',
    regNumber: 'KBZ 774T',
    model: 'Toyota HiAce Safari Minivan Pop-Up',
    vehicleType: 'Safari Minivan',
    year: 2021,
    capacity: 7,
    status: 'In Maintenance',
    currentDriver: 'None',
    location: 'Nairobi Workshop (Brake Inspection)',
    mileageKm: 94300,
    lastServiceDate: '2024-08-15'
  }
];

export const INITIAL_GUIDES: SafariGuide[] = [
  {
    id: 'guide-1',
    name: 'Kato K.',
    role: 'Senior Naturalist Guide',
    languages: ['English', 'Swahili', 'German'],
    rating: 4.98,
    tripsCompleted: 142,
    certification: 'KPSGA Gold',
    phone: '+254 711 345 890',
    status: 'Available'
  },
  {
    id: 'guide-2',
    name: 'Amara O.',
    role: 'Senior Naturalist Guide',
    languages: ['English', 'Swahili', 'French'],
    rating: 4.95,
    tripsCompleted: 118,
    certification: 'KPSGA Gold',
    phone: '+255 784 112 390',
    status: 'On Safari',
    currentTrip: 'Serengeti Luxury Corridor (Day 4/7)'
  },
  {
    id: 'guide-3',
    name: 'David N.',
    role: 'Driver-Guide',
    languages: ['English', 'Swahili', 'Spanish'],
    rating: 4.91,
    tripsCompleted: 87,
    certification: 'KPSGA Silver',
    phone: '+254 722 890 144',
    status: 'On Safari',
    currentTrip: 'Masaai Mara Migration (Day 2/5)'
  },
  {
    id: 'guide-4',
    name: 'Sipho M.',
    role: 'Senior Naturalist Guide',
    languages: ['English', 'Zulu', 'Afrikaans'],
    rating: 4.96,
    tripsCompleted: 130,
    certification: 'FGASA Level 2',
    phone: '+27 82 459 2810',
    status: 'On Safari',
    currentTrip: 'Kruger Big Five Safari (Day 6/8)'
  },
  {
    id: 'guide-5',
    name: 'Sarah M.',
    role: 'Driver-Guide',
    languages: ['English', 'Swahili'],
    rating: 4.88,
    tripsCompleted: 64,
    certification: 'KPSGA Silver',
    phone: '+254 733 901 223',
    status: 'Available'
  }
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Tusafiri Africa Safaris Ltd.',
  companyEmail: 'operations@tusafiriasafaris.com',
  companyPhone: '+254 20 794 6000 / +255 784 100 200',
  companyAddress: 'Tusafiri House, Karen Road, P.O. Box 4820-00502, Nairobi, Kenya',
  taxVatNumber: 'P051892044K',
  defaultMarkupPercent: 20.0,
  defaultCurrency: 'USD',
  showPhotosInItinerary: true,
  termsAndConditions: '30% deposit required upon confirmation. Balance due 45 days prior to travel. All park fees subject to government statutory revision.',
  bankDetails: {
    bankName: 'Stanbic Bank Kenya Ltd',
    accountName: 'Tusafiri Africa Safaris Ltd (USD)',
    accountNumber: '0100084920194',
    swiftCode: 'SBICKENX',
    branch: 'Karen Branch, Nairobi'
  }
};

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-089',
    clientName: 'Aris Thorne',
    quoteRef: '#C-9082',
    issueDate: '2024-09-20',
    dueDate: '2024-10-05',
    totalAmountUsd: 14940,
    paidAmountUsd: 4500,
    balanceDueUsd: 10440,
    status: 'Partial'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-088',
    clientName: 'Miller Family',
    quoteRef: '#QT-9082',
    issueDate: '2024-09-18',
    dueDate: '2024-10-01',
    totalAmountUsd: 18400,
    paidAmountUsd: 18400,
    balanceDueUsd: 0,
    status: 'Paid'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-087',
    clientName: 'Chen Wei',
    quoteRef: '#QT-9081',
    issueDate: '2024-09-22',
    dueDate: '2024-10-10',
    totalAmountUsd: 12750,
    paidAmountUsd: 0,
    balanceDueUsd: 12750,
    status: 'Pending'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-086',
    clientName: 'Okafor Group',
    quoteRef: '#QT-9080',
    issueDate: '2024-09-25',
    dueDate: '2024-10-15',
    totalAmountUsd: 24900,
    paidAmountUsd: 7500,
    balanceDueUsd: 17400,
    status: 'Partial'
  }
];


