export interface MapDestinationPoint {
  id: string;
  name: string;
  shortName: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda' | 'Cross-Border';
  region: string;
  // Normalized coordinates on a 1000x800 SVG map viewport
  // (longitude ~28.5°E to 42°E mapped to x: 50-950, latitude ~4.5°N to 11°S mapped to y: 50-750)
  x: number;
  y: number;
  category: 'National Park' | 'Reserve / Conservancy' | 'Hub / Airport' | 'Beach / Island' | 'Mountain / Landmark' | 'Lake';
  highlights: string[];
  altitudeMeters?: number;
  wildlifeSpecialties?: string[];
}

export interface MapGeographicFeature {
  id: string;
  name: string;
  type: 'lake' | 'mountain' | 'ocean' | 'rift-valley';
  path?: string; // SVG path data if polygon/line
  cx?: number;
  cy?: number;
  r?: number;
  labelX?: number;
  labelY?: number;
}

export const EAST_AFRICA_DESTINATIONS: Record<string, MapDestinationPoint> = {
  // KENYA
  'nairobi': {
    id: 'nairobi',
    name: 'Nairobi (JKIA / Wilson Hub)',
    shortName: 'Nairobi',
    country: 'Kenya',
    region: 'Central Kenya',
    x: 575,
    y: 295,
    category: 'Hub / Airport',
    highlights: ['Nairobi National Park', 'Giraffe Centre', 'Sheldrick Wildlife Trust', 'Wilson Safari Airstrip'],
    altitudeMeters: 1795,
    wildlifeSpecialties: ['Black Rhino', 'Rothschild Giraffe', 'Lions']
  },
  'maasai-mara': {
    id: 'maasai-mara',
    name: 'Maasai Mara National Reserve & Conservancies',
    shortName: 'Maasai Mara',
    country: 'Kenya',
    region: 'Rift Valley / Southwestern Kenya',
    x: 485,
    y: 315,
    category: 'National Park',
    highlights: ['Great Wildebeest Migration', 'Big Five Predator Density', 'Hot Air Balloon Safaris', 'Mara River Crossings'],
    altitudeMeters: 1550,
    wildlifeSpecialties: ['Big Cats', 'Wildebeest', 'Elephants', 'Cheetahs']
  },
  'amboseli': {
    id: 'amboseli',
    name: 'Amboseli National Park',
    shortName: 'Amboseli',
    country: 'Kenya',
    region: 'Southern Kenya / Kajiado',
    x: 620,
    y: 365,
    category: 'National Park',
    highlights: ['Majestic Mt. Kilimanjaro Vistas', 'Big Tuskers Elephant Herds', 'Observation Hill', 'Enkongo Narok Swamp'],
    altitudeMeters: 1180,
    wildlifeSpecialties: ['Super Tusker Elephants', 'Lions', 'Cheetahs', 'Pelicans']
  },
  'lake-nakuru': {
    id: 'lake-nakuru',
    name: 'Lake Nakuru National Park',
    shortName: 'Lake Nakuru',
    country: 'Kenya',
    region: 'Great Rift Valley',
    x: 520,
    y: 245,
    category: 'National Park',
    highlights: ['Sanctuary for White & Black Rhinos', 'Flamingo & Waterfowl Haven', 'Baboon Cliff Viewpoint', 'Makalia Falls'],
    altitudeMeters: 1754,
    wildlifeSpecialties: ['White & Black Rhino', 'Rothschild Giraffe', 'Leopards']
  },
  'lake-naivasha': {
    id: 'lake-naivasha',
    name: 'Lake Naivasha & Hell\'s Gate',
    shortName: 'Lake Naivasha',
    country: 'Kenya',
    region: 'Great Rift Valley',
    x: 540,
    y: 275,
    category: 'Lake',
    highlights: ['Boat Safari & Hippo Pods', 'Crescent Island Walking Safari', 'Hell\'s Gate Cycling & Gorges', 'Fischer\'s Tower'],
    altitudeMeters: 1884,
    wildlifeSpecialties: ['Hippos', 'Fish Eagles', 'Giraffes', 'Zebras']
  },
  'samburu': {
    id: 'samburu',
    name: 'Samburu & Buffalo Springs National Reserve',
    shortName: 'Samburu',
    country: 'Kenya',
    region: 'Northern Frontier Kenya',
    x: 605,
    y: 170,
    category: 'Reserve / Conservancy',
    highlights: ['Samburu Special Five', 'Ewaso Ng\'iro River Wildlife', 'Vibrant Samburu Culture', 'Dramatic Arid Vistas'],
    altitudeMeters: 1000,
    wildlifeSpecialties: ['Gerenuk', 'Grevy\'s Zebra', 'Beisa Oryx', 'Somali Ostrich', 'Reticulated Giraffe']
  },
  'ol-pejeta': {
    id: 'ol-pejeta',
    name: 'Ol Pejeta Conservancy & Sweetwaters',
    shortName: 'Ol Pejeta',
    country: 'Kenya',
    region: 'Laikipia Plateau',
    x: 580,
    y: 220,
    category: 'Reserve / Conservancy',
    highlights: ['Last 2 Northern White Rhinos', 'Sweetwaters Chimpanzee Sanctuary', 'Equator Crossing Safari', 'Highest Black Rhino Density in East Africa'],
    altitudeMeters: 1800,
    wildlifeSpecialties: ['Northern White Rhino', 'Black Rhino', 'Chimpanzees', 'Big Five']
  },
  'tsavo-west': {
    id: 'tsavo-west',
    name: 'Tsavo West National Park',
    shortName: 'Tsavo West',
    country: 'Kenya',
    region: 'Coast / Southeastern Kenya',
    x: 690,
    y: 400,
    category: 'National Park',
    highlights: ['Mzima Springs Crystal Waters', 'Shetani Lava Flow', 'Ngulia Rhino Sanctuary', 'Chyulu Hills Background'],
    altitudeMeters: 900,
    wildlifeSpecialties: ['Red Elephants', 'Black Rhino', 'Leopards', 'Hippos']
  },
  'tsavo-east': {
    id: 'tsavo-east',
    name: 'Tsavo East National Park',
    shortName: 'Tsavo East',
    country: 'Kenya',
    region: 'Coast / Southeastern Kenya',
    x: 745,
    y: 380,
    category: 'National Park',
    highlights: ['Vast Red Dust Wilderness', 'Mudanda Rock', 'Yatta Plateau (World\'s Longest Lava Flow)', 'Lugard Falls on Galana River'],
    altitudeMeters: 600,
    wildlifeSpecialties: ['Red Dust Elephants', 'Lions', 'Waterbucks', 'Gerenuk']
  },
  'aberdare': {
    id: 'aberdare',
    name: 'Aberdare National Park',
    shortName: 'Aberdares',
    country: 'Kenya',
    region: 'Central Highlands',
    x: 565,
    y: 235,
    category: 'National Park',
    highlights: ['Cloud Forests & Waterfalls', 'Treetops & The Ark Night Viewing', 'Karuru Falls', 'Rare Bongo Antelope Habitat'],
    altitudeMeters: 2400,
    wildlifeSpecialties: ['Black Leopard', 'Bongo', 'Giant Forest Hog', 'Colobus Monkeys']
  },
  'diani-mombasa': {
    id: 'diani-mombasa',
    name: 'Diani Beach & Mombasa Coast',
    shortName: 'Diani Beach',
    country: 'Kenya',
    region: 'Indian Ocean Coast',
    x: 795,
    y: 450,
    category: 'Beach / Island',
    highlights: ['White Sand Coral Beaches', 'Kisite Mpunguti Marine Park & Dolphins', 'Shimba Hills Sable Antelopes', 'Swahili Coastal Heritage'],
    altitudeMeters: 10,
    wildlifeSpecialties: ['Dolphins', 'Sea Turtles', 'Humpback Whales', 'Sable Antelope']
  },

  // TANZANIA
  'arusha': {
    id: 'arusha',
    name: 'Arusha / Kilimanjaro Airport (JRO Hub)',
    shortName: 'Arusha',
    country: 'Tanzania',
    region: 'Northern Safari Circuit',
    x: 580,
    y: 410,
    category: 'Hub / Airport',
    highlights: ['Gateway to Northern Tanzania Circuit', 'Coffee Plantation Tours', 'Mt Meru Background', 'Arusha National Park'],
    altitudeMeters: 1400,
    wildlifeSpecialties: ['Colobus Monkeys', 'Flamingos', 'Giraffes']
  },
  'serengeti': {
    id: 'serengeti',
    name: 'Serengeti National Park (Central / North / South)',
    shortName: 'Serengeti',
    country: 'Tanzania',
    region: 'Northern Safari Circuit',
    x: 440,
    y: 380,
    category: 'National Park',
    highlights: ['Endless Plains & Great Migration', 'Seronera Predator Valley', 'Kogatende River Crossings', 'Ndutu Calving Season (Jan-Mar)'],
    altitudeMeters: 1600,
    wildlifeSpecialties: ['Lions', 'Leopards', 'Cheetahs', 'Wildebeest', 'Hyenas']
  },
  'ngorongoro': {
    id: 'ngorongoro',
    name: 'Ngorongoro Crater & Conservation Area',
    shortName: 'Ngorongoro Crater',
    country: 'Tanzania',
    region: 'Northern Safari Circuit',
    x: 495,
    y: 415,
    category: 'National Park',
    highlights: ['World\'s Largest Intact Volcanic Caldera', 'Year-Round Big Five Enclosure', 'Endangered Black Rhinos', 'Olduvai Gorge Cradle of Humankind'],
    altitudeMeters: 2286,
    wildlifeSpecialties: ['Black Rhino', 'Huge Tusked Elephants', 'Lions', 'Golden Jackals']
  },
  'tarangire': {
    id: 'tarangire',
    name: 'Tarangire National Park',
    shortName: 'Tarangire',
    country: 'Tanzania',
    region: 'Northern Safari Circuit',
    x: 535,
    y: 460,
    category: 'National Park',
    highlights: ['Giant Ancient Baobab Trees', 'Vast Elephant Congregations', 'Silale Swamp Wilderness', 'Tarangire River Life-Source'],
    altitudeMeters: 1100,
    wildlifeSpecialties: ['Hundreds of Elephants', 'Tree-climbing Lions', 'Oryx', '550+ Bird Species']
  },
  'lake-manyara': {
    id: 'lake-manyara',
    name: 'Lake Manyara National Park',
    shortName: 'Lake Manyara',
    country: 'Tanzania',
    region: 'Northern Safari Circuit',
    x: 520,
    y: 425,
    category: 'National Park',
    highlights: ['Famous Tree-Climbing Lions', 'Alkaline Lake Flamingos', 'Treetop Canopy Walkway', 'Groundwater Forest'],
    altitudeMeters: 960,
    wildlifeSpecialties: ['Tree-Climbing Lions', 'Baboon Troops', 'Flamingos', 'Elephants']
  },
  'lake-natron': {
    id: 'lake-natron',
    name: 'Lake Natron & Ol Doinyo Lengai',
    shortName: 'Lake Natron',
    country: 'Tanzania',
    region: 'Northern Rift Valley',
    x: 525,
    y: 355,
    category: 'Lake',
    highlights: ['Active Mountain of God (Ol Doinyo Lengai)', 'Primary Breeding Ground for 2.5M Lesser Flamingos', 'Dramatic Escarpment & Waterfalls'],
    altitudeMeters: 610,
    wildlifeSpecialties: ['Lesser Flamingos', 'Golden Jackals', 'Zebras']
  },
  'zanzibar': {
    id: 'zanzibar',
    name: 'Zanzibar Island (Stone Town & Coast)',
    shortName: 'Zanzibar Island',
    country: 'Tanzania',
    region: 'Zanzibar Archipelago',
    x: 820,
    y: 560,
    category: 'Beach / Island',
    highlights: ['UNESCO Stone Town Spice Culture', 'Nungwi & Kendwa Turquoise Waters', 'Jozani Forest Red Colobus Monkeys', 'Prison Island Giant Tortoises'],
    altitudeMeters: 15,
    wildlifeSpecialties: ['Zanzibar Red Colobus', 'Giant Aldabra Tortoises', 'Dolphins']
  },
  'nyerere-selous': {
    id: 'nyerere-selous',
    name: 'Nyerere National Park (Selous)',
    shortName: 'Nyerere (Selous)',
    country: 'Tanzania',
    region: 'Southern Circuit Tanzania',
    x: 690,
    y: 660,
    category: 'National Park',
    highlights: ['Africa\'s Largest National Park', 'Rufiji River Boat Safaris', 'African Wild Dogs Sanctuary', 'Pristine Untouched Wilderness'],
    altitudeMeters: 300,
    wildlifeSpecialties: ['African Wild Dogs', 'Rufiji River Crocodiles', 'Hippos', 'Elephants']
  },
  'ruaha': {
    id: 'ruaha',
    name: 'Ruaha National Park',
    shortName: 'Ruaha',
    country: 'Tanzania',
    region: 'Southern Circuit Tanzania',
    x: 500,
    y: 650,
    category: 'National Park',
    highlights: ['Tanzania\'s Greatest Predator Stronghold', 'Vast 10% Global Lion Population', 'Great Ruaha River', 'Lesser & Greater Kudu'],
    altitudeMeters: 900,
    wildlifeSpecialties: ['Mega-Prides of Lions', 'Greater Kudu', 'Wild Dogs', 'Leopards']
  },

  // UGANDA
  'entebbe-kampala': {
    id: 'entebbe-kampala',
    name: 'Entebbe / Kampala (EBB Hub)',
    shortName: 'Entebbe',
    country: 'Uganda',
    region: 'Central Uganda / Lake Victoria',
    x: 320,
    y: 280,
    category: 'Hub / Airport',
    highlights: ['Lake Victoria Botanical Gardens', 'Mabamba Swamp Shoebill Quest', 'Uganda Wildlife Education Centre'],
    altitudeMeters: 1140,
    wildlifeSpecialties: ['Shoebill Stork', 'Vervet Monkeys', 'Waterbirds']
  },
  'bwindi': {
    id: 'bwindi',
    name: 'Bwindi Impenetrable National Park',
    shortName: 'Bwindi Gorillas',
    country: 'Uganda',
    region: 'Southwestern Uganda',
    x: 180,
    y: 390,
    category: 'National Park',
    highlights: ['Mountain Gorilla Tracking Expedition', 'Ancient Afro-Montane Rainforest', 'Batwa Pygmy Cultural Immersion', '350+ Exotic Bird Species'],
    altitudeMeters: 2300,
    wildlifeSpecialties: ['Mountain Gorillas', 'L\'Hoest\'s Monkeys', 'Chimpanzees', 'Albertine Rift Endemics']
  },
  'queen-elizabeth': {
    id: 'queen-elizabeth',
    name: 'Queen Elizabeth National Park',
    shortName: 'Queen Elizabeth',
    country: 'Uganda',
    region: 'Western Uganda',
    x: 200,
    y: 330,
    category: 'National Park',
    highlights: ['Kazinga Channel Boat Cruise', 'Ishasha Sector Tree-Climbing Lions', 'Kyambura Gorge Chimpanzees', 'Crater Lakes Explosions'],
    altitudeMeters: 950,
    wildlifeSpecialties: ['Tree-Climbing Lions', 'Hippos', 'Elephants', 'Chimpanzees']
  },
  'kibale': {
    id: 'kibale',
    name: 'Kibale Forest National Park',
    shortName: 'Kibale Chimps',
    country: 'Uganda',
    region: 'Western Uganda',
    x: 220,
    y: 280,
    category: 'National Park',
    highlights: ['Primate Capital of the World', 'Chimpanzee Habituation & Tracking', 'Bigodi Wetland Sanctuary Walk', '13 Distinct Primate Species'],
    altitudeMeters: 1500,
    wildlifeSpecialties: ['Chimpanzees', 'Red Colobus', 'L\'Hoest\'s Monkey', 'Pygmy Antelopes']
  },
  'murchison-falls': {
    id: 'murchison-falls',
    name: 'Murchison Falls National Park',
    shortName: 'Murchison Falls',
    country: 'Uganda',
    region: 'Northwestern Uganda',
    x: 240,
    y: 170,
    category: 'National Park',
    highlights: ['World\'s Most Powerful Waterfall', 'Nile River Boat Cruise to the Base of Falls', 'Budongo Chimpanzee Forest', 'Buligi Savannah Game Drives'],
    altitudeMeters: 700,
    wildlifeSpecialties: ['Nile Crocodiles', 'Rothschild Giraffes', 'Elephants', 'Shoebill']
  },

  // RWANDA
  'kigali': {
    id: 'kigali',
    name: 'Kigali (KGL Hub & Cultural Capital)',
    shortName: 'Kigali',
    country: 'Rwanda',
    region: 'Central Rwanda',
    x: 185,
    y: 435,
    category: 'Hub / Airport',
    highlights: ['Kigali Genocide Memorial', 'Cleanest & Safest Capital in Africa', 'Vibrant Art Centers & Coffee Cafes'],
    altitudeMeters: 1567,
    wildlifeSpecialties: ['Urban Birds', 'Lush Hills']
  },
  'volcanoes-np': {
    id: 'volcanoes-np',
    name: 'Volcanoes National Park (Musanze)',
    shortName: 'Volcanoes NP',
    country: 'Rwanda',
    region: 'Virunga Mountains',
    x: 155,
    y: 410,
    category: 'National Park',
    highlights: ['Mountain Gorilla Tracking in the Mist', 'Golden Monkey Excursions', 'Dian Fossey Karisoke Tomb Trek', 'Mt Bisoke Crater Lake Hike'],
    altitudeMeters: 2700,
    wildlifeSpecialties: ['Mountain Gorillas', 'Golden Monkeys', 'Virunga Bushbuck']
  },
  'akagera': {
    id: 'akagera',
    name: 'Akagera National Park',
    shortName: 'Akagera',
    country: 'Rwanda',
    region: 'Eastern Rwanda',
    x: 235,
    y: 440,
    category: 'National Park',
    highlights: ['Central Africa\'s Largest Protected Wetland', 'Big Five Savannah Recovery', 'Lake Ihema Boat Safaris', 'Night Game Drives'],
    altitudeMeters: 1300,
    wildlifeSpecialties: ['Black Rhinos', 'Lions', 'Shoebill', 'Giraffes']
  },
  'nyungwe': {
    id: 'nyungwe',
    name: 'Nyungwe Forest National Park',
    shortName: 'Nyungwe Forest',
    country: 'Rwanda',
    region: 'Southwestern Rwanda',
    x: 140,
    y: 490,
    category: 'National Park',
    highlights: ['East Africa\'s Only Canopy Walkway (70m high)', 'Chimpanzee & Angolan Colobus Tracking', 'Congo-Nile Divide Trail', 'Kamiranzovu Waterfall'],
    altitudeMeters: 2000,
    wildlifeSpecialties: ['Chimpanzees', 'Ruwenzori Colobus', 'Blue Monkeys', 'Rare Orchids']
  }
};

