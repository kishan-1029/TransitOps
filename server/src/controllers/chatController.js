/**
 * Lightweight TransitOps assistant (Elly-style skill routing, no heavy LLM required).
 * Answers ops FAQs + returns optional navigation targets.
 */
const FAQ = [
  {
    keys: ['login', 'password', 'sign in', 'locked', 'lockout'],
    answer:
      'Use demo password Password@123. Pick the matching RBAC role. After 5 wrong attempts the account locks for 15 minutes, then unlocks automatically.',
    link: '/login',
  },
  {
    keys: ['vehicle', 'fleet', 'registry', 'reg'],
    answer:
      'Vehicle Registry stores reg. no. (unique), model, type, capacity, odometer, acquisition cost, and status (Available / On Trip / In Shop / Retired). Retired & In Shop are hidden from dispatch.',
    link: '/fleet',
  },
  {
    keys: ['driver', 'license', 'safety', 'compliance'],
    answer:
      'Drivers page tracks license expiry and safety scores. Expired license or Suspended status blocks trip assignment. Safety Officers can filter Expired / Expiring / Low Safety.',
    link: '/drivers',
  },
  {
    keys: ['trip', 'dispatch', 'cargo', 'capacity'],
    answer:
      'Create a trip with available vehicle + driver. Cargo cannot exceed capacity. Dispatch sets both On Trip; Complete needs odometer + fuel and frees them again.',
    link: '/trips',
  },
  {
    keys: ['maintenance', 'shop', 'service'],
    answer:
      'Saving an active maintenance record sets the vehicle In Shop (removed from dispatch). Closing the record returns it to Available (unless Retired).',
    link: '/maintenance',
  },
  {
    keys: ['fuel', 'expense', 'cost', 'roi', 'analytics', 'profit'],
    answer:
      'Fuel & Expenses logs liters/cost and tolls. Analytics shows Fuel Efficiency (km/l), Utilization, Ops Cost, and ROI = (Revenue − Maint − Fuel) / Acquisition. Export CSV or Print/PDF.',
    link: '/analytics',
  },
  {
    keys: ['role', 'rbac', 'permission', 'access'],
    answer:
      'Roles: Fleet Manager (fleet/maint/analytics), Driver (trips), Safety Officer (drivers/compliance), Financial Analyst (fuel/analytics). Sidebar only shows modules you can access.',
    link: '/settings',
  },
  {
    keys: ['help', 'hello', 'hi', 'what can'],
    answer:
      'I can explain TransitOps modules: fleet, drivers, trips, maintenance, fuel, analytics, login/RBAC. Ask something like “how does dispatch work?”',
  },
];

export function chat(req, res) {
  const message = String(req.body?.message || '').trim().toLowerCase();
  if (!message) {
    return res.status(400).json({
      isOk: false,
      message: 'Type a question',
      data: null,
      status: 400,
    });
  }

  const hit = FAQ.find((item) => item.keys.some((k) => message.includes(k)));
  const reply = hit || {
    answer:
      'I am TransitOps Assistant. Try asking about login, fleet, drivers, trips, maintenance, fuel, ROI, or RBAC roles.',
  };

  return res.json({
    isOk: true,
    message: 'ok',
    data: {
      reply: reply.answer,
      link: reply.link || null,
      suggestions: [
        'How does trip dispatch work?',
        'Where do I track licenses?',
        'What is Vehicle ROI?',
        'Who can access Fuel & Expenses?',
      ],
    },
    status: 200,
  });
}
