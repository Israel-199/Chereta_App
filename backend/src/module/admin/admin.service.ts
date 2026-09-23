import prisma from "../../utils/prisma/prisma";

/**
 * Get overall dashboard statistics
 */
export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    totalEqubs,
    runningEqubs,
    pendingPayments,
    successfulPayments,
    failedPayments,
    fraudAlerts,
    notificationCount,
    recentActivities,
    pendingKycCount,
    pendingEqubRegistrations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.equb.count(),
    prisma.equb.count({ where: { state: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.auditLog.count({ where: { action: { contains: "SUSPICIOUS" } } }),
    prisma.notificationLog.count(),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, phoneNumber: true } } },
    }),
    prisma.user.count({ where: { idStatus: "PENDING" } }),
    prisma.equbRegistration.count(),
  ]);

  const now = new Date();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const weekStart = new Date(new Date().setDate(now.getDate() - 7));
  const monthStart = new Date(new Date().setMonth(now.getMonth() - 1));

  const [
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    totalRevenue,
    newUsersToday,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: todayStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: weekStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } })
  ]);

  return {
    totalUsers,
    activeUsers,
    totalEqubs,
    runningEqubs,
    pendingPayments,
    pendingKyc: pendingKycCount,
    successfulPayments,
    failedPayments,
    fraudAlerts,
    notificationSummary: notificationCount,
    dailyRevenue: dailyRevenue._sum.amount || 0,
    weeklyRevenue: weeklyRevenue._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    totalRevenue: totalRevenue._sum.amount || 0,
    newUsersToday,
    recentActivities,
    pendingEqubRegistrations
  };
}

/**
 * Enhanced user searching and filtering
 */
export async function getUsers(filters: any) {
  const { status, idStatus, search, equbType, equbAmount } = filters;
  const where: any = {};
  if (status) where.status = status;
  if (idStatus) where.idStatus = idStatus;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (equbType || equbAmount) {
    where.equbMembers = {
      some: {
        equb: {
          ...(equbType && { type: equbType }),
          ...(equbAmount && { contributionAmount: Number(equbAmount) })
        }
      }
    };
  }

  return await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { equbMembers: true },
      },
      equbMembers: {
        include: {
          equb: true
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          equb: { select: { name: true, type: true } }
        }
      },
      payouts: {
        include: {
          equb: { select: { name: true, total: true } }
        }
      },
      lotteryWins: true,
      attachments: true
    }
  });
}

/**
 * Update KYC status
 */
export async function updateKycStatus(userId: string, status: "VERIFIED" | "REJECTED" | "PENDING") {
  return await prisma.user.update({
    where: { id: userId },
    data: { idStatus: status },
  });
}

/**
 * Toggle user status
 */
export async function toggleUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED", reason?: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      status,
      suspensionReason: status === 'SUSPENDED' ? reason : null
    },
  });
}

/**
 * Force remove member
 */
export async function forceRemoveMember(equbId: string, userId: string) {
  return await prisma.equbMember.delete({
    where: {
      equbId_userId: {
        equbId,
        userId
      }
    }
  });
}

/**
 * Delete an Equb registration
 */
export async function deleteRegistration(id: string) {
  return await prisma.equbRegistration.delete({
    where: { id }
  });
}

/**
 * Fetch system audit logs (Unified from Activity, AdminAction, and Audit mechanisms)
 */
