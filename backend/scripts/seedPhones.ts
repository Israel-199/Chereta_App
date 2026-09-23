import { PrismaClient, EqubType, PayoutOrderType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phone Equbs...");

  const phoneEqubs = [
    {
      name: "IPhone 15 pro max",
      contributionAmount: 1500,
      numberOfMembers: 105,
      total: 157500,
      type: EqubType.PHONE,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
    },
    {
      name: "IPhone 13",
      contributionAmount: 1000,
      numberOfMembers: 105,
      total: 105000,
      type: EqubType.PHONE,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
    },
    {
      name: "S24 ultra",
      contributionAmount: 700,
      numberOfMembers: 105,
      total: 73500,
      type: EqubType.PHONE,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
    },
    {
      name: "S21",
      contributionAmount: 400,
      numberOfMembers: 105,
      total: 42000,
      type: EqubType.PHONE,
      startDate: new Date("2026-05-30"),
      endDate: new Date("2026-10-30"),
      payoutOrderType: PayoutOrderType.RANDOM,
    },
  ];

  for (const equb of phoneEqubs) {
    const existing = await prisma.equb.findFirst({
      where: { name: equb.name, type: EqubType.PHONE }
    });

    if (!existing) {
      await prisma.equb.create({ data: equb });
      console.log(`Created Equb: ${equb.name}`);
    } else {
      console.log(`Equb already exists: ${equb.name}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
