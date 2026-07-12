import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './pages/FleetPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelPage from './pages/FuelPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)] text-[var(--color-muted)]">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ModuleGate({ module, children }) {
  const { can } = useAuth();
  if (!can(module, 'view')) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<ModuleGate module="dashboard"><DashboardPage /></ModuleGate>} />
        <Route path="fleet" element={<ModuleGate module="fleet"><FleetPage /></ModuleGate>} />
        <Route path="drivers" element={<ModuleGate module="drivers"><DriversPage /></ModuleGate>} />
        <Route path="trips" element={<ModuleGate module="trips"><TripsPage /></ModuleGate>} />
        <Route path="maintenance" element={<ModuleGate module="maintenance"><MaintenancePage /></ModuleGate>} />
        <Route path="fuel" element={<ModuleGate module="fuel"><FuelPage /></ModuleGate>} />
        <Route path="analytics" element={<ModuleGate module="analytics"><AnalyticsPage /></ModuleGate>} />
        <Route path="settings" element={<ModuleGate module="settings"><SettingsPage /></ModuleGate>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
