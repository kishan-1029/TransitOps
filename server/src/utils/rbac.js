/** Problem-statement roles + DISPATCHER alias (same rights as DRIVER). */
const TRIP_OPERATOR = {
  dashboard: 'full',
  fleet: 'view',
  drivers: 'view',
  trips: 'full',
  maintenance: 'none',
  fuel: 'none',
  analytics: 'none',
  settings: 'view',
};

export const ROLE_PERMISSIONS = {
  FLEET_MANAGER: {
    dashboard: 'full',
    fleet: 'full',
    drivers: 'full',
    trips: 'view',
    maintenance: 'full',
    fuel: 'view',
    analytics: 'full',
    settings: 'full',
  },
  DRIVER: { ...TRIP_OPERATOR },
  DISPATCHER: { ...TRIP_OPERATOR },
  SAFETY_OFFICER: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'full',
    trips: 'view',
    maintenance: 'none',
    fuel: 'none',
    analytics: 'none',
    settings: 'view',
  },
  FINANCIAL_ANALYST: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'none',
    trips: 'none',
    maintenance: 'view',
    fuel: 'full',
    analytics: 'full',
    settings: 'view',
  },
};

export function canAccess(role, module, action = 'view') {
  const level = ROLE_PERMISSIONS[role]?.[module] || 'none';
  if (level === 'none') return false;
  if (action === 'view') return level === 'view' || level === 'full';
  return level === 'full';
}
