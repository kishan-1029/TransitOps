import { PrismaClient, VehicleStatus, VehicleType } from '@prisma/client';
import { z } from 'zod';
import { ok, fail } from '../utils/response.js';

const prisma = new PrismaClient();

const vehicleSchema = z.object({
  regNo: z.string().min(3),
  name: z.string().min(1),
  type: z.nativeEnum(VehicleType),
  capacityKg: z.coerce.number().positive(),
  odometer: z.coerce.number().int().nonnegative().optional(),
  acquisitionCost: z.coerce.number().nonnegative(),
  status: z.nativeEnum(VehicleStatus).optional(),
  region: z.string().optional(),
  revenue: z.coerce.number().optional(),
});

export async function listVehicles(req, res) {
  try {
    const { type, status, region, search, forDispatch } = req.query;
    const where = {};

    if (type && type !== 'All') where.type = type;
    if (status && status !== 'All') where.status = status;
    if (region && region !== 'All') where.region = region;
    if (search) {
      where.OR = [
        { regNo: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (forDispatch === 'true') {
      where.status = VehicleStatus.Available;
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return ok(res, vehicles);
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to list vehicles', 500);
  }
}

export async function getVehicle(req, res) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return fail(res, 'Vehicle not found', 404);
  return ok(res, vehicle);
}

export async function createVehicle(req, res) {
  try {
    const parsed = vehicleSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const existing = await prisma.vehicle.findUnique({ where: { regNo: parsed.data.regNo } });
    if (existing) return fail(res, 'Registration No. must be unique', 409);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed.data,
        odometer: parsed.data.odometer ?? 0,
        status: parsed.data.status || VehicleStatus.Available,
        region: parsed.data.region || 'Gujarat',
      },
    });
    return ok(res, vehicle, 'Vehicle created', 201);
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 'Registration No. must be unique', 409);
    console.error(err);
    return fail(res, 'Failed to create vehicle', 500);
  }
}

export async function updateVehicle(req, res) {
  try {
    const parsed = vehicleSchema.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    if (parsed.data.regNo) {
      const clash = await prisma.vehicle.findFirst({
        where: { regNo: parsed.data.regNo, NOT: { id: req.params.id } },
      });
      if (clash) return fail(res, 'Registration No. must be unique', 409);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    return ok(res, vehicle, 'Vehicle updated');
  } catch (err) {
    if (err.code === 'P2025') return fail(res, 'Vehicle not found', 404);
    console.error(err);
    return fail(res, 'Failed to update vehicle', 500);
  }
}

export async function deleteVehicle(req, res) {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    return ok(res, null, 'Vehicle deleted');
  } catch (err) {
    if (err.code === 'P2025') return fail(res, 'Vehicle not found', 404);
    if (err.code === 'P2003') return fail(res, 'Vehicle is referenced by trips or logs', 409);
    return fail(res, 'Failed to delete vehicle', 500);
  }
}
