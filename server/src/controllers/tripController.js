import { prisma } from '../lib/prisma.js';

import { z } from 'zod';
import { ok, fail } from '../utils/response.js';
import {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  assertCapacity,
} from '../services/tripService.js';


const createSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeight: z.coerce.number().positive(),
  plannedDistance: z.coerce.number().positive(),
});

export async function listTrips(req, res) {
  try {
    const trips = await prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, trips);
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to list trips', 500);
  }
}

export async function dispatchOptions(req, res) {
  try {
    const { isLicenseValid } = await import('../services/tripService.js');
    const { VehicleStatus, DriverStatus } = await import('@prisma/client');

    const vehicles = await prisma.vehicle.findMany({
      where: { status: VehicleStatus.Available },
      orderBy: { name: 'asc' },
    });
    const drivers = (
      await prisma.driver.findMany({
        where: { status: DriverStatus.Available },
        orderBy: { name: 'asc' },
      })
    ).filter((d) => isLicenseValid(d.licenseExpiry));

    return ok(res, { vehicles, drivers });
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to load dispatch options', 500);
  }
}

export async function createTripHandler(req, res) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    // Pre-validate capacity for clearer UI message before create
    const vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
    if (vehicle) {
      try {
        assertCapacity(vehicle, Number(parsed.data.cargoWeight));
      } catch (e) {
        return fail(res, e.message, e.status || 400, e.data || null);
      }
    }

    const trip = await createTrip(parsed.data, req.user.id);
    return ok(res, trip, 'Trip created', 201);
  } catch (err) {
    return fail(res, err.message || 'Failed to create trip', err.status || 500, err.data || null);
  }
}

export async function dispatchTripHandler(req, res) {
  try {
    const trip = await dispatchTrip(req.params.id);
    return ok(res, trip, 'Trip dispatched');
  } catch (err) {
    return fail(res, err.message || 'Dispatch failed', err.status || 500, err.data || null);
  }
}

export async function completeTripHandler(req, res) {
  try {
    const schema = z.object({
      finalOdometer: z.coerce.number().int().positive(),
      fuelConsumed: z.coerce.number().positive(),
      fuelCost: z.coerce.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const trip = await completeTrip(req.params.id, parsed.data);
    return ok(res, trip, 'Trip completed');
  } catch (err) {
    return fail(res, err.message || 'Complete failed', err.status || 500);
  }
}

export async function cancelTripHandler(req, res) {
  try {
    const trip = await cancelTrip(req.params.id, req.body?.reason);
    return ok(res, trip, 'Trip cancelled');
  } catch (err) {
    return fail(res, err.message || 'Cancel failed', err.status || 500);
  }
}
