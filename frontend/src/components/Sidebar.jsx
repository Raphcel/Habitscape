import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, LineChart, Clock, Bell, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'snapfood', label: 'Snap-Food Tracker', icon: Camera },
    { id: 'forecaster', label: 'Health Forecaster', icon: LineChart },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <aside className={`bg-white border-r border-brand-orange-light flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Header */}
      <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center flex-col gap-4'}`}>
        <div className={`flex items-center gap-2 ${!isOpen && 'hidden'}`}>
          <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-extrabold text-brand-orange text-xl tracking-tight whitespace-nowrap">Habitscape</span>
        </div>
        {!isOpen && (
          <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shrink-0" title="Habitscape">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors">
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 mt-8 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/app/${item.id}`}
            title={!isOpen ? item.label : ""}
            className={({ isActive }) => `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg w-full text-left transition-colors ${
              isActive 
                ? 'bg-brand-orange-light text-brand-orange-dark font-medium' 
                : 'text-text-main hover:bg-gray-50'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-gray-700'}`} />
                {isOpen && (
                  <span className="text-[16px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="px-4 pb-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <a href="#" title={!isOpen ? "Notifications" : ""} className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 text-text-main hover:bg-gray-50 rounded-lg transition-colors`}>
            <Bell className="w-5 h-5 shrink-0 text-gray-700" />
            {isOpen && <span className="text-[16px] whitespace-nowrap">Notifications</span>}
          </a>
          <a href="#" title={!isOpen ? "Setting" : ""} className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 text-text-main hover:bg-gray-50 rounded-lg transition-colors`}>
            <Settings className="w-5 h-5 shrink-0 text-gray-700" />
            {isOpen && <span className="text-[16px] whitespace-nowrap">Setting</span>}
          </a>
          
          <div className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 mt-2`} title={!isOpen ? "Alex Morgan" : ""}>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden shrink-0">
              {/* Avatar placeholder */}
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Morgan" className="w-full h-full object-cover" />
            </div>
            {isOpen && <span className="text-[16px] text-text-main font-medium whitespace-nowrap overflow-hidden text-ellipsis">Alex Morgan</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}
