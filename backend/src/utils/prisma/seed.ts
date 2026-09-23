import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { EqubType, EqubState, PayoutOrderType } from "@prisma/client";

async function main() {
  const startDate = new Date("2026-02-28");
  const endDate = new Date("2026-04-18");
  const hashedPassword = await bcrypt.hash("@Isru4600", 10);
  const adminPasswordHash = await bcrypt.hash("password123!", 10);

  await prisma.user.upsert({
    where: { username: "@Isru4600" },
    update: {},
    create: {
      username: "@Isru4600",
      passwordHash: hashedPassword,
      firstName: "Israel",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "Superadmin@gmail.com" },
    update: {},
    create: {
      email: "Superadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "financeadmin@gmail.com" },
    update: {},
    create: {
      email: "financeadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Finance",
      lastName: "Admin",
      role: "FINANCE_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "Supportadmin@gmail.com" },
    update: {},
    create: {
      email: "Supportadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Support",
      lastName: "Admin",
      role: "CUSTOMER_SERVICE_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.equb.deleteMany({}); 

  const equbs = [
    {
      name: "Daily Equb 300",
      contributionAmount: 300,
      numberOfMembers: 105,
      total: 31500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.DAILY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Daily Equb 500",
      contributionAmount: 500,
      numberOfMembers: 105,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.DAILY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Daily Equb 1000",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.DAILY,
      state: EqubState.ACTIVE,
    },

    {
      name: "Weekly Equb 2000",
      contributionAmount: 2000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.WEEKLY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Weekly Equb 3000",
      contributionAmount: 3000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.WEEKLY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Weekly Equb 5000",
      contributionAmount: 5000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.WEEKLY,
      state: EqubState.ACTIVE,
    },

    {
      name: "Monthly Equb 5000",
      contributionAmount: 5000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.MONTHLY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Monthly Equb 7000",
      contributionAmount: 7000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.MONTHLY,
      state: EqubState.ACTIVE,
    },
    {
      name: "Monthly Equb 10000",
      contributionAmount: 10000,
      numberOfMembers: 21,
      total: 52500,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.MONTHLY,
      state: EqubState.ACTIVE,
    },

    {
      name: "Vehicle Equb",
      contributionAmount: 30000,
      numberOfMembers: 105,
      total: 3150000,
      startDate,
      endDate: new Date("2028-02-18"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.VEHICLE,
      state: EqubState.ACTIVE,
    },
    {
      name: "House Equb",
      contributionAmount: 30000,
      numberOfMembers: 105,
      total: 3150000,
      startDate,
      endDate: new Date("2028-02-18"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.HOUSE,
      state: EqubState.ACTIVE,
    },
    {
      name: "IPhone 15 pro max Daily Equb",
      contributionAmount: 1500,
      numberOfMembers: 105,
      total: 157500,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.PHONE,
      state: EqubState.ACTIVE,
    },
    {
      name: "IPhone 13 Daily Equb",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.PHONE,
      state: EqubState.ACTIVE,
    },
    {
      name: "S24 ultra Daily Equb",
      contributionAmount: 700,
      numberOfMembers: 105,
      total: 73500,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.PHONE,
      state: EqubState.ACTIVE,
    },
    {
      name: "S21 Daily Equb",
      contributionAmount: 400,
      numberOfMembers: 105,
      total: 42000,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.PHONE,
      state: EqubState.ACTIVE,
    },

    {
      name: "Smart TV",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.TV,
      state: EqubState.ACTIVE,
    },
    {
      name: "Smart TV",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.TV,
      state: EqubState.ACTIVE,
    },
    {
      name: "Smart TV",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.TV,
      state: EqubState.ACTIVE,
    },
    {
      name: "Smart TV",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.TV,
      state: EqubState.ACTIVE,
    },

    {
      name: "Standard Refrigerator",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.REFRIGERATOR,
      state: EqubState.ACTIVE,
    },
    {
      name: "Standard Refrigerator",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.REFRIGERATOR,
      state: EqubState.ACTIVE,
    },
    {
      name: "Standard Refrigerator",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.REFRIGERATOR,
      state: EqubState.ACTIVE,
    },
    {
      name: "Standard Refrigerator",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.REFRIGERATOR,
      state: EqubState.ACTIVE,
    },

    {
      name: "Modern Sofa",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.SOFA,
      state: EqubState.ACTIVE,
    },
    {
      name: "Modern Sofa",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.SOFA,
      state: EqubState.ACTIVE,
    },
    {
      name: "Modern Sofa",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.SOFA,
      state: EqubState.ACTIVE,
    },
    {
      name: "Modern Sofa",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      startDate,
      endDate,
      payoutOrderType: PayoutOrderType.RANDOM,
      type: EqubType.SOFA,
      state: EqubState.ACTIVE,
    }
  ];

  for (const equb of equbs) {
    await prisma.equb.create({ data: equb });
  }

  console.log("✅ All old Equbs removed + new Equbs seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
