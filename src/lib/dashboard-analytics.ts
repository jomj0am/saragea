// lib/dashboard-analytics.ts
import { prisma } from './prisma';
import { subMonths, format } from 'date-fns';

export async function getDashboardAnalytics() {
  // 1. Pata takwimu za msingi
  const [propertyCount, tenantCount, occupiedRooms, totalRooms] = await Promise.all([
    prisma.property.count(),
    prisma.user.count({ where: { role: 'TENANT' } }),
    prisma.room.count({ where: { isOccupied: true } }),
    prisma.room.count(),
  ]);

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // 2. Pata malipo na matumizi ya miezi 6 iliyopita
  const sixMonthsAgo = subMonths(new Date(), 6);
    const [monthlyPayments, monthlyExpenses] = await Promise.all([
        prisma.payment.findMany({ where: { paymentDate: { gte: sixMonthsAgo } } }),
        prisma.expense.findMany({ where: { expenseDate: { gte: sixMonthsAgo } } })
    ]);

  const [paidInvoices, overdueInvoices, dueInvoices] = await Promise.all([
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        prisma.invoice.count({ where: { status: 'DUE' } }),
    ]);

  const totalInvoices = paidInvoices + overdueInvoices + dueInvoices;
  const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
  const invoiceStatusData = { paid: paidInvoices, overdue: overdueInvoices, due: dueInvoices };

  const properties = await prisma.property.findMany({
        select: {
            name: true,
            _count: { select: { rooms: true } },
            rooms: { where: { isOccupied: true } }, // Pata vyumba vilivyopangishwa tu
        },
    });
    const propertyPerformanceData = properties.map(p => ({
        name: p.name,
        totalRooms: p._count.rooms,
        occupiedRooms: p.rooms.length,
        occupancy: p._count.rooms > 0 ? (p.rooms.length / p._count.rooms) * 100 : 0,
    }));


  const openTickets = await prisma.maintenanceTicket.count({ where: { status: 'OPEN' } });

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({ where: { paymentDate: { gte: sixMonthsAgo } } }),
    prisma.expense.findMany({ where: { expenseDate: { gte: sixMonthsAgo } } }),
  ]);

  // 3. Panga mapato na matumizi kwa mwezi
  const monthlyRevenue: Record<string, number> = {};
  const monthlyCost: Record<string, number> = {};

  payments.forEach(p => {
    const month = format(p.paymentDate, 'MMM yyyy');
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
  });

  expenses.forEach(e => {
    const month = format(e.expenseDate, 'MMM yyyy');
    monthlyCost[month] = (monthlyCost[month] || 0) + e.amount;
  });

  // 4. Tengeneza data ya grafu yenye mapato, matumizi na faida
  const allMonths = Array.from(new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyCost)]));
  const chartData = allMonths
    .map(month => ({
      name: month,
      revenue: monthlyRevenue[month] || 0,
      expenses: monthlyCost[month] || 0,
      profit: (monthlyRevenue[month] || 0) - (monthlyCost[month] || 0),
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  // 5. Pata mikataba mipya ya hivi karibuni
  const recentLeases = await prisma.lease.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: { select: { name: true } },
      room: { select: { roomNumber: true } },
    },
  });

  // 6. Pata reservations ambazo bado hazijatimizwa
  const pendingReservations = await prisma.reservation.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { id: true, name: true } },
      room: { include: { property: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    propertyCount,
    tenantCount,
    occupiedRooms,
    totalRooms,
    occupancyRate,
    chartData,
    recentLeases,
    pendingReservations,
    paymentRate,
    invoiceStatusData,
    propertyPerformanceData,
    openTickets,
  };
}
