import prisma from "../../utils/prisma/prisma";

export class EqubService {
  async createEqub(data: any) {
    return prisma.equb.create({ data });
  }

  async getEqubsForUser(userId: string, role: string) {
    const equbs = await prisma.equb.findMany({
      orderBy: { contributionAmount: "asc" },
      include: {
        members: { include: { user: true } },
        payments: true,
        payouts: true,
      },
    });
    return equbs.map((equb) => this.formatEqub(equb, userId, role));
  }

  async getMyEqubs(userId: string, role: string) {
    const equbs = await prisma.equb.findMany({
      where: { members: { some: { userId } } },
      orderBy: { contributionAmount: "asc" },
      include: {
        members: { include: { user: true } },
        payments: true,
        payouts: true,
      },
    });
    return equbs.map((equb) => this.formatEqub(equb, userId, role));
  }

  async getEqubByIdForUser(id: string, userId: string, role: string) {
    const equb = await prisma.equb.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        payments: true,
        payouts: true,
      },
    });
    if (!equb) return null;
    return this.formatEqub(equb, userId, role);
  }

  async updateEqub(id: string, data: any) {
    return prisma.equb.update({ where: { id }, data });
  }

  async deleteEqub(id: string) {
    return prisma.equb.delete({ where: { id } });
  }

  async deleteAllEqubs() {
    return prisma.equb.deleteMany();
  }

  async joinEqub(equbId: string, userId: string) {
    const existing = await prisma.equbMember.findUnique({
      where: { equbId_userId: { equbId, userId } },
    });
    if (existing) throw new Error("alreadyJoined");

    const myEqubs = await prisma.equb.findMany({
      where: { members: { some: { userId } } },
      include: { payments: true },
    });

    const unpaidEqubs = myEqubs.filter(
      (equb) =>
        !equb.payments.some((p) => p.userId === userId && p.status === "PAID"),
    );

    /*
    if (unpaidEqubs.length >= 3) {
      throw new Error("mustPayFirst");
    }
    */

    return prisma.equbMember.create({
      data: { equbId, userId },
    });
  }

  async leaveEqub(equbId: string, userId: string) {
    const existing = await prisma.equbMember.findUnique({
      where: { equbId_userId: { equbId, userId } },
    });
    if (!existing) throw new Error("Not a member of this equb");

    return prisma.equbMember.delete({
      where: { equbId_userId: { equbId, userId } },
    });
  }

  private formatEqub(equb: any, userId: string, role: string) {
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const isMember = equb.members.some((m: any) => m.userId === userId);
    const hasPaid = equb.payments.some(
      (p: any) => p.userId === userId && p.status === "PAID",
    );

    const isStarted = new Date() >= new Date(equb.startDate);

    const userMember = equb.members.find((m: any) => m.userId === userId);
    const isUserSuspended = userMember?.isSuspended || false;
    const userSuspensionReason = userMember?.suspensionReason || null;

    const fullMembersList = equb.members.map((m: any) => {
      const payment = equb.payments.find(
        (p: any) => p.userId === m.userId && p.status === "PAID",
      );
      const firstName = m.user?.firstName || "";
      const lastName = m.user?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || m.userId;

      return {
        userId: m.userId,
        name: fullName,
        profileImage: m.user?.profileImage,
        contribution: equb.contributionAmount,
        paid: !!payment,
        paidAt: payment?.paidAt ? formatDate(new Date(payment.paidAt)) : null,
        isSuspended: m.isSuspended,
        suspensionReason: m.suspensionReason
      };
    });

    const userPayments = equb.payments.filter((p: any) => p.userId === userId && p.status === "PAID");
    const amountPaid = userPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const completedRounds = userPayments.length;
    const totalPotentialContribution = equb.contributionAmount * equb.numberOfMembers;
    const remainingBalance = totalPotentialContribution - amountPaid;
    const remainingRounds = Math.max(0, equb.numberOfMembers - completedRounds);

    const baseResponse = {
      id: equb.id,
      name: equb.name,
      type: equb.type,
      contributionAmount: equb.contributionAmount,
      numberOfMembers: equb.numberOfMembers,
      startDate: formatDate(new Date(equb.startDate)),
      endDate: formatDate(new Date(equb.endDate)),
      rawStartDate: equb.startDate,
      rawEndDate: equb.endDate,
      total: equb.total,
      propertyModel: equb.propertyModel,
      frontImage: equb.frontImage,
      backImage: equb.backImage,
      status: equb.state || "OPEN",
      suspensionReason: equb.suspensionReason || null,
      sellingPrice: equb.sellingPrice,
      isMember,
      hasPaid,
      isStarted,
      isUserSuspended,
      userSuspensionReason,
      stats: {
        amountSaved: amountPaid,
        remainingBalance: remainingBalance,
        amountPaid: amountPaid,
        unpaidAmount: remainingBalance,
        completedRounds: completedRounds,
        remainingRounds: remainingRounds,
      }
    };

    if (["ADMIN", "SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN", "FINANCE_ADMIN"].includes(role)) {
      return { ...equb, ...baseResponse, members: fullMembersList, joinedCount: fullMembersList.length };
    }

    if (!isStarted) {
      return {
        ...baseResponse,
        members: [],
        messageKey: "membersHidden",
      };
    }

    const visibleMembers = fullMembersList.filter((m: any) => m.paid);

    if (isMember && hasPaid) {
      return {
        ...equb,
        ...baseResponse,
        members: visibleMembers,
      };
    }

    if (isMember && !hasPaid) {
      return { ...baseResponse, messageKey: "noPayment" };
    }

    return { ...baseResponse, view: "summary" };
  }

  async getHistoryStats(userId: string) {
    const paidPayments = await prisma.payment.findMany({
      where: { userId, status: "PAID" },
      select: { amount: true }
    });
    const totalAmountSaved = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const payouts = await prisma.payout.findMany({
      where: { recipientUserId: userId },
      include: { equb: { select: { total: true } } }
    });
    const totalAmountReceived = payouts.reduce((sum, p) => sum + (p.equb?.total || 0), 0);

    const myEqubs = await prisma.equb.findMany({
      where: { members: { some: { userId } } },
      include: { 
        payments: { where: { userId, status: "PAID" } },
        members: true
      }
    });

    let totalRemainingBalance = 0;
    let completedEqubsCount = 0;

    for (const equb of myEqubs) {
      if (equb.state === "COMPLETED") {
        completedEqubsCount++;
      } else {
        const potentialTotal = equb.contributionAmount * equb.numberOfMembers;
        const paidTotal = equb.payments.reduce((sum, p) => sum + p.amount, 0);
        totalRemainingBalance += Math.max(0, potentialTotal - paidTotal);
      }
    }

    return {
      totalAmountSaved,
      totalAmountReceived,
      totalRemainingBalance,
      completedEqubsCount
    };
  }

  async getCompletedEqubs(userId: string) {
    const equbs = await prisma.equb.findMany({
      where: {
        members: { some: { userId } },
        state: "COMPLETED"
      },
      orderBy: { endDate: "desc" }
    });

    return equbs.map(equb => ({
      id: equb.id,
      name: equb.name,
      type: equb.type,
      total: equb.total,
      startDate: equb.startDate.toISOString(),
      endDate: equb.endDate.toISOString(),
      status: equb.state
    }));
  }

  async updateMemberStatuses() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        dueDate: { lt: sevenDaysAgo }
      },
      include: {
        equb: { select: { name: true } }
      }
    });

    const results = [];

    for (const payment of overduePayments) {
      const updated = await prisma.equbMember.updateMany({
        where: {
          userId: payment.userId,
          equbId: payment.equbId,
          isSuspended: false
        },
        data: {
          isSuspended: true,
          suspensionReason: `Late payment for ${payment.equb.name} (Due: ${payment.dueDate.toLocaleDateString()})`
        } as any
      });
      if (updated.count > 0) {
        results.push({ userId: payment.userId, equbId: payment.equbId, action: "SUSPENDED" });
      }
    }

    const membersToReinstate = await prisma.equbMember.findMany({
      where: { isSuspended: true }
    });

    for (const member of membersToReinstate) {
      const pendingOverdue = await prisma.payment.count({
        where: {
          userId: member.userId,
          equbId: member.equbId,
          status: "PENDING",
          dueDate: { lt: sevenDaysAgo }
        }
      });

      if (pendingOverdue === 0) {
        await prisma.equbMember.update({
          where: { id: member.id },
          data: { isSuspended: false, suspensionReason: null }
        });
        results.push({ userId: member.userId, equbId: member.equbId, action: "REINSTATED" });
      }
    }

    return results;
  }

  async performDraw(equbId: string) {
    const equb = await prisma.equb.findUnique({
      where: { id: equbId },
      include: {
        members: { where: { isSuspended: false } },
        payouts: true
      }
    });

    if (!equb) throw new Error("Equb not found");
    const alreadyWonUserIds = equb.payouts.map(p => p.recipientUserId);
    const eligibleMembers = equb.members.filter(m => !alreadyWonUserIds.includes(m.userId));

    if (eligibleMembers.length === 0) throw new Error("No eligible members left for draw");

    const winnerIndex = Math.floor(Math.random() * eligibleMembers.length);
    const winner = eligibleMembers[winnerIndex];

    const nextCycle = (equb.payouts.length + 1);

    const payout = await prisma.payout.create({
      data: {
        equbId,
        recipientUserId: winner.userId,
        cycleNumber: nextCycle,
        confirmedByRole: null
      }
    });

    return { winner, payout };
  }

  async toggleEqubPause(id: string, reason?: string) {
    const equb = await prisma.equb.findUnique({ where: { id } });
    if (!equb) throw new Error("Equb not found");

    const newState = equb.state === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    return prisma.equb.update({
      where: { id },
      data: { 
        state: newState,
        suspensionReason: newState === 'SUSPENDED' ? reason : null
      } as any
    });
  }

  async getEqubFormSummaries() {
    return prisma.equb.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { contributionAmount: true }
    });
  }

  async getAvailableEqubTypes() {
    const types = await prisma.equb.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    return types.map(t => t.type);
  }

  // ---- Equb Share Marketplace ----

  async getListingsForEqub(equbId: string, userId: string) {
    // Verify caller is a member of this equb
    const membership = await prisma.equbMember.findUnique({
      where: { equbId_userId: { equbId, userId } },
    });
    if (!membership) throw new Error("You must be a member of this equb to view listings");

    const listings = await prisma.equbShareListing.findMany({
      where: { equbId, status: "ACTIVE" },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true, userCode: true },
        },
        equb: {
          select: { id: true, name: true, contributionAmount: true, numberOfMembers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return listings.map((l: any) => ({
      id: l.id,
      equbId: l.equbId,
      equbName: l.equb.name,
      equbAmount: l.equb.contributionAmount,
      sellingPrice: l.sellingPrice,
      remainingRounds: l.remainingRounds,
      sellerName: `${l.seller.firstName || ""} ${l.seller.lastName || ""}`.trim() || "Unknown",
      sellerCode: l.seller.userCode || "N/A",
      sellerId: l.seller.id,
      status: l.status,
      createdAt: l.createdAt,
    }));
  }

  async getMyListings(userId: string) {
    const listings = await prisma.equbShareListing.findMany({
      where: { sellerId: userId },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true, userCode: true },
        },
        equb: {
          select: { id: true, name: true, contributionAmount: true, numberOfMembers: true },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, userCode: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return listings.map((l: any) => ({
      id: l.id,
      equbId: l.equbId,
      equbName: l.equb.name,
      equbAmount: l.equb.contributionAmount,
      sellingPrice: l.sellingPrice,
      remainingRounds: l.remainingRounds,
      sellerName: `${l.seller.firstName || ""} ${l.seller.lastName || ""}`.trim() || "Unknown",
      sellerCode: l.seller.userCode || "N/A",
      sellerId: l.seller.id,
      buyerName: l.buyer ? `${l.buyer.firstName || ""} ${l.buyer.lastName || ""}`.trim() : null,
      buyerCode: l.buyer?.userCode || null,
      status: l.status,
      createdAt: l.createdAt,
    }));
  }

  async createListing(equbId: string, sellerId: string, sellingPrice: number) {
    // Verify seller is a member
    const membership = await prisma.equbMember.findUnique({
      where: { equbId_userId: { equbId, userId: sellerId } },
    });
    if (!membership) throw new Error("You must be a member of this equb to list a share");

    // Check no existing active listing for this member in this equb
    const existing = await prisma.equbShareListing.findFirst({
      where: { equbId, sellerId, status: "ACTIVE" },
    });
    if (existing) throw new Error("You already have an active listing in this equb");

    // Auto-calculate remaining rounds
    const equb = await prisma.equb.findUnique({
      where: { id: equbId },
      include: {
        payments: { where: { userId: sellerId, status: "PAID" } },
      },
    });
    if (!equb) throw new Error("Equb not found");

    const completedRounds = equb.payments.length;
    const remainingRounds = Math.max(0, equb.numberOfMembers - completedRounds);

    return prisma.equbShareListing.create({
      data: {
        equbId,
        sellerId,
        sellingPrice,
        remainingRounds,
      },
    });
  }

  async buyListing(equbId: string, listingId: string, buyerId: string) {
    // Verify buyer is a member of this equb (same group check)
    const buyerMembership = await prisma.equbMember.findUnique({
      where: { equbId_userId: { equbId, userId: buyerId } },
    });
    if (!buyerMembership) throw new Error("You must be a member of this equb to buy a share");

    const listing = await prisma.equbShareListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new Error("Listing not found");
    if (listing.equbId !== equbId) throw new Error("This listing does not belong to this equb group");
    if (listing.status !== "ACTIVE") throw new Error("This listing is no longer available");
    if (listing.sellerId === buyerId) throw new Error("You cannot buy your own listing");

    return prisma.equbShareListing.update({
      where: { id: listingId },
      data: { status: "SOLD", buyerId },
    });
  }

  async cancelListing(listingId: string, userId: string) {
    const listing = await prisma.equbShareListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== userId) throw new Error("You can only cancel your own listings");
    if (listing.status !== "ACTIVE") throw new Error("Only active listings can be cancelled");

    return prisma.equbShareListing.update({
      where: { id: listingId },
      data: { status: "CANCELLED" },
    });
  }

  async getEqubMembersDetail(equbId: string) {
    const equb = await prisma.equb.findUnique({
      where: { id: equbId },
      include: {
        members: { include: { user: true } },
        payments: { orderBy: { createdAt: "desc" } },
        payouts: true,
        shareListings: true
      }
    });

    if (!equb) throw new Error("Equb not found");

    const now = new Date().getTime();

    return equb.members.map(member => {
      const user = member.user;
      
      const userPayments = equb.payments.filter((p: any) => p.userId === member.userId);
      const latestPayment = userPayments[0];

      let paymentStatus = "Not Available";
      let overdueTime = null;

      if (latestPayment) {
        if (latestPayment.status === "PAID") {
          paymentStatus = "Paid";
        } else {
          paymentStatus = "Not Paid";
          const dueDate = new Date(latestPayment.dueDate).getTime();
          if (now > dueDate) {
            const elapsedHours = Math.floor((now - dueDate) / (1000 * 60 * 60));
            const elapsedDays = Math.floor(elapsedHours / 24);
            if (elapsedDays > 0) {
              overdueTime = `${elapsedDays} days`;
            } else {
              overdueTime = `${elapsedHours} hours`;
            }
          }
        }
      }

      const hasWon = equb.payouts.some((p: any) => p.recipientUserId === member.userId);
      const boughtListing = equb.shareListings.find((l: any) => l.buyerId === member.userId && l.status === "SOLD");
      const soldListing = equb.shareListings.find((l: any) => l.sellerId === member.userId && l.status === "SOLD");

      return {
        id: member.id,
        userId: member.userId,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.phoneNumber || "Unknown",
        joinedAt: member.joinedAt,
        paymentStatus,
        overdueTime,
        lotteryStatus: hasWon ? "Won" : "Not Yet Won",
        punishmentStatus: "Not Punished",
        suspensionStatus: member.isSuspended ? "Suspended" : "Active",
        sellStatus: soldListing ? "Sold" : "Not Sold",
        buyStatus: boughtListing ? "Bought" : "Not Bought"
      };
    });
  }

  async getLotteryRoundStatus(equbId?: string) {
    const now = new Date();
    
    // Determine active Sunday 16:00 LT (16:00 local time)
    const activeSunday = new Date(now);
    const day = now.getDay(); // 0 is Sunday
    const hours = now.getHours();

    let daysToSubtract = day;
    if (day === 0 && hours < 16) {
      daysToSubtract = 7; // Previous Sunday was 7 days ago
    }
    
    activeSunday.setDate(now.getDate() - daysToSubtract);
    activeSunday.setHours(16, 0, 0, 0);

    const nextSunday = new Date(activeSunday);
    nextSunday.setDate(activeSunday.getDate() + 7);

    const dateKey = activeSunday.toISOString().split("T")[0];
    const totalSlots = 104;

    let round = await prisma.lotteryRound.findFirst({
      where: { date: activeSunday }
    });

    let winnerSlot = 1;

    if (!round) {
      let seedStr = `${dateKey}_${equbId || "default"}`;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      winnerSlot = (Math.abs(hash) % totalSlots) + 1;

      try {
        round = await prisma.lotteryRound.create({
          data: {
            date: activeSunday,
            reward: JSON.stringify({ winnerSlot, equbId: equbId || "default" }),
            isActive: true
          }
        });
      } catch (e) {
        round = await prisma.lotteryRound.findFirst({
          where: { date: activeSunday }
        });
        if (round?.reward) {
          try {
            const parsed = JSON.parse(round.reward);
            winnerSlot = parsed.winnerSlot || winnerSlot;
          } catch (_) {}
        }
      }
    } else if (round.reward) {
      try {
        const parsed = JSON.parse(round.reward);
        winnerSlot = parsed.winnerSlot || 1;
      } catch (_) {
        winnerSlot = 1;
      }
    }

    return {
      equbId: equbId || "default",
      totalSlots,
      winnerSlot,
      drawDate: activeSunday.toISOString(),
      nextDrawDate: nextSunday.toISOString(),
      nextDrawTimestamp: nextSunday.getTime(),
      drawTimestamp: activeSunday.getTime(),
      serverTime: now.toISOString(),
      serverTimestamp: now.getTime(),
      isDrawHappened: now.getTime() >= activeSunday.getTime()
    };
  }
}

