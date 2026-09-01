import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Star,
  Award,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Upload
} from 'lucide-react';
import { SafariGuide } from '../types/costing';
import { INITIAL_GUIDES } from '../data/operationsData';
import { AddGuideModal } from './AddGuideModal';

interface GuidesViewProps {
  guides?: SafariGuide[];
  onAddGuide?: (guide: SafariGuide) => void;
  onOpenAddGuideModal?: () => void;
}

export const GuidesView: React.FC<GuidesViewProps> = ({
  guides: initialGuides,
  onAddGuide: externalAddGuide,
  onOpenAddGuideModal
}) => {
  const [internalGuides, setInternalGuides] = useState<SafariGuide[]>(() => {
    try {
      const saved = localStorage.getItem('tusafiri_guides_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_GUIDES;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [certFilter, setCertFilter] = useState<string>('All');

  const guides = initialGuides || internalGuides;

  const handleAddGuide = (guide: SafariGuide) => {
    if (externalAddGuide) {
      externalAddGuide(guide);
    } else {
      setInternalGuides(prev => {
        const updated = [guide, ...prev];
        try {
          localStorage.setItem('tusafiri_guides_v2', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const filtered = guides.filter(g => {
    const matchesCert = certFilter === 'All' || g.certification.includes(certFilter);
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.specialty.toLowerCase().includes(search.toLowerCase()) ||
      g.languages.some(l => l.toLowerCase().includes(search.toLowerCase()));
    return matchesCert && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Professional Safari Guides & Trackers
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              {guides.length} Naturalists Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            KPSGA Bronze/Silver/Gold certified naturalist driver-guides, birding specialists & trackers
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={certFilter}
            onChange={(e) => setCertFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Certifications</option>
            <option value="Gold">KPSGA Gold</option>
            <option value="Silver">KPSGA Silver</option>
            <option value="Bronze">KPSGA Bronze</option>
          </select>

          <button
            id="btn-add-guide"
            type="button"
            onClick={() => {
              if (onOpenAddGuideModal) onOpenAddGuideModal();
              else setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Guide</span>
          </button>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guide) => (
          <div
            key={guide.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                  {guide.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{guide.name}</h3>
                  <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>{guide.certification}</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  guide.status === 'On Safari'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : guide.status === 'Available'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {guide.status}
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-600">
                <span>Specialty:</span>
                <strong className="text-slate-900">{guide.specialty}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Experience:</span>
                <span className="font-semibold">{guide.experienceYears} Years in Field</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Rating:</span>
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{guide.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                <span>Languages:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {guide.languages.map(l => (
                    <span key={l} className="bg-white px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700 border border-slate-200">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {guide.currentTrip && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Current Dispatch</span>
                <span className="font-semibold text-slate-900">{guide.currentTrip}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Internal Modal Fallback */}
      <AddGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGuide={handleAddGuide}
      />
    </div>
  );
};
