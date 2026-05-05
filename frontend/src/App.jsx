import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SnapFoodTracker from './pages/SnapFoodTracker';
import History from './pages/History';
import HealthForecaster from './pages/HealthForecaster';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

function AppLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  
  return (
    <div className="flex min-h-screen bg-bg-main font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 w-full min-w-0">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'snapfood' && <SnapFoodTracker />}
        {activePage === 'history' && <History />}
        {activePage === 'forecaster' && <HealthForecaster />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