export async function getAuditLogs(params: { page?: number, limit?: number, search?: string, origin?: string }) {
  const { page = 1, limit = 50, search = '', origin = 'ALL' } = params;
  const take = Number(page) * Number(limit);
  const skip = (Number(page) - 1) * Number(limit);

  let combinedLogs: any[] = [];
  let totalActivity = 0, totalAdmin = 0, totalAudit = 0;

  const baseUserQuery = search ? {
    OR: [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ]
  } : {};

  // 1. Mobile Activity Logs
  if (origin === 'ALL' || origin === 'MOBILE') {
    const activityQuery = {
      where: search ? {
        OR: [
          { action: { contains: search, mode: "insensitive" } },
          { user: baseUserQuery }
        ]
      } : {},
    };
    totalActivity = await prisma.activityLog.count(activityQuery as any);
    const activities = await prisma.activityLog.findMany({
      ...activityQuery,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, role: true } } }
    } as any);

    combinedLogs.push(...activities.map((a: any) => ({
      id: a.id,
      source: 'MOBILE',
      action: a.action,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      target: null,
      reason: null,
      timestamp: a.createdAt,
      user: a.user ? { name: `${a.user.firstName} ${a.user.lastName}`, role: a.user.role } : null
    })));
  }

  // 2. Admin Action Logs
  if (origin === 'ALL' || origin === 'ADMIN') {
    const adminQuery = {
      where: search ? {
        OR: [
          { action: { contains: search, mode: "insensitive" } },
          { target: { contains: search, mode: "insensitive" } },
          { admin: baseUserQuery }
        ]
      } : {},
    };
    totalAdmin = await prisma.adminActionLog.count(adminQuery as any);
    const adminActions = await prisma.adminActionLog.findMany({
      ...adminQuery,
      take,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { firstName: true, lastName: true, role: true } } }
    } as any);

    combinedLogs.push(...adminActions.map((a: any) => ({
      id: a.id,
      source: 'ADMIN',
      action: a.action,
      ipAddress: 'Internal',
      userAgent: 'Admin Dashboard',
      target: a.target,
      reason: a.reason,
      timestamp: a.createdAt,
      user: a.admin ? { name: `${a.admin.firstName} ${a.admin.lastName}`, role: a.admin.role } : null
    })));
  }

  // 3. System Audit Logs
  if (origin === 'ALL' || origin === 'SYSTEM') {
    const auditQuery = {
      where: search ? {
        OR: [
          { action: { contains: search, mode: "insensitive" } },
          { user: baseUserQuery }
        ]
      } : {},
    };
    totalAudit = await prisma.auditLog.count(auditQuery as any);
    const audits = await prisma.auditLog.findMany({
      ...auditQuery,
      take,
      orderBy: { timestamp: "desc" },
      include: { user: { select: { firstName: true, lastName: true, role: true } } }
    } as any);

    combinedLogs.push(...audits.map((a: any) => ({
      id: a.id,
      source: 'SYSTEM',
      action: a.action,
      ipAddress: a.ipAddress,
      userAgent: a.deviceId,
      target: null,
      reason: null,
      timestamp: a.timestamp,
      user: a.user ? { name: `${a.user.firstName} ${a.user.lastName}`, role: a.user.role } : null
    })));
  }

  // Sort unified logs chronologically
  combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = totalActivity + totalAdmin + totalAudit;
  
  return {
    logs: combinedLogs.slice(skip, skip + Number(limit)),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    },
    metrics: {
      mobileEvents: totalActivity,
      adminEvents: totalAdmin,
      systemEvents: totalAudit,
      totalEvents: total
    }
  };
}

/**
 * Broadcast notifications
 */
export async function broadcastNotification(title: string, message: string, target: string, userIds?: string[]) {
  let users: any[] = [];
  
  if (target === "CUSTOM" && userIds && userIds.length > 0) {
    users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } });
  } else {
    const where: any = {};
    if (target === "VERIFIED") where.idStatus = "VERIFIED";
    if (target === "MEMBER") where.role = "MEMBER";
    users = await prisma.user.findMany({ where, select: { id: true } });
  }
  const logs = users.map(user => ({
    userId: user.id,
    title,
    message,
    type: "REMINDER" as any,
    channel: "IN_APP" as any,
    status: "SENT" as any,
    createdAt: new Date()
  }));

  if (logs.length > 0) {
    await prisma.notificationLog.createMany({ data: logs });
  }

  return { message: `Broadcasted to ${users.length} users`, recipientCount: users.length };
}

/**
 * Get all payouts
 */
export async function getPayouts() {
  const payouts = await prisma.payout.findMany({
    include: {
      recipient: { select: { firstName: true, lastName: true, phoneNumber: true } },
      equb: { select: { name: true, total: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return payouts.map(p => ({
    ...p,
    user: p.recipient, // Map recipient to user for frontend consistency
    amount: p.equb?.total || 0,
    status: p.confirmedAt ? 'COMPLETED' : 'PENDING',
    paidAt: p.confirmedAt
  }));
}

/**
 * Get all user attachments
 */
export async function getAttachments() {
  return await prisma.attachment.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Delete support ticket (Admin)
 */
export async function deleteSupportTicket(id: string) {
  return await prisma.supportTicket.delete({
    where: { id }
  });
}

/**
 * Update support ticket status
 */
export async function updateSupportTicketStatus(id: string, status: string) {
  return await prisma.supportTicket.update({
    where: { id },
    data: { status: status as any }
  });
}

/**
 * Get all support tickets
 */
export async function getSupportTickets() {
  return await prisma.supportTicket.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Delete a user attachment (Admin)
 */
export async function deleteAttachment(id: string) {
  return await prisma.attachment.delete({
    where: { id }
  });
}
export async function getEqubRegistrations() {
  return await prisma.equbRegistration.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phoneNumber: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Get detailed platform monitoring statistics
 */
export async function getPlatformMonitoring() {
  const [totalPayouts, avgContribution] = await Promise.all([
    prisma.payout.count(),
    prisma.equb.aggregate({ _avg: { contributionAmount: true } })
  ]);

  const paymentStats = await prisma.payment.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  return {
    totalPayoutsRecorded: totalPayouts,
    averageContribution: Math.round(avgContribution._avg.contributionAmount || 0),
    paymentHealth: paymentStats
  };
}

/**
 * Get quick counts for sidebar badges
 */
export async function getSidebarCounts() {
  const [pendingKyc, pendingRegistrations, attachmentCount, ticketCount] = await Promise.all([
    prisma.user.count({ where: { idStatus: "PENDING" } }),
    prisma.equbRegistration.count(),
    prisma.attachment.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } })
  ]);
  return { pendingKyc, pendingRegistrations, attachmentCount, ticketCount };
}
