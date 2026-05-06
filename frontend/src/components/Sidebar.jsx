import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, LineChart, Clock, Bell, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'snapfood',   label: 'Snap-Food Tracker',  icon: Camera },
    { id: 'forecaster', label: 'Health Forecaster',  icon: LineChart },
    { id: 'history',    label: 'History',            icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate initials avatar from user's name
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

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
            title={!isOpen ? item.label : ''}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg w-full text-left transition-colors ${
                isActive
                  ? 'bg-brand-orange-light text-brand-orange-dark font-medium'
                  : 'text-text-main hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-gray-700'}`} />
                {isOpen && <span className="text-[16px] whitespace-nowrap">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <a href="#" title={!isOpen ? 'Notifications' : ''} className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 text-text-main hover:bg-gray-50 rounded-lg transition-colors`}>
            <Bell className="w-5 h-5 shrink-0 text-gray-700" />
            {isOpen && <span className="text-[16px] whitespace-nowrap">Notifications</span>}
          </a>
          <a href="#" title={!isOpen ? 'Settings' : ''} className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 text-text-main hover:bg-gray-50 rounded-lg transition-colors`}>
            <Settings className="w-5 h-5 shrink-0 text-gray-700" />
            {isOpen && <span className="text-[16px] whitespace-nowrap">Settings</span>}
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!isOpen ? 'Log Out' : ''}
            className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full text-left`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span className="text-[16px] whitespace-nowrap">Log Out</span>}
          </button>

          {/* User info */}
          <div
            className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 mt-1`}
            title={!isOpen ? user?.name ?? 'User' : ''}
          >
            {/* Initials avatar — no external request needed */}
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-[15px] text-text-main font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[12px] text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.email ?? ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
