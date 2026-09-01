import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  Award,
  BedDouble,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Fuel,
  Globe,
  HeartPulse,
  Info,
  Layers,
  LifeBuoy,
  ListChecks,
  Loader2,
  Luggage,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Navigation,
  Palmtree,
  Phone,
  Plane,
  Printer,
  QrCode,
  Radio,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Ticket,
  Truck,
  UserCheck,
  Users,
  Utensils,
  Wifi,
  Wind
} from 'lucide-react';
import {
  BookingVoucher,
  ClientQuotationInputs,
  ItineraryDay,
  SavedQuote,
  STOAccommodationProperty,
  TourDocRecord
} from '../types/costing';
import { TusafiriLogo } from './TusafiriLogo';
import { exportElementToPdf } from '../utils/pdfExport';
import { createTourDocRecord, generateVouchersFromItinerary } from '../utils/voucherGenerator';

interface DigitalTourDocPortalProps {
  clientInputs: ClientQuotationInputs;
  itinerary: ItineraryDay[];
  stoProperties?: STOAccommodationProperty[];
  savedQuotes?: SavedQuote[];
  onNavigateToCosting?: () => void;
  onNavigateToVouchers?: () => void;
}

export const DigitalTourDocPortal: React.FC<DigitalTourDocPortalProps> = ({
  clientInputs,
  itinerary,
  stoProperties = [],
  savedQuotes = [],
  onNavigateToCosting,
  onNavigateToVouchers
}) => {
  // Generate vouchers and TourDoc model
  const [vouchers] = useState<BookingVoucher[]>(() =>
    generateVouchersFromItinerary(clientInputs, itinerary, stoProperties)
  );

  const [tourDoc, setTourDoc] = useState<TourDocRecord>(() =>
    createTourDocRecord(clientInputs, itinerary, vouchers)
  );

  const [activeTourDocTab, setActiveTourDocTab] = useState<
    'itinerary' | 'vouchers' | 'guide_fleet' | 'flights' | 'emergency' | 'briefing'
  >('itinerary');

  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const totalPax = (clientInputs.paxAdults || 1) + (clientInputs.paxChildren || 0);
  const currentDay = itinerary[activeDayIdx] || itinerary[0];
  const activeProperty = stoProperties.find(p => p.id === currentDay?.propertyId);

  // Direct share link simulating TourDoc link structure
  const shareableUrl = `https://tusafiriafrica.com/tourdoc?mod=1&ut=g&gk=${tourDoc.guestKey}&root=${tourDoc.tourRootCode}&ref=${tourDoc.quoteReference}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleDownloadTourDocPdf = async () => {
    const el = document.getElementById('tourdoc-printable-pack');
    if (!el) return;
    setIsExportingPdf(true);

    const safeRef = tourDoc.quoteReference.replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      await exportElementToPdf(el, {
        filename: `Tusafiri_Safari_TourDoc_Pack_${safeRef}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        margin: [8, 8, 8, 8],
      });
    } catch (e) {
      console.error('Error downloading TourDoc PDF:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* TourDoc Navigation Banner (African Eagle TourDoc Inspired Header) */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Compass className="w-80 h-80 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TusafiriLogo variant="full" theme="dark" size="md" showSubtitle={false} />
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold">
                TOURDOC PORTAL v2.6
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                LIVE RUNNING TOUR
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              {tourDoc.tourTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span><strong>Guest:</strong> {tourDoc.clientName} ({totalPax} Pax)</span>
              <span>•</span>
              <span><strong>Dates:</strong> {tourDoc.travelStartDate} to {tourDoc.travelEndDate} ({tourDoc.totalDays} Days)</span>
              <span>•</span>
              <span><strong>Root Code:</strong> <span className="font-mono text-amber-400">{tourDoc.tourRootCode}</span></span>
              <span>•</span>
              <span><strong>Guest Key:</strong> <span className="font-mono text-amber-400">{tourDoc.guestKey}</span></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              Scan QR
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              {linkCopied ? 'Link Copied!' : 'Share Portal Link'}
            </button>

            <button
              type="button"
              onClick={handleDownloadTourDocPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Offline Pack...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Offline PDF Pack
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tour Progress Tracker */}
        <div className="mt-5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Safari Itinerary Progress (Day {activeDayIdx + 1} of {itinerary.length}: {currentDay?.destination})
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {Math.round(((activeDayIdx + 1) / itinerary.length) * 100)}% Completed
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${((activeDayIdx + 1) / itinerary.length) * 100}%` }}
            />
          </div>
        </div>

        {/* TourDoc Navigation Menu Bar (African Eagle Style) */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTourDocTab('itinerary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'itinerary'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            1. Day-by-Day Program
          </button>

          <button
            type="button"
            onClick={() => setActiveTourDocTab('vouchers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'vouchers'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            2. Lodge Vouchers ({vouchers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTourDocTab('guide_fleet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'guide_fleet'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            3. Guide &amp; 4x4 Cruiser
          </button>

          <button
            type="button"
            onClick={() => setActiveTourDocTab('flights')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'flights'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            4. Flights &amp; Transfers
          </button>

          <button
            type="button"
            onClick={() => setActiveTourDocTab('emergency')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'emergency'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            5. AMREF &amp; Emergency Cover
          </button>

          <button
            type="button"
            onClick={() => setActiveTourDocTab('briefing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTourDocTab === 'briefing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            6. Safari Briefing &amp; Packing
          </button>
        </div>
      </div>

      {/* Printable Master Container for PDF Export */}
      <div id="tourdoc-printable-pack" className="space-y-6">

        {/* TAB 1: DAY-BY-DAY RUNNING PROGRAM */}
        {activeTourDocTab === 'itinerary' && (
          <div className="space-y-6">
            {/* Interactive Day Strip */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2">
                {itinerary.map((day, idx) => (
                  <button
                    key={`strip-day-${day.dayNumber}`}
                    type="button"
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex flex-col items-center shrink-0 transition-all ${
                      activeDayIdx === idx
                        ? 'bg-slate-900 text-amber-400 shadow-sm ring-2 ring-amber-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Day {day.dayNumber}</span>
                    <span className="text-[10px] font-normal opacity-80 truncate max-w-[100px]">{day.destination}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={activeDayIdx === 0}
                  onClick={() => setActiveDayIdx(p => Math.max(0, p - 1))}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={activeDayIdx === itinerary.length - 1}
                  onClick={() => setActiveDayIdx(p => Math.min(itinerary.length - 1, p + 1))}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Day Detail Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs">
                      Day {currentDay.dayNumber} of {itinerary.length}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Destination: <strong className="text-slate-900">{currentDay.destination}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentDay.title}
                  </h2>
                </div>

                {/* Weather & Sun Widget */}
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-950">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span><strong>26°C</strong> Sunny Safari Sky</span>
                  </div>
                  <div className="h-4 w-px bg-amber-200" />
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Sunrise className="w-4 h-4 text-amber-500" />
                    <span>06:20 AM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Sunset className="w-4 h-4 text-amber-700" />
                    <span>06:40 PM</span>
                  </div>
                </div>
              </div>

              {/* Day Narrative */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                <p>
                  {currentDay.highlightSummary || currentDay.notes || 'Full day game viewing and safari exploration in the wild savannah.'}
                </p>
              </div>

              {/* Live Safari Schedule / Daily Timetable */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Daily Expedition Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Morning */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Sunrise className="w-4 h-4 text-amber-600" /> Morning Safari
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-[11px]">
                      <li><strong>06:00 AM:</strong> Tea, coffee &amp; morning biscuits</li>
                      <li><strong>06:30 AM:</strong> Dawn wildlife game drive (Predators active)</li>
                      <li><strong>08:45 AM:</strong> Bush picnic breakfast or lodge hot buffet</li>
                      <li><strong>10:30 AM:</strong> Exploration of riverbanks &amp; wildlife valleys</li>
                    </ul>
                  </div>

                  {/* Afternoon */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Sun className="w-4 h-4 text-amber-600" /> Afternoon Game Drive
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-[11px]">
                      <li><strong>01:00 PM:</strong> Gourmet lunch at lodge / wilderness camp</li>
                      <li><strong>02:30 PM:</strong> Poolside relaxation or nature briefing</li>
                      <li><strong>03:45 PM:</strong> Prime afternoon game drive until sunset</li>
                      <li><strong>06:00 PM:</strong> Savannah sundowner drinks overlooking plains</li>
                    </ul>
                  </div>

                  {/* Evening */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Sunset className="w-4 h-4 text-amber-600" /> Evening &amp; Dinner
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-[11px]">
                      <li><strong>07:00 PM:</strong> Return to lodge &amp; hot bush shower</li>
                      <li><strong>07:45 PM:</strong> 3-Course gourmet safari dinner</li>
                      <li><strong>09:00 PM:</strong> Campfire storytelling under stars</li>
                      <li><strong>Overnight:</strong> {activeProperty?.name || 'Wilderness Lodge'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lodge & Services on this Day */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Tonight's Accommodation</span>
                  <strong className="text-slate-900 text-sm">{activeProperty?.name || 'Safari Wilderness Lodge'}</strong>
                  <span className="text-amber-800 block text-[11px] font-semibold">{activeProperty?.boardBasis || 'Full Board (FB)'}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Safari Vehicle</span>
                  <strong className="text-slate-900 text-sm">4x4 Custom Land Cruiser</strong>
                  <span className="text-slate-600 block text-[11px]">Driver: {tourDoc.guideName}</span>
                </div>

                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Meals Included</span>
                  <strong className="text-emerald-950 text-sm">Breakfast, Lunch &amp; Dinner</strong>
                  <span className="text-emerald-800 block text-[11px]">Bottled water in vehicle</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: LODGE & SERVICE VOUCHERS HUB */}
        {activeTourDocTab === 'vouchers' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  Confirmed Safari Service Vouchers
                </h3>
                <p className="text-xs text-slate-500">
                  Official accommodation and activity vouchers for your trip. Prepaid and billed to Tusafiri master account.
                </p>
              </div>

              {onNavigateToVouchers && (
                <button
                  type="button"
                  onClick={onNavigateToVouchers}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Manage All Vouchers
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((vch) => (
                <div
                  key={vch.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">VOUCHER: {vch.voucherNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900">{vch.serviceName}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {vch.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">DATES</span>
                      <strong>{vch.checkInDate} {vch.checkOutDate ? `➔ ${vch.checkOutDate}` : ''}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">PLAN</span>
                      <strong className="text-amber-900">{vch.boardBasis || 'Full Board'}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div><strong>Supplier:</strong> {vch.supplierName}</div>
                    <div><strong>Guest:</strong> {vch.leadGuest} ({vch.paxAdults} Adults{vch.paxChildren > 0 ? `, ${vch.paxChildren} Kids` : ''})</div>
                    <div className="text-amber-800 font-medium text-[11px]">{vch.billingInstruction}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SAFARI GUIDE & 4X4 VEHICLE FLEET */}
        {activeTourDocTab === 'guide_fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-xl">
                  {tourDoc.guideName?.split(' ').map(n => n[0]).join('') || 'SG'}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider">
                    Senior Safari Naturalist Guide
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{tourDoc.guideName}</h3>
                  <p className="text-xs text-slate-500">Certified KPSGA Gold / Silver Safari Naturalist</p>
                </div>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Languages:</span>
                  <strong className="text-slate-900">English, Swahili, French (Conversational)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Field Experience:</span>
                  <strong className="text-slate-900">12+ Years in Maasai Mara &amp; Serengeti</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <strong className="text-slate-900">Big Cat Behavior &amp; Ornithology</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Phone:</span>
                  <strong className="text-amber-800 font-mono">{tourDoc.guidePhone}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${tourDoc.guidePhone}`}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  Call Guide Directly
                </a>
                <a
                  href={`https://wa.me/${tourDoc.guidePhone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Guide
                </a>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center text-emerald-700">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider">
                    Custom 4x4 Safari Cruiser
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{tourDoc.vehicleReg}</h3>
                  <p className="text-xs text-slate-500">{tourDoc.vehicleModel}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">
                  On-Board Vehicle Amenities:
                </h4>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-center gap-2">✓ Full Pop-Up Roof Hatch for 360° unobstructed photography</li>
                  <li className="flex items-center gap-2">✓ High-Output 220V/USB Power Inverters at every seat for cameras</li>
                  <li className="flex items-center gap-2">✓ 40L Electric Onboard Cool Box with chilled mineral water &amp; sodas</li>
                  <li className="flex items-center gap-2">✓ Nikon / Bushnell high-magnification safari binoculars on board</li>
                  <li className="flex items-center gap-2">✓ High-frequency VHF 2-way wildlife tracking radio</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Fully inspected, certified, and insured with official commercial safari PSV licenses.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FLIGHTS & AIRSTRIP TRANSFERS */}
        {activeTourDocTab === 'flights' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-sky-600" />
                  Internal Bush Flights &amp; Aviation Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled Cessna Caravan bush flights between Nairobi Wilson (WIL) and wilderness airstrips.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 font-bold text-xs">
                Strict 15kg (33 lbs) Soft Bag Limit
              </span>
            </div>

            <div className="space-y-4">
              {tourDoc.flights.map((flt) => (
                <div
                  key={flt.id}
                  className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E8DFC8] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                        {flt.flightNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{flt.airline}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">{flt.route}</h4>
                    <p className="text-xs text-slate-500">Airstrip: {flt.airstrip} • Date: {flt.date}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure</span>
                      <strong className="text-slate-900 text-sm">{flt.departureTime}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Arrival</span>
                      <strong className="text-slate-900 text-sm">{flt.arrivalTime}</strong>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">PNR Status</span>
                      <strong className="text-emerald-700">{flt.pnrStatus}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Baggage Advisory */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <h4 className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Luggage className="w-4 h-4 text-amber-600" /> Essential Luggage Restriction Advisory:
              </h4>
              <p className="leading-relaxed">
                Bush aircraft have strict weight &amp; spatial limitations. All luggage must be packed in <strong>soft-sided duffel bags</strong> with maximum total weight of <strong>15kg (33 lbs) per passenger</strong>, including hand luggage and camera gear. Hard-shell suitcases cannot fit in aircraft luggage pods.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: EMERGENCY EVACUATION & 24/7 MEDICAL COVER */}
        {activeTourDocTab === 'emergency' && (
          <div className="space-y-6">
            {/* AMREF Card */}
            <div className="bg-linear-to-br from-rose-900 via-rose-950 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-rose-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400">
                    <HeartPulse className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-rose-300 text-[10px] font-bold uppercase tracking-widest block">
                      Emergency Air Ambulance Coverage Included
                    </span>
                    <h3 className="text-xl font-black text-white">
                      AMREF Flying Doctors Airborne Medical Evacuation
                    </h3>
                  </div>
                </div>

                <div className="bg-rose-500/30 border border-rose-400/50 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-rose-200 block font-semibold uppercase">24/7 Emergency Hotline</span>
                  <span className="text-base font-black font-mono text-white">+254 20 699 2000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-rose-100">
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">What Your Coverage Includes:</h4>
                  <ul className="space-y-1.5 text-rose-200">
                    <li>✓ 24/7 Airborne Intensive Care Unit (ICU) air ambulance dispatch</li>
                    <li>✓ Direct airstrip-to-hospital evacuation anywhere in Kenya and Tanzania</li>
                    <li>✓ Full team of certified flight emergency doctors and trauma nurses</li>
                    <li>✓ Direct admission to Nairobi Hospital or Aga Khan University Hospital</li>
                  </ul>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-rose-800/50 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Tusafiri Operations Control:</h4>
                  <p className="text-[11px] text-rose-200 leading-relaxed">
                    Our 24-hour operations command center in Nairobi monitors all safari movements via GPS trackers. In any medical event, your driver-guide activates emergency protocols immediately.
                  </p>
                  <div className="pt-2 border-t border-rose-800/40 flex justify-between font-mono text-xs">
                    <span>Duty Manager:</span>
                    <strong className="text-amber-400">+254 712 345 678</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Directory */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Emergency &amp; Operations Directory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {tourDoc.emergencyContacts.map((contact, cIdx) => (
                  <div key={cIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">{contact.role}</span>
                    <strong className="text-slate-900 block text-sm">{contact.name}</strong>
                    <div className="text-amber-800 font-mono font-bold">{contact.phone}</div>
                    <span className="text-[10px] text-slate-500 block">{contact.availableHours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SAFARI BRIEFING, PACKING & TRAVEL CHECKLIST */}
        {activeTourDocTab === 'briefing' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
            
            {/* Meet & Greet */}
            <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E8DFC8] space-y-2">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                Airport Meet &amp; Greet Protocol
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Upon exiting customs and baggage collection at <strong>{tourDoc.meetAndGreetDetails.airport}</strong>, look for our uniformed Tusafiri representative holding an official Tusafiri signboard with your name: <strong>"{tourDoc.clientName}"</strong>. Our airport officer will assist with luggage and introduce your safari driver-guide.
              </p>
            </div>

            {/* What to Pack Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Luggage className="w-4 h-4 text-indigo-600" /> Safari Packing Essentials
                </h4>
                <ul className="space-y-1.5 text-slate-600 text-[11px]">
                  <li>• Lightweight, breathable cotton clothing in neutral tones (khaki, tan, olive)</li>
                  <li>• Warm fleece or lightweight down jacket for early dawn game drives</li>
                  <li>• Wide-brim safari hat and high-quality polarized sunglasses</li>
                  <li>• High SPF (50+) broad-spectrum sunscreen and insect repellent (DEET based)</li>
                  <li>• High-resolution camera with telephoto lens (100-400mm recommended) + extra memory cards</li>
                  <li>• Personal binoculars (8x42 or 10x42) for wildlife spotting</li>
                  <li>• Universal power adapter (UK 3-pin Type G plug standard in East Africa)</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-600" /> Safari Ethics &amp; Tipping Guidelines
                </h4>
                <ul className="space-y-1.5 text-slate-600 text-[11px]">
                  <li>• <strong>Driver-Guide Gratuity:</strong> Recommended USD 15 – 20 per day per vehicle/group.</li>
                  <li>• <strong>Lodge Staff Tip Box:</strong> Recommended USD 5 – 10 per room per day (distributed to camp team).</li>
                  <li>• <strong>National Park Rules:</strong> Always remain inside the vehicle; no off-road driving; drones strictly forbidden.</li>
                  <li>• <strong>Currency:</strong> USD (notes printed 2013 or newer only) and local Kenyan Shillings (KES) / Tanzanian Shillings (TZS).</li>
                  <li>• <strong>Health:</strong> Yellow Fever vaccination certificate (mandatory for Tanzania border crossing).</li>
                </ul>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900">
              Scan Safari TourDoc QR
            </h3>
            <p className="text-xs text-slate-500">
              Scan with your mobile phone camera to open this running tour document on your phone.
            </p>

            {/* High Definition SVG QR Code Replica */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-300 flex flex-col items-center justify-center relative">
                <QRCodeSVG value={shareableUrl} size={160} level="M" includeMargin={false} />
                <span className="text-[10px] font-mono text-slate-500 mt-2 font-bold tracking-widest">GK: {tourDoc.guestKey}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-mono break-all bg-slate-100 p-2 rounded-lg text-[10px]">
              {shareableUrl}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
