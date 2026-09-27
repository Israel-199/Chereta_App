import prisma from "../../utils/prisma/prisma";

/**
 * Get overall dashboard statistics
 */
export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    fraudAlerts,
    notificationCount,
    recentActivities,
    pendingKycCount,
    totalAuctions,
    activeAuctions,
    totalBids
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.auditLog.count({ where: { action: { contains: "SUSPICIOUS" } } }),
    prisma.notificationLog.count(),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, phoneNumber: true } } },
    }),
    prisma.user.count({ where: { idStatus: "PENDING" } }),
    prisma.auctionItem.count(),
    prisma.auctionItem.count({ where: { status: "ACTIVE" } }),
    prisma.bid.count()
  ]);

  const now = new Date();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [
    newUsersToday,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: todayStart } } })
  ]);

  return {
    totalUsers,
    activeUsers,
    fraudAlerts,
    notificationSummary: notificationCount,
    pendingKyc: pendingKycCount,
    totalAuctions,
    activeAuctions,
    totalBids,
    newUsersToday,
    recentActivities
  };
}

/**
 * Enhanced user searching and filtering
 */
export async function getUsers(filters: any) {
  const { status, idStatus, search } = filters;
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

  return await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
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
 * Fetch system audit logs
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

/**
 * Get quick counts for sidebar badges
 */
export async function getSidebarCounts() {
  const [pendingKyc, attachmentCount, ticketCount] = await Promise.all([
    prisma.user.count({ where: { idStatus: "PENDING" } }),
    prisma.attachment.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } })
  ]);
  return { pendingKyc, attachmentCount, ticketCount };
}
