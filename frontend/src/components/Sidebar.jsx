import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, LineChart, Clock, Bell, Settings, ChevronLeft, ChevronRight, LogOut, MoreVertical, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* User info & Menu */}
          <div className="relative mt-2" ref={menuRef}>
            {/* The Popup Menu */}
            {showUserMenu && (
              <div 
                className={`absolute bottom-full mb-2 ${isOpen ? 'left-0 w-full' : 'left-14 w-48'} bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-200`}
              >
                <NavLink 
                  to="/app/profile" 
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-text-main hover:bg-gray-50 transition-colors w-full"
                >
                  <User className="w-4 h-4 shrink-0 text-gray-600" />
                  <span className="text-sm font-medium">Profile</span>
                </NavLink>
                <div className="h-px bg-gray-100 my-1 w-full"></div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center ${isOpen ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 hover:bg-gray-50 rounded-xl transition-colors`}
              title={!isOpen ? user?.name ?? 'User Menu' : ''}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                {isOpen && (
                  <div className="overflow-hidden text-left">
                    <p className="text-[14px] text-text-main font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {user?.name ?? 'User'}
                    </p>
                    <p className="text-[12px] text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                      {user?.email ?? ''}
                    </p>
                  </div>
                )}
              </div>
              {isOpen && <MoreVertical className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
