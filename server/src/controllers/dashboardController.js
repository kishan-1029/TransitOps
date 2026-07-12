import { PrismaClient, VehicleStatus, TripStatus, DriverStatus } from '@prisma/client';
import { ok, fail } from '../utils/response.js';
import { ROLE_PERMISSIONS } from '../utils/rbac.js';

const prisma = new PrismaClient();

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
}

function safetyBand(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Watch';
  return 'Critical';
}

export async function dashboardKpis(req, res) {
  try {
    const { type, status, region } = req.query;
    const role = req.user.role;
    const vehicleWhere = {};
    if (type && type !== 'All') vehicleWhere.type = type;
    if (status && status !== 'All') vehicleWhere.status = status;
    if (region && region !== 'All') vehicleWhere.region = region;

    const [vehicles, allVehicles, trips, drivers, fuelAgg, maintAgg, expenses] = await Promise.all([
      prisma.vehicle.findMany({ where: vehicleWhere }),
      prisma.vehicle.findMany(),
      prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: 'desc' } }),
      prisma.driver.findMany({ orderBy: { name: 'asc' } }),
      prisma.fuelLog.aggregate({ _sum: { cost: true, liters: true } }),
      prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
      prisma.expense.findMany(),
    ]);

    const activeVehicles = vehicles.filter((v) => v.status !== VehicleStatus.Retired).length;
    const availableVehicles = vehicles.filter((v) => v.status === VehicleStatus.Available).length;
    const inMaintenance = vehicles.filter((v) => v.status === VehicleStatus.InShop).length;
    const activeTrips = trips.filter((t) => t.status === TripStatus.Dispatched).length;
    const pendingTrips = trips.filter((t) => t.status === TripStatus.Draft).length;
    const driversOnDuty = drivers.filter(
      (d) => d.status === DriverStatus.OnTrip || d.status === DriverStatus.Available
    ).length;

    const operable = vehicles.filter((v) => v.status !== VehicleStatus.Retired);
    const utilized = operable.filter(
      (v) => v.status === VehicleStatus.OnTrip || v.status === VehicleStatus.InShop
    );
    const fleetUtilization = operable.length
      ? Math.round((utilized.length / operable.length) * 100)
      : 0;

    const statusCounts = {
      Available: vehicles.filter((v) => v.status === VehicleStatus.Available).length,
      OnTrip: vehicles.filter((v) => v.status === VehicleStatus.OnTrip).length,
      InShop: vehicles.filter((v) => v.status === VehicleStatus.InShop).length,
      Retired: vehicles.filter((v) => v.status === VehicleStatus.Retired).length,
    };

    const licenseAlerts = drivers
      .map((d) => {
        const days = daysUntil(d.licenseExpiry);
        return {
          id: d.id,
          name: d.name,
          licenseNo: d.licenseNo,
          licenseExpiry: d.licenseExpiry,
          daysLeft: days,
          status: d.status,
          safetyScore: d.safetyScore,
          safetyBand: safetyBand(d.safetyScore),
          severity: days < 0 ? 'expired' : days <= 30 ? 'expiring' : 'ok',
        };
      })
      .filter((d) => d.severity !== 'ok' || d.status === DriverStatus.Suspended || d.safetyScore < 75)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const lowSafety = drivers
      .filter((d) => d.safetyScore < 75)
      .sort((a, b) => a.safetyScore - b.safetyScore)
      .map((d) => ({
        id: d.id,
        name: d.name,
        safetyScore: d.safetyScore,
        safetyBand: safetyBand(d.safetyScore),
        status: d.status,
      }));

    const fuelTotal = fuelAgg._sum.cost || 0;
    const maintTotal = maintAgg._sum.cost || 0;
    const tollOther = expenses.reduce((s, e) => s + e.toll + e.other, 0);
    const operationalCost = fuelTotal + maintTotal;
    const totalRevenue = allVehicles.reduce((s, v) => s + (v.revenue || 0), 0);
    const profit = totalRevenue - operationalCost - tollOther;

    const activeMaint = await prisma.maintenanceLog.findMany({
      where: { status: 'Active' },
      include: { vehicle: true },
      take: 8,
      orderBy: { date: 'desc' },
    });

    const regions = [...new Set(allVehicles.map((v) => v.region))];

    return ok(res, {
      role,
      kpis: {
        activeVehicles,
        availableVehicles,
        vehiclesInMaintenance: inMaintenance,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization,
        expiredLicenses: licenseAlerts.filter((a) => a.severity === 'expired').length,
        expiringLicenses: licenseAlerts.filter((a) => a.severity === 'expiring').length,
        lowSafetyCount: lowSafety.length,
        operationalCost,
        fuelCost: fuelTotal,
        maintenanceCost: maintTotal,
        otherExpenses: tollOther,
        totalRevenue,
        profit,
        avgSafetyScore:
          drivers.length > 0
            ? Number((drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length).toFixed(1))
            : 0,
      },
      statusCounts,
      recentTrips: trips.slice(0, 8),
      regions,
      licenseAlerts,
      lowSafetyDrivers: lowSafety,
      activeMaintenance: activeMaint,
      driverStatusBreakdown: {
        Available: drivers.filter((d) => d.status === DriverStatus.Available).length,
        OnTrip: drivers.filter((d) => d.status === DriverStatus.OnTrip).length,
        OffDuty: drivers.filter((d) => d.status === DriverStatus.OffDuty).length,
        Suspended: drivers.filter((d) => d.status === DriverStatus.Suspended).length,
      },
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to load dashboard', 500);
  }
}

