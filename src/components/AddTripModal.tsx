import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import { UpcomingTripItem } from '../types/costing';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (trip: UpcomingTripItem) => void;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip,
}) => {
  const [client, setClient] = useState('');
  const [destination, setDestination] = useState('Masai Mara & Serengeti');
  const [travelDate, setTravelDate] = useState('2024-11-15');
  const [pax, setPax] = useState(4);
  const [consultant, setConsultant] = useState('Kato K.');
  const [status, setStatus] = useState<'Confirmed' | 'Pending' | 'Deposit Paid'>('Confirmed');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: UpcomingTripItem = {
      id: `TRIP-${Date.now()}`,
      client: client || 'New Guest Group',
      destination,
      travelDate: new Date(travelDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      pax,
      status: status === 'Confirmed' ? 'Confirmed' : status === 'Deposit Paid' ? 'Confirmed' : 'Pending',
      consultant,
      itineraryDays: 7,
      totalUsd: 12500
    };

    onAddTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Schedule Upcoming Trip</h3>
              <p className="text-xs text-slate-400">Add safari departure to operations manifest</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Guest / Group Name *</label>
            <input
              type="text"
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Harrison Expedition"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Destination Route</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Departure Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Guest Count (Pax)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={pax}
                onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Consultant</label>
              <input
                type="text"
                value={consultant}
                onChange={(e) => setConsultant(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Booking Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Deposit Paid">Deposit Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
            >
              Schedule Departure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
