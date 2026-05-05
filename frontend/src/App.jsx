import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SnapFoodTracker from './pages/SnapFoodTracker';
import History from './pages/History';
import HealthForecaster from './pages/HealthForecaster';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-bg-main font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'snapfood' && <SnapFoodTracker />}
      {activePage === 'history' && <History />}
      {activePage === 'forecaster' && <HealthForecaster />}
    </div>
  );
}

export default App;

