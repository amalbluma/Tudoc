import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Compass,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Clock,
  Tag,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { EnquiryItem, ItineraryType, TravelStyleTier } from '../types/costing';

interface NewEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEnquiry: (enquiry: EnquiryItem) => void;
  onCurateItinerary?: (enquiry: EnquiryItem) => void;
  onOpenCosting?: (enquiry: EnquiryItem) => void;
}

export const NewEnquiryModal: React.FC<NewEnquiryModalProps> = ({
  isOpen,
  onClose,
  onAddEnquiry,
  onCurateItinerary,
  onOpenCosting,
}) => {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('Maasai Mara & Serengeti Migration Circuit');
  const [itineraryType, setItineraryType] = useState<ItineraryType>('fit');
  const [travelStartDate, setTravelStartDate] = useState('2026-08-15');
  const [durationDays, setDurationDays] = useState(7);
  const [travelEndDate, setTravelEndDate] = useState('2026-08-22');
  const [travelStyleTier, setTravelStyleTier] = useState<string>('Semi-Luxury / Premium Classic');
  const [paxAdults, setPaxAdults] = useState(2);
  const [paxChildren, setPaxChildren] = useState(0);
  const [budget, setBudget] = useState(9500);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'Web Direct' | 'SafariBookings' | 'Agent Lead' | 'Referral' | 'Repeat Client'>('Web Direct');

  // Auto-calculate end date when start date or duration changes
  useEffect(() => {
    if (travelStartDate && durationDays > 0) {
      const start = new Date(travelStartDate);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays);
        setTravelEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [travelStartDate, durationDays]);

  if (!isOpen) return null;

  const buildEnquiryData = (): EnquiryItem => {
    return {
      id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName.trim() || 'New Safari Client',
      email: email.trim() || 'client@example.com',
      phone: phone.trim() || '+1 555-0199',
      destination,
      travelMonth: travelStartDate
        ? new Date(travelStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Aug 2026',
      travelStartDate,
      travelEndDate,
      durationDays,
      travelStyleTier,
      itineraryType,
      paxAdults,
      paxChildren,
      estimatedBudgetUsd: budget,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      source,
      assignedTo: 'Kato K.',
      notes: notes.trim() || 'Interested in private game drives and luxury safari camps.',
    };
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const enquiry = buildEnquiryData();
    onAddEnquiry(enquiry);
    onClose();
  };

  const handleSaveAndCurate = (e: React.MouseEvent) => {
    e.preventDefault();
    const enquiry = buildEnquiryData();
    onAddEnquiry(enquiry);
    if (onCurateItinerary) {
      onCurateItinerary(enquiry);
    }
    onClose();
  };

  const handleSaveAndCosting = (e: React.MouseEvent) => {
    e.preventDefault();
    const enquiry = buildEnquiryData();
    onAddEnquiry(enquiry);
    if (onOpenCosting) {
      onOpenCosting(enquiry);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Client Intake & Safari Pipeline</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  Step 1 of 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter client specs and seamlessly proceed to Itinerary Curation & Quote Workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveOnly} className="p-6 space-y-5 text-xs">
          {/* Section 1: Client & Contact Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              Client & Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Lead / Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dr. Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor@vance-travel.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +44 20 7946 0912"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Circuit & Category */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Safari Scope & Circuit
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Destination Circuit</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Maasai Mara & Serengeti Migration Circuit">Maasai Mara & Serengeti Migration (Classic)</option>
                  <option value="Tanzania Northern Safari (Tarangire, Ngorongoro & Serengeti)">Tanzania Northern Safari (Tarangire, Ngorongoro & Serengeti)</option>
                  <option value="Kenya Bush & Beach (Amboseli, Mara & Diani)">Kenya Bush & Beach (Amboseli, Mara & Diani)</option>
                  <option value="Amboseli Kilimanjaro & Tsavo Expedition">Amboseli Kilimanjaro & Tsavo Expedition</option>
                  <option value="Rwanda Gorilla Trekking & Akagera Safari">Rwanda Gorilla Trekking & Akagera Safari</option>
                  <option value="Zanzibar Spice Island & Serengeti Fly-In">Zanzibar Spice Island & Serengeti Fly-In</option>
                  <option value="Uganda Primates & Queen Elizabeth NP">Uganda Primates & Queen Elizabeth NP</option>
                  <option value="Custom Bespoke Circuit">Custom Bespoke Circuit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Itinerary Category</label>
                <select
                  value={itineraryType}
                  onChange={(e) => setItineraryType(e.target.value as ItineraryType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="fit">FIT (Bespoke / Tailormade)</option>
                  <option value="group">Group Charter / Private Club</option>
                  <option value="scheduled_departure">Scheduled Fixed Departure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                <input
                  type="date"
                  value={travelStartDate}
                  onChange={(e) => setTravelStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                    className="w-20 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-600 font-semibold">
                    Days ({Math.max(1, durationDays - 1)} Nights)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Travel Style & Tier</label>
                <select
                  value={travelStyleTier}
                  onChange={(e) => setTravelStyleTier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Budget / Camping Safari">Budget / Camping Safari (Value)</option>
                  <option value="Mid-Range / Standard Comfort">Mid-Range / Standard Comfort (3-4 Star)</option>
                  <option value="Semi-Luxury / Premium Classic">Semi-Luxury / Premium Classic (4.5 Star)</option>
                  <option value="Luxury Tented Safari (5-Star)">Luxury Tented Safari (5-Star)</option>
                  <option value="Ultra-Luxury / Connoisseur VIP">Ultra-Luxury / Connoisseur VIP</option>
                  <option value="Flying Safari Express">Flying Safari Express (Fly-In)</option>
                  <option value="Family & Conservation Safari">Family & Conservation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Pax & Budget */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Guests & Budget Target
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Adults (12+)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={paxAdults}
                  onChange={(e) => setPaxAdults(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kids (2-11)</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={paxChildren}
                  onChange={(e) => setPaxChildren(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Est. Target Budget ($)</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 5000)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Client Wishes & Special Requests</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hot air balloon over Mara, private naturalist guide, photography focus, luxury tented suite with plunge pool."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action Buttons: Fluid Pipeline */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer flex-1 sm:flex-initial text-center"
              >
                Save to CRM Only
              </button>

              <button
                type="button"
                onClick={handleSaveAndCosting}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Costing Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndCurate}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
              >
                <Sparkles className="w-4 h-4" />
                <span>Curate Itinerary & Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
