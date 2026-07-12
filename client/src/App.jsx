import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import { AuthFallback, RouteFallback } from './components/Skeleton';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FleetPage = lazy(() => import('./pages/FleetPage'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const FuelPage = lazy(() => import('./pages/FuelPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ModuleGate({ module, children }) {
  const { can } = useAuth();
  if (!can(module, 'view')) return <Navigate to="/" replace />;
  return children;
}

function LazyPage({ module, children }) {
  return (
    <ModuleGate module={module}>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </ModuleGate>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<AuthFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route
          index
          element={
            <LazyPage module="dashboard">
              <DashboardPage />
            </LazyPage>
          }
        />
        <Route
          path="fleet"
          element={
            <LazyPage module="fleet">
              <FleetPage />
            </LazyPage>
          }
        />
        <Route
          path="drivers"
          element={
            <LazyPage module="drivers">
              <DriversPage />
            </LazyPage>
          }
        />
        <Route
          path="trips"
          element={
            <LazyPage module="trips">
              <TripsPage />
            </LazyPage>
          }
        />
        <Route
          path="maintenance"
          element={
            <LazyPage module="maintenance">
              <MaintenancePage />
            </LazyPage>
          }
        />
        <Route
          path="fuel"
          element={
            <LazyPage module="fuel">
              <FuelPage />
            </LazyPage>
          }
        />
        <Route
          path="analytics"
          element={
            <LazyPage module="analytics">
              <AnalyticsPage />
            </LazyPage>
          }
        />
        <Route
          path="settings"
          element={
            <LazyPage module="settings">
              <SettingsPage />
            </LazyPage>
          }
        />
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
