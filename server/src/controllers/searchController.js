import { VehicleType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ok, fail } from '../utils/response.js';
import { canAccess } from '../utils/rbac.js';


export async function globalSearch(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 1) {
      return ok(res, { vehicles: [], drivers: [], trips: [], query: q });
    }

    const role = req.user.role;
    const results = { vehicles: [], drivers: [], trips: [], query: q };
    const typeMatch = Object.values(VehicleType).find((t) => t.toLowerCase() === q.toLowerCase());

    if (canAccess(role, 'fleet', 'view')) {
      results.vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { regNo: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { region: { contains: q, mode: 'insensitive' } },
            ...(typeMatch ? [{ type: typeMatch }] : []),
          ],
        },
        take: 8,
        orderBy: { name: 'asc' },
      });
    }

    if (canAccess(role, 'drivers', 'view')) {
      results.drivers = await prisma.driver.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { licenseNo: { contains: q, mode: 'insensitive' } },
            { contact: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 8,
        orderBy: { name: 'asc' },
      });
    }

    if (canAccess(role, 'trips', 'view')) {
      results.trips = await prisma.trip.findMany({
        where: {
          OR: [
            { tripCode: { contains: q, mode: 'insensitive' } },
            { source: { contains: q, mode: 'insensitive' } },
            { destination: { contains: q, mode: 'insensitive' } },
            { vehicle: { name: { contains: q, mode: 'insensitive' } } },
            { driver: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: { vehicle: true, driver: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
      });
    }

    return ok(res, results);
  } catch (err) {
    console.error(err);
    return fail(res, 'Search failed', 500);
  }
}
