import bcrypt from 'bcryptjs';
import { PrismaClient, Role, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TransitOps...');

  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Raven K.', email: 'raven.k@transitops.in', passwordHash, role: Role.DRIVER },
      { name: 'Dispatch Desk', email: 'dispatch@transitops.in', passwordHash, role: Role.DISPATCHER },
      { name: 'Fleet Admin', email: 'fleet@transitops.in', passwordHash, role: Role.FLEET_MANAGER },
      { name: 'Safety Lead', email: 'safety@transitops.in', passwordHash, role: Role.SAFETY_OFFICER },
      { name: 'Finance Analyst', email: 'finance@transitops.in', passwordHash, role: Role.FINANCIAL_ANALYST },
    ],
  });

  await prisma.setting.create({
    data: {
      id: 'default',
      depotName: 'Gandhinagar Depot GJ4',
      currency: 'INR (Rs)',
      distanceUnit: 'Kilometers',
    },
  });

  const van05 = await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB452',
      name: 'VAN-05',
      type: VehicleType.Van,
      capacityKg: 500,
      odometer: 74000,
      acquisitionCost: 620000,
      status: VehicleStatus.Available,
      region: 'Gandhinagar',
      revenue: 185000,
    },
  });

  const truck11 = await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB998',
      name: 'TRUCK-11',
      type: VehicleType.Truck,
      capacityKg: 5000,
      odometer: 182000,
      acquisitionCost: 2450000,
      status: VehicleStatus.Available,
      region: 'Ahmedabad',
      revenue: 520000,
    },
  });

  const mini03 = await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB221',
      name: 'MINI-03',
      type: VehicleType.Mini,
      capacityKg: 1000,
      odometer: 45000,
      acquisitionCost: 480000,
      status: VehicleStatus.InShop,
      region: 'Gandhinagar',
      revenue: 95000,
    },
  });

  const truck04 = await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB776',
      name: 'TRUCK-04',
      type: VehicleType.Truck,
      capacityKg: 5000,
      odometer: 91000,
      acquisitionCost: 2100000,
      status: VehicleStatus.Available,
      region: 'Sanand',
      revenue: 310000,
    },
  });

  const mini08 = await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB334',
      name: 'MINI-08',
      type: VehicleType.Mini,
      capacityKg: 750,
      odometer: 62000,
      acquisitionCost: 510000,
      status: VehicleStatus.OnTrip,
      region: 'Kalol',
      revenue: 120000,
    },
  });

  await prisma.vehicle.create({
    data: {
      regNo: 'GJ01AB100',
      name: 'VAN-01',
      type: VehicleType.Van,
      capacityKg: 500,
      odometer: 120000,
      acquisitionCost: 550000,
      status: VehicleStatus.Retired,
      region: 'Ahmedabad',
      revenue: 40000,
    },
  });

  const alex = await prisma.driver.create({
    data: {
      name: 'Alex',
      licenseNo: 'DL-88213',
      licenseCategory: 'LMV',
      licenseExpiry: new Date('2027-12-31'),
      contact: '9876512345',
      safetyScore: 92,
      tripCompletion: 96,
      status: DriverStatus.OnTrip,
    },
  });

  const john = await prisma.driver.create({
    data: {
      name: 'John',
      licenseNo: 'DL-44102',
      licenseCategory: 'HMV',
      licenseExpiry: new Date('2026-11-15'),
      contact: '9876523456',
      safetyScore: 88,
      tripCompletion: 81,
      status: DriverStatus.Available,
    },
  });

  const priya = await prisma.driver.create({
    data: {
      name: 'Priya',
      licenseNo: 'DL-99021',
      licenseCategory: 'LMV',
      licenseExpiry: new Date('2025-03-01'),
      contact: '9876534567',
      safetyScore: 74,
      tripCompletion: 90,
      status: DriverStatus.Available,
    },
  });

  const suresh = await prisma.driver.create({
    data: {
      name: 'Suresh',
      licenseNo: 'DL-11098',
      licenseCategory: 'HMV',
      licenseExpiry: new Date('2028-06-30'),
      contact: '9876545678',
      safetyScore: 85,
      tripCompletion: 88,
      status: DriverStatus.Available,
    },
  });

  await prisma.driver.create({
    data: {
      name: 'Ravi',
      licenseNo: 'DL-22011',
      licenseCategory: 'LMV',
      licenseExpiry: new Date('2027-01-20'),
      contact: '9876556789',
      safetyScore: 60,
      tripCompletion: 70,
      status: DriverStatus.Suspended,
    },
  });

  await prisma.driver.create({
    data: {
      name: 'Meera',
      licenseNo: 'DL-33044',
      licenseCategory: 'LMV',
      licenseExpiry: new Date('2026-09-10'),
      contact: '9876567890',
      safetyScore: 91,
      tripCompletion: 94,
      status: DriverStatus.OffDuty,
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: 'TR001',
      source: 'Gandhinagar Depot',
      destination: 'Ahmedabad Hub',
      cargoWeight: 450,
      plannedDistance: 38,
      status: TripStatus.Dispatched,
      etaMinutes: 45,
      vehicleId: mini08.id,
      driverId: alex.id,
      dispatchedAt: new Date(),
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: 'TR004',
      source: 'Vatva Industrial Area',
      destination: 'Sanand Warehouse',
      cargoWeight: 1200,
      plannedDistance: 55,
      status: TripStatus.Draft,
      vehicleId: truck04.id,
      driverId: suresh.id,
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: 'TR006',
      source: 'Mansa',
      destination: 'Kalol Depot',
      cargoWeight: 300,
      plannedDistance: 22,
      status: TripStatus.Cancelled,
      cancelReason: 'Vehicle went to shop.',
      vehicleId: van05.id,
      driverId: john.id,
      cancelledAt: new Date(),
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: 'TR002',
      source: 'Gandhinagar Depot',
      destination: 'Sanand Warehouse',
      cargoWeight: 400,
      plannedDistance: 48,
      status: TripStatus.Completed,
      etaMinutes: 0,
      finalOdometer: 74048,
      fuelConsumed: 6.2,
      vehicleId: van05.id,
      driverId: priya.id,
      completedAt: new Date(Date.now() - 86400000 * 2),
      dispatchedAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: mini03.id,
      serviceType: 'Engine Repair',
      cost: 18000,
      date: new Date('2026-07-06'),
      status: MaintenanceStatus.Active,
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: truck11.id,
      serviceType: 'Tyre Replace',
      cost: 6200,
      date: new Date('2026-07-01'),
      status: MaintenanceStatus.Completed,
    },
  });

  await prisma.fuelLog.createMany({
    data: [
      { vehicleId: van05.id, date: new Date('2024-07-05'), liters: 42, cost: 3150 },
      { vehicleId: truck11.id, date: new Date('2024-07-06'), liters: 110, cost: 8400 },
      { vehicleId: mini08.id, date: new Date('2024-07-06'), liters: 28, cost: 2050 },
      { vehicleId: van05.id, date: new Date(Date.now() - 86400000 * 2), liters: 6.2, cost: 520 },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { vehicleId: van05.id, tripId: null, toll: 120, other: 0, maintenanceLinked: 0 },
      { vehicleId: truck11.id, toll: 340, other: 150, maintenanceLinked: 18000 },
    ],
  });

  console.log('Seed complete.');
  console.log('Demo logins (password: Password@123):');
  console.log('  raven.k@transitops.in     → DRIVER (creates/assigns trips)');
  console.log('  dispatch@transitops.in    → DISPATCHER (alias)');
  console.log('  fleet@transitops.in       → FLEET_MANAGER');
  console.log('  safety@transitops.in      → SAFETY_OFFICER');
  console.log('  finance@transitops.in     → FINANCIAL_ANALYST');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
