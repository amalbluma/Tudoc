import React, { useState } from 'react';
import {
  X,
  Truck,
  User,
  Fuel,
  Wrench,
  Upload,
  CheckCircle2,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { FleetVehicle } from '../types/costing';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: FleetVehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');

  // Form state
  const [regNumber, setRegNumber] = useState<string>('');
  const [model, setModel] = useState<string>('Toyota Land Cruiser 79 Series (Custom Safari Spec)');
  const [vehicleType, setVehicleType] = useState<'4x4 Safari Land Cruiser' | 'Extended Land Cruiser' | 'Safari Minivan' | 'Overland Truck'>('4x4 Safari Land Cruiser');
  const [year, setYear] = useState<number>(2024);
  const [capacity, setCapacity] = useState<number>(7);
  const [currentDriver, setCurrentDriver] = useState<string>('Available at Depot');
  const [status, setStatus] = useState<'Available' | 'On Safari' | 'In Maintenance'>('Available');
  const [location, setLocation] = useState<string>('Nairobi Operations Depot');
  const [mileageKm, setMileageKm] = useState<number>(18500);
  const [lastServiceDate, setLastServiceDate] = useState<string>('2026-08-01');

  // Upload state
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadedSuccess, setUploadedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setUploadedSuccess(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVehicle: FleetVehicle = {
      id: `veh-${Date.now().toString()}`,
      regNumber: regNumber.trim().toUpperCase() || 'KDG 900P',
      model: model.trim() || 'Toyota Land Cruiser Safari Spec',
      vehicleType,
      year,
      capacity,
      status,
      currentDriver: currentDriver.trim() || 'Depot',
      location: location.trim() || 'Nairobi Depot',
      mileageKm,
      lastServiceDate
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Register Safari Fleet Vehicle</h3>
              <p className="text-xs text-slate-400">Add 4x4 cruiser, pop-up top spec or dispatch transport unit</p>
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
            <Truck className="w-3.5 h-3.5" />
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
            <span>Upload Fleet Registry (CSV/Excel)</span>
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
                {uploadFileName ? `Selected: ${uploadFileName}` : 'Click or drag fleet registry spreadsheet here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports CSV, XLSX with columns for Plate, Model, Capacity, Status</p>
            </div>

            {uploadedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Registry file validated! Ready to import vehicles into operations depot.</span>
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
                  // Import sample batch
                  onAddVehicle({
                    id: `veh-imp-${Date.now().toString()}`,
                    regNumber: 'KDH 312M',
                    model: 'Toyota Land Cruiser 79 Extended (V8)',
                    vehicleType: 'Extended Land Cruiser',
                    year: 2024,
                    capacity: 7,
                    status: 'Available',
                    currentDriver: 'Depot Stock',
                    location: 'Nairobi Operations Hub',
                    mileageKm: 12400,
                    lastServiceDate: '2026-08-10'
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Registration Number / Plate</label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. KDG 839P or T 482 DWY"
                  className="w-full text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Type Spec</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="4x4 Safari Land Cruiser">4x4 Safari Land Cruiser</option>
                  <option value="Extended Land Cruiser">Extended Land Cruiser (7 Pax)</option>
                  <option value="Safari Minivan">Safari Minivan (Pop-Up)</option>
                  <option value="Overland Truck">Overland Truck (16+ Pax)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Make & Model Description</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Toyota Land Cruiser 79 Series Pop-Up Roof with HF Radio & Inverter"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Model Year</label>
                <input
                  type="number"
                  min="2015"
                  max="2027"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Window Seats Capacity</label>
                <input
                  type="number"
                  min="4"
                  max="30"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 7)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="Available">Available (In Depot)</option>
                  <option value="On Safari">On Safari (Dispatched)</option>
                  <option value="In Maintenance">In Maintenance / Workshop</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Driver / Guide</label>
                <input
                  type="text"
                  value={currentDriver}
                  onChange={(e) => setCurrentDriver(e.target.value)}
                  placeholder="e.g. David N. or Unassigned"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Depot / Base Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nairobi Hub, Arusha, Maasai Mara"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mileage (Km)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={mileageKm}
                  onChange={(e) => setMileageKm(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
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
                <Truck className="w-4 h-4" />
                <span>Register Vehicle</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
