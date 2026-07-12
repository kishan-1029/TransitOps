# Feature Map (PDF → Code)

## Authentication & RBAC

| Requirement | Where |
|-------------|--------|
| Email/password login | `server/src/controllers/authController.js`, `client/src/pages/LoginPage.jsx` |
| RBAC 4 roles (+ DRIVER) | `server/prisma/schema.prisma` `Role` enum, `server/src/utils/rbac.js` |
| Lock after 5 fails | `authController.js` `MAX_ATTEMPTS` |
| Sidebar filtered by role | `client/src/layouts/AppLayout.jsx` |

## Dashboard KPIs + filters

| KPI | API | UI |
|-----|-----|-----|
| Active / Available / In Maint / Active Trips / Pending / Drivers on Duty / Utilization % | `dashboardController.js` → `dashboardKpis` | `DashboardPage.jsx` |
| Filters type / status / region | query params on same endpoint | filter selects on Dashboard |

## Vehicle Registry

| Field | Model | UI |
|-------|-------|-----|
| Reg No (unique), Name, Type, Capacity, Odometer, Acq Cost, Status | `prisma/schema.prisma` `Vehicle` | `FleetPage.jsx` |
| Statuses Available, OnTrip, InShop, Retired | enum `VehicleStatus` | `StatusBadge` |
| Unique reg enforcement | `vehicleController.js` 409 | form error |

## Drivers & Safety

| Feature | Where |
|---------|--------|
| License expiry + EXPIRED / days left | `DriversPage.jsx`, `driverController` enrich |
| Safety score edit | PATCH drivers + Edit score modal |
| Block expired/suspended on trip | `tripService.js` `assertDriverAssignable` |
| Compliance alerts on dashboard | `dashboardKpis` → `licenseAlerts` |

## Trips

| Rule | `tripService.js` |
|------|------------------|
| Capacity check | `assertCapacity` |
| Dispatch → On Trip | `dispatchTrip` |
| Complete → Available + fuel log | `completeTrip` |
| Cancel dispatched → Available | `cancelTrip` |
| UI | `TripsPage.jsx` |

## Maintenance / Fuel / Analytics

| Feature | Backend | Frontend |
|---------|---------|----------|
| Maint → In Shop | `maintenanceService.js` | `MaintenancePage.jsx` |
| Fuel + expenses + ops cost | `fuelController.js` | `FuelPage.jsx` |
| Fuel efficiency, util, cost, ROI | `analyticsSummary` | `AnalyticsPage.jsx` |
| CSV export | `exportCsv` | Export CSV button |
| PDF | browser Print | Print / PDF button |

## Theme

| Feature | Where |
|---------|--------|
| Light / Dark | `ThemeContext.jsx`, `index.css` `[data-theme]` |
| Toggle | Login + App header |
