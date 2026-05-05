import React from 'react';
import { LayoutDashboard, Camera, LineChart, Clock, Bell, Settings, ChevronLeft } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'snapfood', label: 'Snap-Food Tracker', icon: Camera },
    { id: 'forecaster', label: 'Health Forecaster', icon: LineChart },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-orange-light flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-extrabold text-brand-orange text-xl tracking-tight">Habitscape</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-4 h-4 text-gray-900" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 mt-8 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${
              activePage === item.id 
                ? 'bg-brand-orange-light text-brand-orange-dark' 
                : 'text-text-main hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activePage === item.id ? '' : 'text-gray-700'}`} />
            <span className={`text-[16px] ${activePage === item.id ? 'font-medium' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="px-4 pb-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-text-main hover:bg-gray-50 rounded-lg">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="text-[16px]">Notifications</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-text-main hover:bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5 text-gray-700" />
            <span className="text-[16px]">Setting</span>
          </a>
          
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              {/* Avatar placeholder */}
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Morgan" className="w-full h-full object-cover" />
            </div>
            <span className="text-[16px] text-text-main font-medium">Alex Morgan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
