import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Fuel,
  Calendar,
  User,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { FleetVehicle } from '../types/costing';
import { INITIAL_FLEET } from '../data/operationsData';
import { AddVehicleModal } from './AddVehicleModal';

interface FleetViewProps {
  vehicles?: FleetVehicle[];
  onAddVehicle?: (vehicle: FleetVehicle) => void;
  onOpenAddVehicleModal?: () => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  vehicles: initialVehicles,
  onAddVehicle: externalAddVehicle,
  onOpenAddVehicleModal
}) => {
  const [internalVehicles, setInternalVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem('tusafiri_fleet_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_FLEET;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const vehicles = initialVehicles || internalVehicles;

  const handleAddVehicle = (vehicle: FleetVehicle) => {
    if (externalAddVehicle) {
      externalAddVehicle(vehicle);
    } else {
      setInternalVehicles(prev => {
        const updated = [vehicle, ...prev];
        try {
          localStorage.setItem('tusafiri_fleet_v2', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const filtered = vehicles.filter(v => {
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesSearch =
      v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.currentDriver && v.currentDriver.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.location && v.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Safari Fleet & Vehicle Dispatch
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              {vehicles.length} Units in Depot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Custom-built 4x4 safari land cruisers, pop-up roofs, radio telemetry & scheduled servicing
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plates, drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            aria-label="Filter fleet vehicles by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Statuses ({vehicles.length})</option>
            <option value="On Safari">On Safari</option>
            <option value="Available">Available</option>
            <option value="In Maintenance">In Maintenance</option>
          </select>

          <button
            id="btn-add-fleet-vehicle"
            type="button"
            onClick={() => {
              if (onOpenAddVehicleModal) onOpenAddVehicleModal();
              else setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((veh, idx) => (
          <div
            key={`${veh.id}-${veh.regNumber || idx}`}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  {veh.regNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{veh.model}</h3>
                <span className="text-[11px] text-slate-500">{veh.vehicleType} • Year {veh.year}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  veh.status === 'On Safari'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : veh.status === 'Available'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {veh.status}
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Assigned Guide:
                </span>
                <strong className="text-slate-900">{veh.currentDriver || 'Depot'}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  Mileage:
                </span>
                <span className="font-mono font-medium">{veh.mileageKm.toLocaleString()} km</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  Last Service:
                </span>
                <span className="text-slate-700">{veh.lastServiceDate}</span>
              </div>
            </div>

            {veh.location && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Current Location / Route</span>
                <span className="font-semibold text-slate-900">{veh.location}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Internal Modal fallback */}
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />
    </div>
  );
};