export async function analyticsSummary(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { fuelLogs: true, maintenanceLogs: true, trips: true, expenses: true },
    });
    const fuelAgg = await prisma.fuelLog.aggregate({
      _sum: { cost: true, liters: true },
    });
    const maintAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });
    const expenseAgg = await prisma.expense.aggregate({
      _sum: { toll: true, other: true },
    });

    const totalFuelCost = fuelAgg._sum.cost || 0;
    const totalFuelLiters = fuelAgg._sum.liters || 0;
    const totalMaintCost = maintAgg._sum.cost || 0;
    const tollOther = (expenseAgg._sum.toll || 0) + (expenseAgg._sum.other || 0);
    const operationalCost = totalFuelCost + totalMaintCost;

    const completedTrips = await prisma.trip.findMany({
      where: { status: TripStatus.Completed },
    });
    const totalDistance = completedTrips.reduce((s, t) => s + (t.plannedDistance || 0), 0);
    const fuelEfficiency =
      totalFuelLiters > 0 ? Number((totalDistance / totalFuelLiters).toFixed(1)) : 0;

    const operable = vehicles.filter((v) => v.status !== VehicleStatus.Retired);
    const utilized = operable.filter(
      (v) => v.status === VehicleStatus.OnTrip || v.status === VehicleStatus.InShop
    );
    const fleetUtilization = operable.length
      ? Math.round((utilized.length / operable.length) * 100)
      : 0;

    const vehicleStats = vehicles.map((v) => {
      const fuel = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const maint = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const other = v.expenses.reduce((s, e) => s + e.toll + e.other, 0);
      const totalCost = fuel + maint + other;
      const profit = v.revenue - totalCost;
      const roi =
        v.acquisitionCost > 0
          ? Number((((v.revenue - (maint + fuel)) / v.acquisitionCost) * 100).toFixed(1))
          : 0;
      return {
        id: v.id,
        name: v.name,
        regNo: v.regNo,
        fuelCost: fuel,
        maintCost: maint,
        otherCost: other,
        totalCost,
        revenue: v.revenue,
        profit,
        acquisitionCost: v.acquisitionCost,
        roi,
      };
    });

    const avgRoi =
      vehicleStats.length > 0
        ? Number((vehicleStats.reduce((s, v) => s + v.roi, 0) / vehicleStats.length).toFixed(1))
        : 0;

    const costliest = [...vehicleStats].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

    // Real monthly revenue from completed trips (by completedAt month)
    const monthMap = {};
    for (const t of completedTrips) {
      const d = t.completedAt || t.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short' });
      if (!monthMap[key]) monthMap[key] = { month: label, revenue: 0, key };
      monthMap[key].revenue += Math.round((t.plannedDistance || 0) * 40);
    }
    let monthlyRevenue = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    if (monthlyRevenue.length === 0) {
      monthlyRevenue = vehicles.slice(0, 6).map((v, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        revenue: Math.round(v.revenue / 6),
      }));
    }

    const totalRevenue = vehicles.reduce((s, v) => s + v.revenue, 0);

    return ok(res, {
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      fuelCost: totalFuelCost,
      maintenanceCost: totalMaintCost,
      otherExpenses: tollOther,
      totalRevenue,
      profit: totalRevenue - operationalCost - tollOther,
      vehicleRoi: avgRoi,
      roiFormula: 'ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost',
      costliestVehicles: costliest,
      monthlyRevenue,
      vehicleStats: vehicleStats.sort((a, b) => b.profit - a.profit),
      totalDistance,
      totalFuelLiters,
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Failed to load analytics', 500);
  }
}

export async function exportCsv(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { fuelLogs: true, maintenanceLogs: true, expenses: true },
    });

    const rows = [
      [
        'Vehicle',
        'RegNo',
        'Type',
        'Status',
        'FuelCost',
        'MaintCost',
        'OtherCost',
        'Revenue',
        'Profit',
        'AcquisitionCost',
        'ROI%',
      ],
    ];

    for (const v of vehicles) {
      const fuel = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const maint = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const other = v.expenses.reduce((s, e) => s + e.toll + e.other, 0);
      const profit = v.revenue - fuel - maint - other;
      const roi =
        v.acquisitionCost > 0
          ? (((v.revenue - (maint + fuel)) / v.acquisitionCost) * 100).toFixed(1)
          : '0';
      rows.push([
        v.name,
        v.regNo,
        v.type,
        v.status,
        fuel,
        maint,
        other,
        v.revenue,
        profit,
        v.acquisitionCost,
        roi,
      ]);
    }

    const csv = rows.map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transitops-analytics.csv"');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return fail(res, 'CSV export failed', 500);
  }
}

export async function getSettings(req, res) {
  try {
    let setting = await prisma.setting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.setting.create({ data: { id: 'default' } });
    }
    return ok(res, { ...setting, rbacMatrix: ROLE_PERMISSIONS });
  } catch {
    return fail(res, 'Failed to load settings', 500);
  }
}

export async function updateSettings(req, res) {
  try {
    const { depotName, currency, distanceUnit } = req.body;
    const setting = await prisma.setting.upsert({
      where: { id: 'default' },
      update: {
        depotName: depotName || undefined,
        currency: currency || undefined,
        distanceUnit: distanceUnit || undefined,
      },
      create: {
        id: 'default',
        depotName: depotName || 'Gandhinagar Depot GJ4',
        currency: currency || 'INR (Rs)',
        distanceUnit: distanceUnit || 'Kilometers',
      },
    });
    return ok(res, setting, 'Settings saved');
  } catch {
    return fail(res, 'Failed to save settings', 500);
  }
}
