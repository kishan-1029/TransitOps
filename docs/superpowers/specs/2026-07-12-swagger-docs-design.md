# 2026-07-12-swagger-docs-design

Integrating Swagger UI into the TransitOps backend to document all Express endpoints.

## Proposed Changes

### Backend Dependencies
- Add `swagger-ui-express` to [server/package.json](file:///E:/TransitOps/TransitOps/server/package.json).

### New Spec File
- [NEW] [swaggerSpec.js](file:///E:/TransitOps/TransitOps/server/src/docs/swaggerSpec.js): Contains the OpenAPI 3.0 configuration object defining all backend routes, schemes, parameters, request bodies, and responses.

### Server Routing
- [MODIFY] [app.js](file:///E:/TransitOps/TransitOps/server/src/app.js): Import `swagger-ui-express` and `swaggerSpec.js`. Mount `swaggerUi.serve` and `swaggerUi.setup(swaggerSpec)` on `/api-docs`.

## Verification Plan

### Automated Tests
- Build check: Ensure `npm run dev:server` runs without error.
- Health check: Query `/api/health` and verify API status.

### Manual Verification
- Navigate to `http://localhost:5000/api-docs` to confirm the Swagger UI renders properly.
- Inspect the schema definitions and routes for Auth, Vehicles, Drivers, Trips, Maintenance, Fuel Logs, and Misc endpoints.
- Test the login and user fetching endpoint inside the Swagger UI interface using the "Try it out" feature.
