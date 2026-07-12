import { DriverStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok, fail } from '../utils/response.js';
import { isLicenseValid } from '../services/tripService.js';


const driverSchema = z.object({
  name: z.string().min(1),
  licenseNo: z.string().min(3),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.string().or(z.coerce.date()),
  contact: z.string().min(5),
  safetyScore: z.coerce.number().min(0).max(100).optional(),
  tripCompletion: z.coerce.number().min(0).max(100).optional(),
  status: z.nativeEnum(DriverStatus).optional(),
});

function enrich(driver) {
  return {
    ...driver,
    licenseExpired: !isLicenseValid(driver.licenseExpiry),
    assignable:
      driver.status === DriverStatus.Available && isLicenseValid(driver.licenseExpiry),
  };
}

export async function listDrivers(req, res) {
  try {
    const { status, search, forDispatch } = req.query;
    const where = {};
    if (status && status !== 'All') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (forDispatch === 'true') {
      where.status = DriverStatus.Available;
    }

    let drivers = await prisma.driver.findMany({ where, orderBy: { name: 'asc' } });
    drivers = drivers.map(enrich);

    if (forDispatch === 'true') {
      drivers = drivers.filter((d) => d.assignable);
    }

    return ok(res, drivers);
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to list drivers', 500);
  }
}

export async function createDriver(req, res) {
  try {
    const parsed = driverSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const driver = await prisma.driver.create({
      data: {
        name: parsed.data.name,
        licenseNo: parsed.data.licenseNo,
        licenseCategory: parsed.data.licenseCategory,
        licenseExpiry: new Date(parsed.data.licenseExpiry),
        contact: parsed.data.contact,
        safetyScore: parsed.data.safetyScore ?? 85,
        tripCompletion: parsed.data.tripCompletion ?? 90,
        status: parsed.data.status || DriverStatus.Available,
      },
    });
    return ok(res, enrich(driver), 'Driver created', 201);
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 'License number must be unique', 409);
    console.error(err);
    return fail(res, 'Failed to create driver', 500);
  }
}

export async function updateDriver(req, res) {
  try {
    const parsed = driverSchema.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const data = { ...parsed.data };
    if (data.licenseExpiry) data.licenseExpiry = new Date(data.licenseExpiry);

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data,
    });
    return ok(res, enrich(driver), 'Driver updated');
  } catch (err) {
    if (err.code === 'P2025') return fail(res, 'Driver not found', 404);
    return fail(res, 'Failed to update driver', 500);
  }
}

export async function deleteDriver(req, res) {
  try {
    await prisma.driver.delete({ where: { id: req.params.id } });
    return ok(res, null, 'Driver deleted');
  } catch (err) {
    if (err.code === 'P2025') return fail(res, 'Driver not found', 404);
    if (err.code === 'P2003') return fail(res, 'Driver is referenced by trips', 409);
    return fail(res, 'Failed to delete driver', 500);
  }
}
