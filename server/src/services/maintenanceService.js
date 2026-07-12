import { VehicleStatus, MaintenanceStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';


export async function createMaintenance({ vehicleId, serviceType, cost, date, notes }) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      const err = new Error('Vehicle not found');
      err.status = 404;
      throw err;
    }
    if (vehicle.status === VehicleStatus.Retired) {
      const err = new Error('Cannot put a Retired vehicle In Shop');
      err.status = 400;
      throw err;
    }
    if (vehicle.status === VehicleStatus.OnTrip) {
      const err = new Error('Cannot open maintenance while vehicle is On Trip');
      err.status = 400;
      throw err;
    }

    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId,
        serviceType,
        cost: Number(cost),
        date: date ? new Date(date) : new Date(),
        status: MaintenanceStatus.Active,
        notes: notes || null,
      },
      include: { vehicle: true },
    });

    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: VehicleStatus.InShop },
    });

    return tx.maintenanceLog.findUnique({
      where: { id: log.id },
      include: { vehicle: true },
    });
  });
}

export async function closeMaintenance(id) {
  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) {
      const err = new Error('Maintenance record not found');
      err.status = 404;
      throw err;
    }
    if (log.status === MaintenanceStatus.Completed) {
      const err = new Error('Maintenance record already completed');
      err.status = 400;
      throw err;
    }

    await tx.maintenanceLog.update({
      where: { id },
      data: { status: MaintenanceStatus.Completed },
    });

    if (log.vehicle.status !== VehicleStatus.Retired) {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: VehicleStatus.Available },
      });
    }

    return tx.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
  });
}
