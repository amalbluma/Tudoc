import React, { useState } from 'react';
import {
  X,
  Settings,
  Building,
  DollarSign,
  Percent,
  Calendar,
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { CompanySettings, CurrencyCode } from '../types/costing';
import { INITIAL_COMPANY_SETTINGS } from '../data/operationsData';
import { TusafiriLogo } from './TusafiriLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSaveSettings,
}) => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings || INITIAL_COMPANY_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'commercial' | 'seasons' | 'integrations'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Settings & Safari Rules</h2>
              <p className="text-xs text-slate-400">Configure company defaults, margins, FX rates & tariffs</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-5 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'general'
                ? 'border-amber-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commercial')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'commercial'
                ? 'border-amber-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Margins & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seasons')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'seasons'
                ? 'border-amber-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Seasons & Pax Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'integrations'
                ? 'border-amber-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI & Tariffs</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              {/* Brand Logo Identity Card */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700 block">
                    Official Brand Identity
                  </span>
                  <p className="text-xs text-slate-600 mb-2">
                    East Africa continent contour &amp; signature typography active across all proposals &amp; invoices.
                  </p>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-xs">Custom Logo (Base64 / URL)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSettings({ ...settings, companyLogoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs"
                    />
                    {settings.companyLogoUrl && (
                      <button 
                        type="button" 
                        onClick={() => setSettings({ ...settings, companyLogoUrl: '' })}
                        className="ml-2 text-[10px] text-red-500 hover:underline"
                      >
                        Remove Custom Logo
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E8DFC8] shadow-2xs max-w-[150px]">
                  {settings.companyLogoUrl ? (
                    <img src={settings.companyLogoUrl} alt="Company Logo" className="w-full object-contain max-h-16" />
                  ) : (
                    <TusafiriLogo variant="full" theme="light" size="md" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Office Address / Operations Hub</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tax ID / PIN</label>
                  <input
                    type="text"
                    value={settings.taxPinNumber}
                    onChange={(e) => setSettings({ ...settings, taxPinNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tourism License #</label>
                  <input
                    type="text"
                    value={settings.licenseNumber}
                    onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMERCIAL TAB */}
          {activeTab === 'commercial' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-slate-800 font-bold">Default Operator Markup (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="5"
                      max="40"
                      value={settings.defaultOperatorMarkupPercent}
                      onChange={(e) => setSettings({ ...settings, defaultOperatorMarkupPercent: parseFloat(e.target.value) || 20 })}
                      className="w-20 bg-white border border-slate-300 rounded-lg p-2 font-bold text-center text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-slate-500 font-medium">% Gross markup</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Applied automatically when building new safari costings.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-slate-800 font-bold">Default Agency Commission (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={settings.defaultAgencyCommissionPercent}
                      onChange={(e) => setSettings({ ...settings, defaultAgencyCommissionPercent: parseFloat(e.target.value) || 10 })}
                      className="w-20 bg-white border border-slate-300 rounded-lg p-2 font-bold text-center text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-slate-500 font-medium">% Travel trade / B2B</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Standard agency kickback for international tour operators.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-slate-800 font-bold">Base Operational Currency</label>
                  <select
                    value={settings.baseCurrency}
                    onChange={(e) => setSettings({ ...settings, baseCurrency: e.target.value as CurrencyCode })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="TZS">TZS (TSh)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-slate-800 font-bold">VAT / Tourism Levy Tax (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="25"
                      value={settings.vatPercentage}
                      onChange={(e) => setSettings({ ...settings, vatPercentage: parseFloat(e.target.value) || 16 })}
                      className="w-20 bg-white border border-slate-300 rounded-lg p-2 font-bold text-center text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-slate-500 font-medium">% Statutory VAT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEASONS TAB */}
          {activeTab === 'seasons' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <h4 className="font-bold text-amber-950">Peak Wildebeest Migration Window</h4>
                <p className="text-slate-600">
                  During peak season (July 01 – October 31 & Dec 20 – Jan 05), STO high season rates and Narok County $200 park fees apply.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Child Age for Discount</label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={settings.childMaxAge}
                    onChange={(e) => setSettings({ ...settings, childMaxAge: parseInt(e.target.value) || 11 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Single Room Supplement (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.singleSupplementPercent}
                    onChange={(e) => setSettings({ ...settings, singleSupplementPercent: parseFloat(e.target.value) || 30 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900">Gemini 3.7 Flash AI Engine</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Connected (Server-Side)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Powering AI Contract Rate Extraction, Day Description Generator, and Itinerary highlights.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-900">KWS & TANAPA Tariff Synchronizer</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Synchronized (2024-2026)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Kenya Wildlife Service (KWS) and Tanzania National Parks Authority (TANAPA) active database.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
