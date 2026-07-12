import { PrismaClient, VehicleStatus, DriverStatus, TripStatus } from '@prisma/client';

const prisma = new PrismaClient();

export function isLicenseValid(licenseExpiry) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(licenseExpiry);
  expiry.setHours(0, 0, 0, 0);
  return expiry >= today;
}

export function assertDriverAssignable(driver) {
  if (!driver) {
    const err = new Error('Driver not found');
    err.status = 404;
    throw err;
  }
  if (driver.status === DriverStatus.Suspended) {
    const err = new Error('Suspended drivers cannot be assigned to trips');
    err.status = 400;
    throw err;
  }
  if (driver.status === DriverStatus.OnTrip) {
    const err = new Error('Driver is already On Trip and cannot be assigned again');
    err.status = 400;
    throw err;
  }
  if (driver.status !== DriverStatus.Available) {
    const err = new Error(`Driver status must be Available (current: ${driver.status})`);
    err.status = 400;
    throw err;
  }
  if (!isLicenseValid(driver.licenseExpiry)) {
    const err = new Error('Expired license — driver blocked from trip assignment');
    err.status = 400;
    throw err;
  }
}

export function assertVehicleAssignable(vehicle) {
  if (!vehicle) {
    const err = new Error('Vehicle not found');
    err.status = 404;
    throw err;
  }
  if (vehicle.status === VehicleStatus.Retired || vehicle.status === VehicleStatus.InShop) {
    const err = new Error('Retired or In Shop vehicles are hidden from Trip Dispatcher');
    err.status = 400;
    throw err;
  }
  if (vehicle.status === VehicleStatus.OnTrip) {
    const err = new Error('Vehicle is already On Trip and cannot be assigned again');
    err.status = 400;
    throw err;
  }
  if (vehicle.status !== VehicleStatus.Available) {
    const err = new Error(`Vehicle status must be Available (current: ${vehicle.status})`);
    err.status = 400;
    throw err;
  }
}

export function assertCapacity(vehicle, cargoWeight) {
  if (cargoWeight > vehicle.capacityKg) {
    const over = cargoWeight - vehicle.capacityKg;
    const err = new Error(
      `Capacity exceeded by ${over} kg — dispatch blocked. Vehicle Capacity: ${vehicle.capacityKg} kg vs Cargo Weight: ${cargoWeight} kg.`
    );
    err.status = 400;
    err.data = { capacityKg: vehicle.capacityKg, cargoWeight, exceededBy: over };
    throw err;
  }
}

async function nextTripCode(tx) {
  const count = await tx.trip.count();
  return `TR${String(count + 1).padStart(3, '0')}`;
}

export async function createTrip(payload, userId) {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = payload;

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await tx.driver.findUnique({ where: { id: driverId } });

    assertVehicleAssignable(vehicle);
    assertDriverAssignable(driver);
    assertCapacity(vehicle, Number(cargoWeight));

    const tripCode = await nextTripCode(tx);

    return tx.trip.create({
      data: {
        tripCode,
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        status: TripStatus.Draft,
        createdById: userId || null,
      },
      include: { vehicle: true, driver: true },
    });
  });
}

export async function dispatchTrip(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    if (trip.status !== TripStatus.Draft) {
      const err = new Error('Only Draft trips can be dispatched');
      err.status = 400;
      throw err;
    }

    // Re-check current assignment eligibility
    const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
    const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
    assertVehicleAssignable(vehicle);
    assertDriverAssignable(driver);
    assertCapacity(vehicle, trip.cargoWeight);

    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: VehicleStatus.OnTrip },
    });
    await tx.driver.update({
      where: { id: driver.id },
      data: { status: DriverStatus.OnTrip },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.Dispatched,
        dispatchedAt: new Date(),
        etaMinutes: Math.max(20, Math.round(trip.plannedDistance * 1.2)),
      },
      include: { vehicle: true, driver: true },
    });
  });
}

export async function completeTrip(tripId, { finalOdometer, fuelConsumed, fuelCost }) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    if (trip.status !== TripStatus.Dispatched) {
      const err = new Error('Only Dispatched trips can be completed');
      err.status = 400;
      throw err;
    }
    if (finalOdometer == null || fuelConsumed == null) {
      const err = new Error('Final odometer and fuel consumed are required to complete a trip');
      err.status = 400;
      throw err;
    }
    if (Number(finalOdometer) < trip.vehicle.odometer) {
      const err = new Error('Final odometer cannot be less than current vehicle odometer');
      err.status = 400;
      throw err;
    }

    const liters = Number(fuelConsumed);
    const cost = fuelCost != null ? Number(fuelCost) : liters * 85;

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: VehicleStatus.Available,
        odometer: Number(finalOdometer),
        revenue: { increment: trip.plannedDistance * 40 },
      },
    });
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.Available },
    });

    await tx.fuelLog.create({
      data: {
        vehicleId: trip.vehicleId,
        liters,
        cost,
        tripId: trip.id,
        date: new Date(),
      },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.Completed,
        finalOdometer: Number(finalOdometer),
        fuelConsumed: liters,
        completedAt: new Date(),
        etaMinutes: 0,
      },
      include: { vehicle: true, driver: true },
    });
  });
}

export async function cancelTrip(tripId, reason) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    if (trip.status === TripStatus.Completed || trip.status === TripStatus.Cancelled) {
      const err = new Error('Cannot cancel a completed or already cancelled trip');
      err.status = 400;
      throw err;
    }

    if (trip.status === TripStatus.Dispatched) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.Available },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.Available },
      });
    }

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.Cancelled,
        cancelReason: reason || 'Cancelled by dispatcher',
        cancelledAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });
  });
}
