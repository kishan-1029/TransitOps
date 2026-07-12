import { prisma } from '../lib/prisma.js';

import { z } from 'zod';
import { ok, fail } from '../utils/response.js';


export async function listFuel(req, res) {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: { vehicle: true },
      orderBy: { date: 'desc' },
    });
    return ok(res, logs);
  } catch {
    return fail(res, 'Failed to list fuel logs', 500);
  }
}

export async function createFuel(req, res) {
  try {
    const schema = z.object({
      vehicleId: z.string().min(1),
      liters: z.coerce.number().positive(),
      cost: z.coerce.number().nonnegative(),
      date: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: parsed.data.vehicleId,
        liters: parsed.data.liters,
        cost: parsed.data.cost,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      },
      include: { vehicle: true },
    });
    return ok(res, log, 'Fuel logged', 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to log fuel', 500);
  }
}

export async function listExpenses(req, res) {
  try {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: true, trip: true },
      orderBy: { createdAt: 'desc' },
    });
    const enriched = expenses.map((e) => ({
      ...e,
      total: e.toll + e.other + e.maintenanceLinked,
    }));
    return ok(res, enriched);
  } catch {
    return fail(res, 'Failed to list expenses', 500);
  }
}

export async function createExpense(req, res) {
  try {
    const schema = z.object({
      vehicleId: z.string().min(1),
      tripId: z.string().optional().nullable(),
      toll: z.coerce.number().nonnegative().default(0),
      other: z.coerce.number().nonnegative().default(0),
      maintenanceLinked: z.coerce.number().nonnegative().default(0),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const expense = await prisma.expense.create({
      data: {
        vehicleId: parsed.data.vehicleId,
        tripId: parsed.data.tripId || null,
        toll: parsed.data.toll,
        other: parsed.data.other,
        maintenanceLinked: parsed.data.maintenanceLinked,
      },
      include: { vehicle: true, trip: true },
    });
    return ok(
      res,
      { ...expense, total: expense.toll + expense.other + expense.maintenanceLinked },
      'Expense added',
      201
    );
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to add expense', 500);
  }
}

export async function operationalCost(req, res) {
  try {
    const fuel = await prisma.fuelLog.aggregate({ _sum: { cost: true } });
    const maint = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });
    const fuelTotal = fuel._sum.cost || 0;
    const maintTotal = maint._sum.cost || 0;
    return ok(res, {
      fuelTotal,
      maintenanceTotal: maintTotal,
      totalOperationalCost: fuelTotal + maintTotal,
    });
  } catch {
    return fail(res, 'Failed to compute cost', 500);
  }
}
