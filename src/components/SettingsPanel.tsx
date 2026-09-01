import React from 'react';
import { Save, Settings, Building2, Percent, Image as ImageIcon } from 'lucide-react';
import { CompanySettings } from '../types/costing';

interface SettingsPanelProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSaveSettings }) => {
  const [localSettings, setLocalSettings] = React.useState<CompanySettings>(settings);

  const handleSave = () => {
    onSaveSettings(localSettings);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Settings</h2>
            <p className="text-xs text-slate-500">Manage your company profile and default quotation parameters.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Company Name
              </label>
              <input
                type="text"
                value={localSettings.companyName}
                onChange={e => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Company Email
              </label>
              <input
                type="email"
                value={localSettings.companyEmail}
                onChange={e => setLocalSettings({ ...localSettings, companyEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-400" /> Default Operator Markup (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={localSettings.defaultMarkupPercent}
                onChange={e => setLocalSettings({ ...localSettings, defaultMarkupPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.showPhotosInItinerary}
                  onChange={e => setLocalSettings({ ...localSettings, showPhotosInItinerary: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">Show Photos in Itinerary Preview</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