/**
 * Helper to match any destination or property name string to our curated coordinates database.
 */
export function resolveDestinationToMapPoint(destinationName?: string, propertyName?: string, countryName?: string): MapDestinationPoint {
  const query = `${destinationName || ''} ${propertyName || ''}`.toLowerCase();
  
  if (query.includes('mara') || query.includes('talek') || query.includes('naboisho') || query.includes('angama') || query.includes('governors') || query.includes('ololo') || query.includes('sand river')) {
    return EAST_AFRICA_DESTINATIONS['maasai-mara'];
  }
  if (query.includes('serengeti') || query.includes('seronera') || query.includes('ndutu') || query.includes('kogatende') || query.includes('grumeti') || query.includes('singita') || query.includes('four seasons')) {
    return EAST_AFRICA_DESTINATIONS['serengeti'];
  }
  if (query.includes('amboseli') || query.includes('ol tukai') || query.includes('tortilis')) {
    return EAST_AFRICA_DESTINATIONS['amboseli'];
  }
  if (query.includes('ngorongoro') || query.includes('crater') || query.includes('karatu') || query.includes('gibbs') || query.includes('neptune')) {
    return EAST_AFRICA_DESTINATIONS['ngorongoro'];
  }
  if (query.includes('tarangire') || query.includes('baobab') || query.includes('maramboi')) {
    return EAST_AFRICA_DESTINATIONS['tarangire'];
  }
  if (query.includes('manyara')) {
    return EAST_AFRICA_DESTINATIONS['lake-manyara'];
  }
  if (query.includes('nakuru') || query.includes('sarova lion hill') || query.includes('lake nakuru lodge')) {
    return EAST_AFRICA_DESTINATIONS['lake-nakuru'];
  }
  if (query.includes('naivasha') || query.includes('hells gate') || query.includes('crescent') || query.includes('sopa naivasha') || query.includes('chui lodge')) {
    return EAST_AFRICA_DESTINATIONS['lake-naivasha'];
  }
  if (query.includes('samburu') || query.includes('buffalo springs') || query.includes('shaba') || query.includes('sarova shaba') || query.includes('elephant bedroom')) {
    return EAST_AFRICA_DESTINATIONS['samburu'];
  }
  if (query.includes('ol pejeta') || query.includes('sweetwaters') || query.includes('laikipia') || query.includes('lewa')) {
    return EAST_AFRICA_DESTINATIONS['ol-pejeta'];
  }
  if (query.includes('tsavo west') || query.includes('mzima') || query.includes('kilaguni') || query.includes('severin')) {
    return EAST_AFRICA_DESTINATIONS['tsavo-west'];
  }
  if (query.includes('tsavo east') || query.includes('voi') || query.includes('ashnil aruba') || query.includes('galana')) {
    return EAST_AFRICA_DESTINATIONS['tsavo-east'];
  }
  if (query.includes('aberdare') || query.includes('ark') || query.includes('treetops')) {
    return EAST_AFRICA_DESTINATIONS['aberdare'];
  }
  if (query.includes('zanzibar') || query.includes('stone town') || query.includes('nungwi') || query.includes('kendwa') || query.includes('paje') || query.includes('melia zanzibar') || query.includes('the residence')) {
    return EAST_AFRICA_DESTINATIONS['zanzibar'];
  }
  if (query.includes('diani') || query.includes('mombasa') || query.includes('watamu') || query.includes('malindi') || query.includes('swahili beach') || query.includes('nomad')) {
    return EAST_AFRICA_DESTINATIONS['diani-mombasa'];
  }
  if (query.includes('ruaha')) {
    return EAST_AFRICA_DESTINATIONS['ruaha'];
  }
  if (query.includes('selous') || query.includes('nyerere')) {
    return EAST_AFRICA_DESTINATIONS['nyerere-selous'];
  }
  if (query.includes('bwindi') || query.includes('gorilla') || query.includes('buhoma') || query.includes('sanctuary gorilla forest')) {
    return EAST_AFRICA_DESTINATIONS['bwindi'];
  }
  if (query.includes('queen elizabeth') || query.includes('kazinga') || query.includes('mweya') || query.includes('ishasha')) {
    return EAST_AFRICA_DESTINATIONS['queen-elizabeth'];
  }
  if (query.includes('kibale') || query.includes('chimpanzee') || query.includes('primate lodge')) {
    return EAST_AFRICA_DESTINATIONS['kibale'];
  }
  if (query.includes('murchison') || query.includes('para') || query.includes('chobe')) {
    return EAST_AFRICA_DESTINATIONS['murchison-falls'];
  }
  if (query.includes('volcanoes') || query.includes('musanze') || query.includes('bisate') || query.includes('singita kwitonda') || query.includes('virunga')) {
    return EAST_AFRICA_DESTINATIONS['volcanoes-np'];
  }
  if (query.includes('nyungwe') || query.includes('one&only nyungwe')) {
    return EAST_AFRICA_DESTINATIONS['nyungwe'];
  }
  if (query.includes('akagera') || query.includes('magashi')) {
    return EAST_AFRICA_DESTINATIONS['akagera'];
  }
  if (query.includes('kigali') || query.includes('radisson kigali') || query.includes('kigali serena')) {
    return EAST_AFRICA_DESTINATIONS['kigali'];
  }
  if (query.includes('entebbe') || query.includes('kampala')) {
    return EAST_AFRICA_DESTINATIONS['entebbe-kampala'];
  }
  if (query.includes('arusha') || query.includes('kilimanjaro airport') || query.includes('gran melia arusha') || query.includes('arusha coffee')) {
    return EAST_AFRICA_DESTINATIONS['arusha'];
  }
  if (query.includes('nairobi') || query.includes('karen') || query.includes('hemingways') || query.includes('tamarind') || query.includes('wilson') || query.includes('jkia')) {
    return EAST_AFRICA_DESTINATIONS['nairobi'];
  }

  // Country fallbacks
  if (countryName === 'Tanzania' || query.includes('tanzania')) {
    return EAST_AFRICA_DESTINATIONS['serengeti'];
  }
  if (countryName === 'Uganda' || query.includes('uganda')) {
    return EAST_AFRICA_DESTINATIONS['bwindi'];
  }
  if (countryName === 'Rwanda' || query.includes('rwanda')) {
    return EAST_AFRICA_DESTINATIONS['volcanoes-np'];
  }

  // Default Kenya
  return EAST_AFRICA_DESTINATIONS['maasai-mara'];
}
