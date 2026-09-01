import React from 'react';
import {
  Compass,
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  Map,
  Building2,
  DollarSign,
  Truck,
  Users,
  Receipt,
  Settings,
  Search,
  ChevronDown,
  Plus,
  ShieldCheck,
  Ticket,
  QrCode,
  LogOut
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { CurrencyCode } from '../types/costing';
import { FX_RATES_DATABASE } from '../data/exchangeRatesData';
import { TusafiriLogo } from './TusafiriLogo';

export type NavigationTab =
  | 'dashboard'
  | 'enquiries'
  | 'bookings'
  | 'itineraries'
  | 'suppliers'
  | 'costing'
  | 'quote'
  | 'vouchers'
  | 'tourdoc'
  | 'fleet'
  | 'guides'
  | 'invoices';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  enquiriesCount?: number;
  bookingsCount?: number;
  onOpenNewEnquiry?: () => void;
  onOpenNewItinerary?: () => void;
  onOpenAddSupplier?: () => void;
  onOpenNewCosting?: () => void;
  onOpenAddVehicle?: () => void;
  onOpenAddGuide?: () => void;
  onOpenRecoveryVault?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedCurrency,
  onCurrencyChange,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  enquiriesCount = 24,
  bookingsCount = 45,
  onOpenNewEnquiry,
  onOpenNewItinerary,
  onOpenAddSupplier,
  onOpenNewCosting,
  onOpenAddVehicle,
  onOpenAddGuide,
  onOpenRecoveryVault,
}) => {
  const mainNavItems: Array<{
    id: NavigationTab;
    label: string;
    icon: any;
    badge?: number;
    quickAction?: () => void;
    quickActionTitle?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, badge: enquiriesCount, quickAction: onOpenNewEnquiry, quickActionTitle: 'New Enquiry' },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList, badge: bookingsCount },
    { id: 'itineraries', label: 'Itineraries', icon: Map, quickAction: onOpenNewItinerary, quickActionTitle: 'Create New Itinerary' },
    { id: 'suppliers', label: 'Suppliers', icon: Building2, quickAction: onOpenAddSupplier, quickActionTitle: 'Add Supplier / Rate' },
    { id: 'costing', label: 'Rates & Costing', icon: DollarSign, quickAction: onOpenNewCosting, quickActionTitle: 'New Costing' },
  ];

  const operationsNavItems: Array<{
    id: NavigationTab;
    label: string;
    icon: any;
    quickAction?: () => void;
    quickActionTitle?: string;
  }> = [
    { id: 'vouchers', label: 'Booking Vouchers', icon: Ticket },
    { id: 'tourdoc', label: 'TourDoc Live Portal', icon: QrCode },
    { id: 'fleet', label: 'Fleet', icon: Truck, quickAction: onOpenAddVehicle, quickActionTitle: 'Add Vehicle' },
    { id: 'guides', label: 'Guides', icon: Users, quickAction: onOpenAddGuide, quickActionTitle: 'Add Guide' },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/90">
        <TusafiriLogo variant="full" theme="dark" size="md" showSubtitle />
        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-medium tracking-wide">ERP &amp; Costing Engine</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            PRO V2
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* Main Section */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-amber-600/15 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <button
                  id={`sidebar-nav-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="flex-1 flex items-center gap-3 text-left py-0.5"
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.quickAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.quickAction?.();
                      }}
                      title={item.quickActionTitle || `Create New ${item.label}`}
                      className="opacity-70 group-hover:opacity-100 hover:scale-110 p-1 rounded-md bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* OPERATIONS Header */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Operations
          </div>
          {operationsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-amber-600/15 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <button
                  id={`sidebar-nav-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="flex-1 flex items-center gap-3 text-left py-0.5"
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>

                {item.quickAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.quickAction?.();
                    }}
                    title={item.quickActionTitle || `Add New ${item.label}`}
                    className="opacity-70 group-hover:opacity-100 hover:scale-110 p-1 rounded-md bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Controls */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2.5">
        {/* Currency Selector */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Currency</span>
          <div className="relative">
            <select
              id="sidebar-currency-selector"
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-slate-800 text-amber-400 font-bold text-xs pl-2 pr-6 py-0.5 rounded border border-slate-700 focus:outline-hidden focus:border-amber-500 appearance-none cursor-pointer"
            >
              {Object.keys(FX_RATES_DATABASE).map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search operations input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Search operations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900/80 text-slate-200 placeholder-slate-400 text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Rate Vault & Recovery Button */}
        {onOpenRecoveryVault && (
          <button
            id="btn-sidebar-recovery-vault"
            type="button"
            onClick={onOpenRecoveryVault}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-100 border border-emerald-800/60 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Rate Protection Vault</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Auto-Protection Active" />
          </button>
        )}

        {/* Settings Button */}
        <button
          id="btn-sidebar-settings"
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span>Settings & Rules</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal">v2.4</span>
        </button>

        {/* Log Out Button */}
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 text-xs font-semibold transition-all group mt-2"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-transform duration-300" />
            <span>Log Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
