import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  Plane,
  Car,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  Calendar,
  Mountain,
  Waves,
  Eye,
  ArrowRight,
  CheckCircle2,
  TreePine,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  ShieldCheck,
  Building2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ItineraryDay, STOAccommodationProperty, ClientQuotationInputs } from '../types/costing';
import {
  EAST_AFRICA_DESTINATIONS,
  MapDestinationPoint,
  resolveDestinationToMapPoint
} from '../data/eastAfricaMapData';

interface EastAfricaRouteVisualSummaryProps {
  itinerary: ItineraryDay[];
  stoDatabase: STOAccommodationProperty[];
  clientInputs: ClientQuotationInputs;
  activeDayIndex: number;
  onSelectDayIndex: (index: number) => void;
  onAddDay?: () => void;
  onAutoCurate?: () => void;
}

export const EastAfricaRouteVisualSummary: React.FC<EastAfricaRouteVisualSummaryProps> = ({
  itinerary,
  stoDatabase,
  clientInputs,
  activeDayIndex,
  onSelectDayIndex,
  onAddDay,
  onAutoCurate
}) => {
  const [mapTheme, setMapTheme] = useState<'savannah' | 'satellite' | 'minimal'>('savannah');
  const [showAllParks, setShowAllParks] = useState<boolean>(false);
  const [showRiftValley, setShowRiftValley] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showRouteLines, setShowRouteLines] = useState<boolean>(true);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [hoveredMapPointId, setHoveredMapPointId] = useState<string | null>(null);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);

  // Auto-play timer ref
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Map each itinerary day to resolved destination coordinates
  const mappedDays = useMemo(() => {
    return itinerary.map((day, idx) => {
      const prop = stoDatabase.find(p => p.id === day.propertyId);
      const point = resolveDestinationToMapPoint(day.destination, prop?.name, day.country);
      const isFlight = day.transportVehicleId?.toLowerCase().includes('flight') || 
                       day.transportVehicleId?.toLowerCase().includes('air') ||
                       day.title?.toLowerCase().includes('fly') ||
                       day.title?.toLowerCase().includes('flight');

      return {
        dayIndex: idx,
        dayNumber: day.dayNumber || idx + 1,
        title: day.title,
        destination: day.destination,
        country: day.country,
        point,
        prop,
        isFlight,
        distanceKm: day.distanceKm || (idx === 0 ? 0 : 220),
        drivingTime: day.drivingTimeHours || (idx === 0 ? '~1 hr' : '~4.5 hrs'),
        meals: day.mealsIncluded || 'B, L, D',
        nights: day.nights || 1
      };
    });
  }, [itinerary, stoDatabase]);

  // Extract unique route stops / nodes in order
  const routeStops = useMemo(() => {
    const stops: { point: MapDestinationPoint; days: number[]; dayIndices: number[]; country: string; props: string[] }[] = [];
    
    mappedDays.forEach((item) => {
      const existing = stops.find(s => s.point.id === item.point.id);
      if (existing) {
        existing.days.push(item.dayNumber);
        existing.dayIndices.push(item.dayIndex);
        if (item.prop?.name && !existing.props.includes(item.prop.name)) {
          existing.props.push(item.prop.name);
        }
      } else {
        stops.push({
          point: item.point,
          days: [item.dayNumber],
          dayIndices: [item.dayIndex],
          country: item.country,
          props: item.prop?.name ? [item.prop.name] : []
        });
      }
    });
    return stops;
  }, [mappedDays]);

  // Route legs between consecutive days
  const routeLegs = useMemo(() => {
    const legs: {
      fromIndex: number;
      toIndex: number;
      fromPoint: MapDestinationPoint;
      toPoint: MapDestinationPoint;
      fromDayNum: number;
      toDayNum: number;
      isFlight: boolean;
      distanceKm: number;
      pathD: string;
      midX: number;
      midY: number;
    }[] = [];

    for (let i = 0; i < mappedDays.length - 1; i++) {
      const cur = mappedDays[i];
      const next = mappedDays[i + 1];

      // Generate curved bezier curve path between coordinates
      const x1 = cur.point.x;
      const y1 = cur.point.y;
      const x2 = next.point.x;
      const y2 = next.point.y;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Curve offset perpendicular to line
      const curvature = Math.min(45, Math.max(15, dist * 0.18));
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Add slight offset for aesthetic arc
      const normalX = -dy / (dist || 1);
      const normalY = dx / (dist || 1);
      const controlX = midX + normalX * curvature * (i % 2 === 0 ? 1 : -0.8);
      const controlY = midY + normalY * curvature * (i % 2 === 0 ? 1 : -0.8);

      const pathD = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

      legs.push({
        fromIndex: i,
        toIndex: i + 1,
        fromPoint: cur.point,
        toPoint: next.point,
        fromDayNum: cur.dayNumber,
        toDayNum: next.dayNumber,
        isFlight: next.isFlight,
        distanceKm: next.distanceKm,
        pathD,
        midX: controlX,
        midY: controlY
      });
    }

    return legs;
  }, [mappedDays]);

  // Overall circuit statistics
  const circuitStats = useMemo(() => {
    const totalKm = mappedDays.reduce((acc, d) => acc + (d.distanceKm || 0), 0);
    const uniqueDestinations = Array.from(new Set(mappedDays.map(d => d.point.shortName)));
    const uniqueCountries = Array.from(new Set(mappedDays.map(d => d.country)));
    const flightLegsCount = mappedDays.filter(d => d.isFlight).length;
    const roadLegsCount = Math.max(0, mappedDays.length - 1 - flightLegsCount);
    const maxAltitude = Math.max(...mappedDays.map(d => d.point.altitudeMeters || 1200));

    return {
      totalKm,
      uniqueDestinationsCount: uniqueDestinations.length,
      destinationsList: uniqueDestinations,
      countriesCount: uniqueCountries.length,
      countriesList: uniqueCountries,
      flightLegsCount,
      roadLegsCount,
      maxAltitude
    };
  }, [mappedDays]);

  // Auto-play tour effect
  useEffect(() => {
    if (!isPlayingTour) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    playTimerRef.current = setInterval(() => {
      onSelectDayIndex((prev: any) => {
        const next = (activeDayIndex + 1) % Math.max(1, itinerary.length);
        return next;
      });
    }, 2800);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlayingTour, activeDayIndex, itinerary.length, onSelectDayIndex]);

  // Current active day highlight details
  const activeMappedDay = mappedDays[activeDayIndex] || mappedDays[0];

  // Colors based on map theme
  const themeStyles = {
    savannah: {
      bg: 'fill-[#f4efe4]',
      ocean: 'fill-[#d7ebf7]',
      lake: 'fill-[#b9e0f5] stroke-[#8ec7eb] stroke-1',
      riftValley: 'stroke-[#cbb79a] stroke-[2] stroke-dasharray-[4,4]',
      parkBg: 'fill-[#e2edd3]/60 stroke-[#b5d696] stroke-1',
      countryBorder: 'stroke-[#d1c2a5] stroke-1 stroke-dasharray-[3,3]',
      landMass: 'fill-[#f9f5ed]',
      gridLines: 'stroke-[#ebdcc5]/40'
    },
    satellite: {
      bg: 'fill-[#121c17]',
      ocean: 'fill-[#0d2230]',
      lake: 'fill-[#173a4d] stroke-[#245873] stroke-1',
      riftValley: 'stroke-[#57432b] stroke-[2] stroke-dasharray-[4,4]',
      parkBg: 'fill-[#1f3f2a]/60 stroke-[#34784a] stroke-1',
      countryBorder: 'stroke-[#374f41] stroke-1 stroke-dasharray-[3,3]',
      landMass: 'fill-[#1b2b23]',
      gridLines: 'stroke-[#223d30]/30'
    },
    minimal: {
      bg: 'fill-[#ffffff]',
      ocean: 'fill-[#f0f7fc]',
      lake: 'fill-[#e1f0fa] stroke-[#bddcf2] stroke-1',
      riftValley: 'stroke-[#e2e8f0] stroke-[1.5] stroke-dasharray-[4,4]',
      parkBg: 'fill-[#f1f8ed] stroke-[#cde7bf] stroke-1',
      countryBorder: 'stroke-[#e2e8f0] stroke-1 stroke-dasharray-[3,3]',
      landMass: 'fill-[#fafafa]',
      gridLines: 'stroke-[#f1f5f9]'
    }
  }[mapTheme];

  return (
    <div className={`space-y-4 ${isExpandedModal ? 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 sm:p-8 overflow-y-auto flex items-center justify-center' : ''}`}>
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all ${isExpandedModal ? 'max-w-6xl w-full max-h-[92vh] flex flex-col' : ''}`}>
        
        {/* 1. TOP HEADER & INTERACTIVE MAP CONTROLS */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Interactive Circuit Cartography
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {itinerary.length} Days · {circuitStats.uniqueDestinationsCount} Destinations
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>{clientInputs.clientName || 'Bespoke Circuit'}</span>
                <span className="text-amber-400 font-normal text-sm">›</span>
                <span className="text-amber-200 text-sm font-semibold">
                  {circuitStats.countriesList.join(' & ')} Safari Route
                </span>
              </h3>
            </div>
          </div>

          {/* Quick Toolbar Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Play Tour Button */}
            <button
              type="button"
              onClick={() => setIsPlayingTour(!isPlayingTour)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isPlayingTour
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-slate-700/80 hover:bg-slate-700 text-amber-300 border border-slate-600'
              }`}
            >
              {isPlayingTour ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Tour</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Circuit Tour</span>
                </>
              )}
            </button>

            {/* Map Theme Toggle */}
            <div className="bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 flex items-center text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMapTheme('savannah')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapTheme === 'savannah' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                Savannah
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('satellite')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapTheme === 'satellite' ? 'bg-emerald-600 text-white font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('minimal')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapTheme === 'minimal' ? 'bg-white text-slate-900 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                Clean
              </button>
            </div>

            {/* Expand / Minimize Fullscreen */}
            <button
              type="button"
              onClick={() => setIsExpandedModal(!isExpandedModal)}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={isExpandedModal ? "Exit Fullscreen" : "Expand Route Map"}
            >
              {isExpandedModal ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. STATS OVERVIEW BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-b border-slate-200 bg-slate-50/70 text-xs">
          <div className="p-3 sm:px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Safari Distance</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {circuitStats.totalKm > 0 ? `${circuitStats.totalKm.toLocaleString()} km` : '~1,420 km'}
              </span>
            </div>
          </div>

          <div className="p-3 sm:px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Transit Breakdown</span>
              <span className="font-bold text-slate-800 text-xs">
                {circuitStats.roadLegsCount} Drives · {circuitStats.flightLegsCount} Flights
              </span>
            </div>
          </div>

          <div className="p-3 sm:px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TreePine className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ecosystems Visited</span>
              <span className="font-bold text-slate-800 text-xs">
                {circuitStats.uniqueDestinationsCount} National Parks/Reserves
              </span>
            </div>
          </div>

          <div className="p-3 sm:px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Elevation</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {circuitStats.maxAltitude.toLocaleString()} m a.s.l.
              </span>
            </div>
          </div>
        </div>

        {/* 3. MAIN INTERACTIVE MAP CANVAS & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* MAP CANVAS (8 COLS ON DESKTOP) */}
          <div className="lg:col-span-8 relative bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-hidden flex flex-col justify-center items-center">
            
            {/* Map Layer Toggles Floating Overlay */}
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-[11px] font-semibold text-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Layers:</span>
              <button
                type="button"
                onClick={() => setShowRouteLines(!showRouteLines)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  showRouteLines ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Route Lines
              </button>
              <button
                type="button"
                onClick={() => setShowAllParks(!showAllParks)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  showAllParks ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                All Parks
              </button>
              <button
                type="button"
                onClick={() => setShowLandmarks(!showLandmarks)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  showLandmarks ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Landmarks
              </button>
            </div>

            {/* Active Day Indicator Overlay */}
            <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 text-white backdrop-blur-xs px-3 py-2 rounded-2xl border border-slate-700 shadow-md flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                {activeDayIndex + 1}
              </div>
              <div className="text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Active Stop Focus</span>
                <strong className="font-bold text-white">{activeMappedDay.destination}</strong>
                <span className="text-slate-400 ml-1">({activeMappedDay.country})</span>
              </div>
            </div>

            {/* SVG CARTOGRAPHY CANVAS */}
            <div className="w-full aspect-[5/4] max-h-[560px] p-2 relative flex items-center justify-center">
              <svg
                viewBox="0 0 1000 800"
                className="w-full h-full select-none"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.04))' }}
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>

                  <radialGradient id="activeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </radialGradient>

                  {/* Marker Arrow for Route Legs */}
                  <marker
                    id="routeArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#d97706" />
                  </marker>

                  <marker
                    id="flightArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0284c7" />
                  </marker>
                </defs>

                {/* 1. Base Map Background */}
                <rect width="1000" height="800" className={themeStyles.bg} />

                {/* 2. Indian Ocean on East */}
                <path
                  d="M 760 0 C 780 150, 770 280, 810 400 C 840 500, 810 650, 860 800 L 1000 800 L 1000 0 Z"
                  className={themeStyles.ocean}
                />
                <text x="890" y="300" className="text-[12px] font-black fill-sky-800/40 tracking-[4px] uppercase select-none">
                  INDIAN OCEAN
                </text>

                {/* Coastline Coral Reefs / Beaches */}
                <path
                  d="M 760 0 C 780 150, 770 280, 810 400 C 840 500, 810 650, 860 800"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeOpacity="0.4"
                />

                {/* Zanzibar Island Archipelago */}
                <g className="cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                  const zanzibarDay = mappedDays.findIndex(d => d.point.id === 'zanzibar');
                  if (zanzibarDay !== -1) onSelectDayIndex(zanzibarDay);
                }}>
                  {/* Unguja / Zanzibar Main Island */}
                  <ellipse cx="820" cy="555" rx="14" ry="32" transform="rotate(-15 820 555)" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
                  {/* Pemba Island North */}
                  <ellipse cx="835" cy="470" rx="9" ry="22" transform="rotate(-10 835 470)" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
                  <text x="845" y="560" className="text-[10px] font-bold fill-slate-700 select-none">Zanzibar Island</text>
                </g>

                {/* 3. Major East African Lakes */}
                {/* Lake Victoria (Heart of East Africa) */}
                <g id="lake-victoria">
                  <path
                    d="M 330 290 C 370 270, 420 280, 440 320 C 460 360, 450 410, 420 440 C 380 470, 320 460, 290 410 C 270 370, 290 310, 330 290 Z"
                    className={themeStyles.lake}
                  />
                  <text x="365" y="375" textAnchor="middle" className="text-[11px] font-extrabold fill-sky-800/60 uppercase tracking-widest select-none">
                    Lake Victoria
                  </text>
                </g>

                {/* Lake Tanganyika (West) */}
                <path
                  d="M 120 500 C 130 570, 150 660, 200 770 L 175 780 C 120 670, 100 580, 95 500 Z"
                  className={themeStyles.lake}
                />
                <text x="145" y="650" transform="rotate(-65 145 650)" className="text-[9px] font-bold fill-sky-800/50 uppercase tracking-wider select-none">
                  Lake Tanganyika
                </text>

                {/* Lake Turkana (North Kenya) */}
                <path
                  d="M 520 40 C 535 70, 545 110, 540 150 L 525 150 C 530 110, 520 70, 505 40 Z"
                  className={themeStyles.lake}
                />
                <text x="545" y="100" className="text-[9px] font-bold fill-sky-800/50 uppercase select-none">
                  Lake Turkana
                </text>

                {/* Lake Naivasha & Lake Nakuru (Rift Valley) */}
                <ellipse cx="520" cy="245" rx="8" ry="12" className={themeStyles.lake} />
                <ellipse cx="540" cy="275" rx="10" ry="8" className={themeStyles.lake} />

                {/* Lake Natron & Manyara (Tanzania) */}
                <ellipse cx="525" cy="355" rx="7" ry="15" className={themeStyles.lake} />
                <ellipse cx="520" cy="425" rx="6" ry="16" className={themeStyles.lake} />

                {/* Lake Kivu (Rwanda Border) */}
                <path
                  d="M 135 440 C 145 460, 140 485, 130 500 L 122 495 C 130 480, 135 460, 125 445 Z"
                  className={themeStyles.lake}
                />

                {/* 4. Great Rift Valley Fault Line */}
                {showRiftValley && (
                  <g id="rift-valley">
                    <path
                      d="M 530 30 Q 520 180, 540 270 Q 530 380, 500 500 Q 480 620, 460 760"
                      fill="none"
                      className={themeStyles.riftValley}
                    />
                    <text x="560" y="80" className="text-[9px] font-bold fill-amber-800/40 uppercase tracking-widest select-none">
                      Great Rift Valley
                    </text>
                  </g>
                )}

                {/* 5. Country Border Outlines */}
                <g id="country-borders">
                  {/* Kenya-Tanzania Border */}
                  <path
                    d="M 285 365 L 435 365 L 610 375 L 750 440"
                    fill="none"
                    className={themeStyles.countryBorder}
                  />
                  {/* Uganda-Kenya Border */}
                  <path
                    d="M 440 280 L 460 180 L 480 80"
                    fill="none"
                    className={themeStyles.countryBorder}
                  />
                  {/* Uganda-Tanzania Border */}
                  <path
                    d="M 285 365 L 175 365"
                    fill="none"
                    className={themeStyles.countryBorder}
                  />
                  {/* Rwanda Border */}
                  <path
                    d="M 130 420 L 195 420 L 210 480 L 140 495 Z"
                    fill="none"
                    className={themeStyles.countryBorder}
                  />

                  {/* Country Names */}
                  <text x="640" y="240" className="text-[14px] font-black fill-slate-400/50 tracking-[6px] uppercase select-none">
                    KENYA
                  </text>
                  <text x="580" y="520" className="text-[14px] font-black fill-slate-400/50 tracking-[6px] uppercase select-none">
                    TANZANIA
                  </text>
                  <text x="250" y="240" className="text-[12px] font-black fill-slate-400/50 tracking-[4px] uppercase select-none">
                    UGANDA
                  </text>
                  <text x="175" y="470" className="text-[10px] font-black fill-slate-400/50 tracking-[2px] uppercase select-none">
                    RWANDA
                  </text>
                </g>

                {/* 6. Iconic Protected Wildlife Ecosystem Polygons */}
                <g id="conservation-ecosystems">
                  {/* Greater Mara-Serengeti Transboundary Ecosystem */}
                  <path
                    d="M 420 330 C 470 300, 510 320, 500 360 C 490 410, 430 420, 410 370 Z"
                    className={themeStyles.parkBg}
                  />
                  <text x="455" y="340" className="text-[9px] font-bold fill-emerald-800/70 select-none">
                    Mara-Serengeti Ecosystem
                  </text>

                  {/* Amboseli - Kilimanjaro Basin */}
                  <ellipse cx="615" cy="375" rx="35" ry="25" className={themeStyles.parkBg} />

                  {/* Tsavo Mega-Wilderness (East & West) */}
                  <ellipse cx="715" cy="395" rx="45" ry="35" className={themeStyles.parkBg} />

                  {/* Tarangire - Manyara Ecosystem */}
                  <ellipse cx="525" cy="445" rx="30" ry="35" className={themeStyles.parkBg} />

                  {/* Bwindi & Virunga Gorilla Sanctuary */}
                  <ellipse cx="165" cy="400" rx="28" ry="25" className={themeStyles.parkBg} />
                </g>

                {/* 7. Iconic Mountain Landmarks */}
                {showLandmarks && (
                  <g id="landmarks">
                    {/* Mt Kilimanjaro (5,895m) */}
                    <g transform="translate(605, 385)">
                      <polygon points="0,-12 10,8 -10,8" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                      <polygon points="0,-12 4,-4 -4,-4" fill="#ffffff" />
                      <text x="12" y="5" className="text-[9px] font-black fill-slate-700 select-none">
                        Mt. Kilimanjaro (5,895m)
                      </text>
                    </g>

                    {/* Mt Kenya (5,199m) */}
                    <g transform="translate(600, 235)">
                      <polygon points="0,-10 8,6 -8,6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                      <polygon points="0,-10 3,-3 -3,-3" fill="#ffffff" />
                      <text x="10" y="4" className="text-[9px] font-black fill-slate-700 select-none">
                        Mt. Kenya (5,199m)
                      </text>
                    </g>
                  </g>
                )}

                {/* 8. Other East Africa Parks (if toggle enabled) */}
                {showAllParks && (
                  <g id="all-known-parks" opacity="0.6">
                    {Object.values(EAST_AFRICA_DESTINATIONS).map((p) => {
                      const isIncludedInRoute = mappedDays.some(d => d.point.id === p.id);
                      if (isIncludedInRoute) return null; // Drawn in active stops
                      return (
                        <g key={p.id} className="cursor-pointer hover:opacity-100" onClick={() => setHoveredMapPointId(p.id)}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={p.x + 6} y={p.y + 3} className="text-[9px] font-medium fill-slate-500 select-none">
                            {p.shortName}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 9. ROUTE CONNECTING LEGS (Animated Paths) */}
                {showRouteLines && (
                  <g id="route-legs">
                    {routeLegs.map((leg, lIdx) => {
                      const isActiveLeg = activeDayIndex === leg.fromIndex || activeDayIndex === leg.toIndex;
                      return (
                        <g key={`leg-${lIdx}`}>
                          {/* Shadow / Outline Path */}
                          <path
                            d={leg.pathD}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={isActiveLeg ? '6' : '4'}
                            strokeLinecap="round"
                            opacity="0.8"
                          />

                          {/* Primary Route Path */}
                          <path
                            d={leg.pathD}
                            fill="none"
                            stroke={leg.isFlight ? 'url(#flightGradient)' : 'url(#routeGradient)'}
                            strokeWidth={isActiveLeg ? '3.5' : '2.5'}
                            strokeDasharray={leg.isFlight ? '6,6' : 'none'}
                            strokeLinecap="round"
                            markerEnd={leg.isFlight ? 'url(#flightArrow)' : 'url(#routeArrow)'}
                            className={isActiveLeg ? 'animate-pulse' : ''}
                          />

                          {/* Leg Distance / Mode Badge */}
                          <g transform={`translate(${leg.midX}, ${leg.midY})`}>
                            <rect
                              x="-22"
                              y="-9"
                              width="44"
                              height="18"
                              rx="9"
                              fill={leg.isFlight ? '#0284c7' : '#d97706'}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              className="shadow-xs"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              className="text-[9px] font-black fill-white select-none"
                            >
                              {leg.isFlight ? '✈ Flight' : `${leg.distanceKm}k`}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 10. ITINERARY ROUTE WAYPOINTS / STOPS */}
                <g id="route-waypoints">
                  {routeStops.map((stop) => {
                    const isStopActive = stop.dayIndices.includes(activeDayIndex);
                    const isHovered = hoveredDayIndex !== null && stop.dayIndices.includes(hoveredDayIndex);
                    const dayLabels = stop.days.length === 1 
                      ? `Day ${stop.days[0]}` 
                      : `Days ${stop.days[0]}-${stop.days[stop.days.length - 1]}`;

                    return (
                      <g
                        key={`stop-${stop.point.id}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => onSelectDayIndex(stop.dayIndices[0])}
                        onMouseEnter={() => setHoveredMapPointId(stop.point.id)}
                        onMouseLeave={() => setHoveredMapPointId(null)}
                      >
                        {/* Glow Pulse Ring for Active Stop */}
                        {(isStopActive || isHovered) && (
                          <circle
                            cx={stop.point.x}
                            cy={stop.point.y}
                            r="22"
                            fill="url(#activeGlow)"
                            className="animate-ping opacity-60"
                          />
                        )}

                        {/* Outer Pin Circle */}
                        <circle
                          cx={stop.point.x}
                          cy={stop.point.y}
                          r={isStopActive ? "14" : "11"}
                          fill={isStopActive ? "#f59e0b" : "#1e293b"}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          className="shadow-md"
                        />

                        {/* Number Badge inside Pin */}
                        <text
                          x={stop.point.x}
                          y={stop.point.y + 3.5}
                          textAnchor="middle"
                          className={`text-[10px] font-black select-none ${
                            isStopActive ? 'fill-slate-950 font-extrabold' : 'fill-white'
                          }`}
                        >
                          {stop.days[0]}
                        </text>

                        {/* Destination Name Label Banner */}
                        <g transform={`translate(${stop.point.x}, ${stop.point.y - (isStopActive ? 22 : 18)})`}>
                          <rect
                            x={-(stop.point.shortName.length * 3.4 + 18)}
                            y="-11"
                            width={stop.point.shortName.length * 6.8 + 36}
                            height="20"
                            rx="10"
                            fill={isStopActive ? "#0f172a" : "#ffffff"}
                            stroke={isStopActive ? "#f59e0b" : "#cbd5e1"}
                            strokeWidth={isStopActive ? "1.5" : "1"}
                            className="shadow-sm"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            className={`text-[9.5px] font-bold select-none ${
                              isStopActive ? 'fill-amber-400 font-black' : 'fill-slate-800'
                            }`}
                          >
                            {dayLabels}: {stop.point.shortName}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT SIDEBAR: DAY SEQUENCE TIMELINE & DETAILS (4 COLS) */}
          <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white max-h-[580px] overflow-y-auto">
            
            {/* Header & Active Day Summary Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Safari Sequence Flow
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Day {activeDayIndex + 1} / {itinerary.length}
                </span>
              </div>

              {/* Highlight Card for Currently Selected Stop */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5 shadow-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                    Day {activeMappedDay.dayNumber} · {activeMappedDay.country}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {activeMappedDay.distanceKm} km
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {activeMappedDay.destination}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
                    {activeMappedDay.prop?.name || 'Selected Safari Camp / Lodge'}
                  </p>
                </div>

                {/* Wildlife & Highlights Tag Cloud */}
                {activeMappedDay.point.highlights && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeMappedDay.point.highlights.slice(0, 3).map((hl, i) => (
                      <span key={i} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded-md border border-amber-200/60 font-medium">
                        ✦ {hl}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px] text-slate-600">
                  <span>Transit: <strong>{activeMappedDay.drivingTime}</strong></span>
                  <span>Board: <strong>{activeMappedDay.meals}</strong></span>
                </div>
              </div>
            </div>

            {/* Interactive Day Sequence Scrollable List */}
            <div className="space-y-2 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Click any Day to Inspect on Map
              </span>

              {mappedDays.map((item, idx) => {
                const isActive = idx === activeDayIndex;
                return (
                  <div
                    key={`seq-item-${idx}`}
                    onClick={() => onSelectDayIndex(idx)}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold scale-101'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.dayNumber}
                      </span>
                      <div className="min-w-0">
                        <div className={`truncate text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {item.destination}
                        </div>
                        <div className={`truncate text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.prop?.name || item.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.isFlight ? (
                        <Plane className={`w-3.5 h-3.5 ${isActive ? 'text-sky-300' : 'text-sky-600'}`} />
                      ) : (
                        <Car className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {onAddDay && (
                <button
                  type="button"
                  onClick={onAddDay}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add Next Stop
                </button>
              )}

              {onAutoCurate && (
                <button
                  type="button"
                  onClick={onAutoCurate}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>AI Optimize Route</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
