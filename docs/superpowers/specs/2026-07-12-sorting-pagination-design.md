# 2026-07-12-sorting-pagination-design

Add sorting (ascending/descending) by columns and pagination to all data list displays in TransitOps (Vehicles, Drivers, Trips, Maintenance, and Fuel logs).

## Proposed Changes

### Backend Changes

#### [NEW] [query.js](file:///E:/TransitOps/TransitOps/server/src/utils/query.js)
- A helper function `getPaginatedAndSorted({ model, req, where, include, defaultSort, mapFn })` to wrap Prisma queries.
- Parses `page`, `limit`, `sortBy`, and `sortOrder`.
- Supports nested sorting (e.g. `vehicle.name`).
- If `page` query param is not supplied, returns a flat array to prevent breaking existing API consumers. If `page` is supplied, returns `{ items, pagination: { page, limit, totalPages, totalCount } }`.

#### [MODIFY] [vehicleController.js](file:///E:/TransitOps/TransitOps/server/src/controllers/vehicleController.js)
- Refactor `listVehicles` to use the helper.

#### [MODIFY] [driverController.js](file:///E:/TransitOps/TransitOps/server/src/controllers/driverController.js)
- Refactor `listDrivers` to use the helper.

#### [MODIFY] [tripController.js](file:///E:/TransitOps/TransitOps/server/src/controllers/tripController.js)
- Refactor `listTrips` to use the helper.

#### [MODIFY] [maintenanceController.js](file:///E:/TransitOps/TransitOps/server/src/controllers/maintenanceController.js)
- Refactor `listMaintenance` to use the helper.

#### [MODIFY] [fuelController.js](file:///E:/TransitOps/TransitOps/server/src/controllers/fuelController.js)
- Refactor `listFuel` and `listExpenses` to use the helper.

### Frontend Changes

#### [NEW] [Pagination.jsx](file:///E:/TransitOps/TransitOps/client/src/components/ui/Pagination.jsx)
- A reusable component to render the current page and handle "Previous" and "Next" triggers.

#### [MODIFY] [FleetPage.jsx](file:///E:/TransitOps/TransitOps/client/src/pages/FleetPage.jsx)
- State fields for `page`, `sortBy`, `sortOrder`.
- Clickable `<th>` headers with chevron indicators.
- Pagination component at the bottom of the table.

#### [MODIFY] [DriversPage.jsx](file:///E:/TransitOps/TransitOps/client/src/pages/DriversPage.jsx)
- Integrate sorting by columns (name, contact, safety score, completion rate, status) and pagination.

#### [MODIFY] [TripsPage.jsx](file:///E:/TransitOps/TransitOps/client/src/pages/TripsPage.jsx)
- Integrate sorting by columns (tripCode, source, destination, status, distance, vehicle.name, driver.name) and pagination.

#### [MODIFY] [MaintenancePage.jsx](file:///E:/TransitOps/TransitOps/client/src/pages/MaintenancePage.jsx)
- Integrate sorting by columns (vehicle.name, serviceType, cost, date, status) and pagination.

#### [MODIFY] [FuelPage.jsx](file:///E:/TransitOps/TransitOps/client/src/pages/FuelPage.jsx)
- Integrate sorting and pagination for both fuel logs and expenses.

## Verification Plan

### Automated Tests
- Test that the backend server boots up and API requests return correct formats.
- Run tests on backend paginated requests via PowerShell `Invoke-RestMethod`.

### Manual Verification
- Check vehicles registry, drivers registry, trips list, maintenance list, and fuel logs tables.
- Confirm clicking table headers toggles sorting order.
- Confirm pagination buttons navigate through the lists correctly.
