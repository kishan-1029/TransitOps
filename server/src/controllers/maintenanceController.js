import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok, fail } from '../utils/response.js';
import { createMaintenance, closeMaintenance } from '../services/maintenanceService.js';
import { getPaginatedAndSorted } from '../utils/query.js';


export async function listMaintenance(req, res) {
  try {
    const result = await getPaginatedAndSorted({
      model: prisma.maintenanceLog,
      req,
      include: { vehicle: true },
      defaultSort: { date: 'desc' },
    });
    return ok(res, result);
  } catch (err) {
    return fail(res, 'Failed to list maintenance', 500);
  }
}

export async function createMaintenanceHandler(req, res) {
  try {
    const schema = z.object({
      vehicleId: z.string().min(1),
      serviceType: z.string().min(1),
      cost: z.coerce.number().nonnegative(),
      date: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const log = await createMaintenance(parsed.data);
    return ok(res, log, 'Maintenance saved — vehicle In Shop', 201);
  } catch (err) {
    return fail(res, err.message || 'Failed to save maintenance', err.status || 500);
  }
}

export async function closeMaintenanceHandler(req, res) {
  try {
    const log = await closeMaintenance(req.params.id);
    return ok(res, log, 'Maintenance closed — vehicle Available');
  } catch (err) {
    return fail(res, err.message || 'Failed to close maintenance', err.status || 500);
  }
}
