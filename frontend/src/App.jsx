import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SnapFoodTracker from './pages/SnapFoodTracker';
import History from './pages/History';
import HealthForecaster from './pages/HealthForecaster';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Guards ──────────────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /login.
 * Preserves the intended destination so we can redirect back after login (optional future feature).
 */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/**
 * Redirects already-logged-in users away from /login and /register → /app.
 */
function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/app" replace /> : children;
}

// ─── App Shell (requires auth) ────────────────────────────────────────────────

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex min-h-screen bg-bg-main font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 w-full min-w-0 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="snapfood" element={<SnapFoodTracker />} />
          <Route path="history" element={<History />} />
          <Route path="forecaster" element={<HealthForecaster />} />
        </Routes>
      </div>
    </div>
  );
}

// ─── Root Router ──────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only routes: logged-in users bounce to /app */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected app shell */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
