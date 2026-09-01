import React, { useState } from 'react';
import {
  X,
  Users,
  Award,
  Star,
  Globe,
  Phone,
  Calendar,
  CheckCircle2,
  Upload,
  ArrowRight
} from 'lucide-react';
import { SafariGuide } from '../types/costing';

interface AddGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuide: (guide: SafariGuide) => void;
}

const AVAILABLE_LANGUAGES = ['English', 'Swahili', 'German', 'French', 'Spanish', 'Italian', 'Mandarin', 'Japanese', 'Dutch'];

export const AddGuideModal: React.FC<AddGuideModalProps> = ({
  isOpen,
  onClose,
  onAddGuide
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');

  // Form State
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Senior Naturalist Guide');
  const [certification, setCertification] = useState<string>('KPSGA Silver');
  const [specialty, setSpecialty] = useState<string>('Big Cats & Great Migration');
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [rating, setRating] = useState<number>(4.9);
  const [tripsCompleted, setTripsCompleted] = useState<number>(65);
  const [phone, setPhone] = useState<string>('+254 7');
  const [status, setStatus] = useState<'Available' | 'On Safari' | 'On Leave'>('Available');
  const [currentTrip, setCurrentTrip] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Swahili']);

  // Upload State
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedSuccess, setUploadedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setUploadedSuccess(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newGuide: SafariGuide = {
      id: `guide-${Date.now().toString()}`,
      name: name.trim() || 'Safari Guide',
      role,
      certification,
      specialty,
      experienceYears,
      languages: selectedLanguages.length > 0 ? selectedLanguages : ['English', 'Swahili'],
      rating,
      tripsCompleted,
      phone: phone.trim() || '+254 700 000 000',
      status,
      currentTrip: status === 'On Safari' ? currentTrip || 'Scheduled Departure' : undefined
    };

    onAddGuide(newGuide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Onboard Professional Safari Guide</h3>
              <p className="text-xs text-slate-400">Register certified KPSGA / FGASA naturalist guide or tracker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'border-amber-500 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manual Registration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'border-amber-500 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Upload Guide Roster (CSV/Excel)</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-8 text-center bg-slate-50 relative cursor-pointer transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {uploadFileName ? `Selected: ${uploadFileName}` : 'Click or drag guide roster spreadsheet here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports CSV, XLSX with columns for Name, Certification, Languages, Rating</p>
            </div>

            {uploadedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Roster file parsed successfully! Ready to import guides to database.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddGuide({
                    id: `guide-imp-${Date.now().toString()}`,
                    name: 'Samuel Ole Kipketer',
                    role: 'Senior Naturalist Guide',
                    certification: 'KPSGA Gold',
                    specialty: 'Maasai Mara Apex Predators & Ornithology',
                    experienceYears: 15,
                    languages: ['English', 'Swahili', 'German'],
                    rating: 4.97,
                    tripsCompleted: 156,
                    phone: '+254 722 334 556',
                    status: 'Available'
                  });
                  onClose();
                }}
                disabled={!uploadedSuccess}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  uploadedSuccess
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Complete Import
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Guide Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kiprono Koech, David N., Amara O."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Certification Standard</label>
                <select
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="KPSGA Gold">KPSGA Gold (Master Naturalist)</option>
                  <option value="KPSGA Silver">KPSGA Silver (Advanced Naturalist)</option>
                  <option value="KPSGA Bronze">KPSGA Bronze (Certified Guide)</option>
                  <option value="FGASA Level 2">FGASA Level 2 (Field Guide)</option>
                  <option value="Specialist Tracker">Specialist Field Tracker</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role / Designation</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Senior Naturalist Guide">Senior Naturalist Guide</option>
                  <option value="Driver-Guide">Driver-Guide</option>
                  <option value="Specialist Birding Naturalist">Specialist Birding Naturalist</option>
                  <option value="Walking Safari Specialist">Walking Safari Specialist</option>
                  <option value="Photographic Safari Guide">Photographic Safari Guide</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Big Cats, Ornithology, Photography"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Years of Field Experience</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Guest Review Rating (1-5)</label>
                <input
                  type="number"
                  min="3.0"
                  max="5.0"
                  step="0.05"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value) || 4.9)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / Radio Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 722 123 456"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dispatch Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="Available">Available for Dispatch</option>
                  <option value="On Safari">On Safari (Active)</option>
                  <option value="On Leave">On Leave / Rest</option>
                </select>
              </div>

              {status === 'On Safari' && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Expedition</label>
                  <input
                    type="text"
                    value={currentTrip}
                    onChange={(e) => setCurrentTrip(e.target.value)}
                    placeholder="e.g. Serengeti Luxury Corridor (Day 3/7)"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Languages Multi-select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Languages Spoken</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Onboard Guide</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
