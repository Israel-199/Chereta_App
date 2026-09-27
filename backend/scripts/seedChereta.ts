import prisma from "../src/utils/prisma/prisma";
import { formatAuctionCode } from "../src/lib/auctionCode";

const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function main() {
  // Ensure columns exist (e.g. if migrate deploy failed on Neon pooler)
  try {
    await prisma.$queryRaw`SELECT "categoryLabel" FROM "AuctionItem" LIMIT 1`;
  } catch {
    console.error(
      "AuctionItem schema is outdated. Run: npm run db:repair-chereta (or npm run db:migrate with DIRECT_DATABASE_URL set)",
    );
    process.exit(1);
  }

  await prisma.bid.deleteMany({});
  await prisma.auctionItem.deleteMany({});

  const auctions = [
    {
  auctionCode: "CHR-001",    
  title: "DUBAI 3-DAY TOUR PACKAGE ✈️",
  category: "DIGITAL" as const,
  categoryLabel: "Travel Package",
  itemNumber: "DUBAI-3DAY",
  images: [
    "local:dubia",
    "local:dubia1",
    "local:dubia2",
    "local:dubia3",
    "local:dubia4",
    "local:dubia5",
  ],
  serviceFee: 75,
  startTime: new Date(),
  endTime: daysFromNow(7),
  specs: {
    duration: "3 Days",
    traveler: "1 Person",
    departure: "Addis Ababa",
    destination: "Dubai, UAE",
    flight: "Round-Trip Air Ticket",
    visa: "Dubai Tourist Visa",
    accommodation: "Hotel Stay",
    sightseeing: "Dubai Major Attractions",
    desertSafari: "Included",
    transportation: "Included",
  },
},
   
    {
  auctionCode: "CHR-002",
  title: "Premium Sofa Set",
  category: "APPLIANCE" as const,
  categoryLabel: "Home Appliance",
  images: ["local:sofa", "local:sofa1", "local:sofa2"],
  serviceFee: 75,
  startTime: new Date(),
  endTime: daysFromNow(8),
  specs: {
    material: "Premium Fabric",
    seats: "3+2",
    color: "Modern Gray",
    frame: "Solid Wood",
    cushion: "High-Density Foam",
    style: "Modern",
    pieces: "5 Pieces",
    suitableFor: "Living Room",
  },
},
    {
      auctionCode: "CHR-003",
      title: "16 kg La Mira washing machine",
      category: "APPLIANCE" as const,
      categoryLabel: "Home Appliance",
      images: ["local:washing"],
      serviceFee: 75,
      startTime: new Date(),
      endTime: daysFromNow(9),
      specs: {
  capacity: "16kg",
  spinCapacity: "7kg",
  energy: "A++",
  washPower: "500W",
  spinPower: "200W",
  totalPower: "700W",
  dryingEfficiency: "Up to 90%"
},
    },
  ];

  let codeSeq = 1;
  for (const a of auctions) {
    await prisma.auctionItem.create({
      data: { ...a, auctionCode: formatAuctionCode(codeSeq++) },
    });
  }

  console.log(`Seeded ${auctions.length} chereta auctions.`);

  const endedCount = await prisma.auctionItem.count({ where: { status: "ENDED" } });
  if (endedCount >= 3) {
    console.log("Winner gallery seed skipped (ended auctions already exist).");
    return;
  }

  const winners = [
    {
      firstName: "Hanna",
      lastName: "Bekele",
      phoneNumber: "+251911000001",
      address: "Addis Ababa, Bole",
    },
    {
      firstName: "Samuel",
      lastName: "Tadesse",
      phoneNumber: "+251911000002",
      address: "Addis Ababa, CMC",
    },
    {
      firstName: "Meron",
      lastName: "Alemu",
      phoneNumber: "+251911000003",
      address: "Hawassa",
    },
  ];

  const winnerUsers = [];
  for (const w of winners) {
    const u = await prisma.user.upsert({
      where: { phoneNumber: w.phoneNumber },
      update: { firstName: w.firstName, lastName: w.lastName, address: w.address },
      create: {
        phoneNumber: w.phoneNumber,
        firstName: w.firstName,
        lastName: w.lastName,
        address: w.address,
        status: "ACTIVE",
      },
    });
    winnerUsers.push(u);
  }

  const endedAuctions = [
    {
      title: "Samsung Galaxy S24 Ultra (Ended)",
      category: "DIGITAL" as const,
      categoryLabel: "Mobile Phones",
      images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600"],
      serviceFee: 75,
      winnerIdx: 0,
      winningAmount: 42.17,
    },
    {
      title: "LG Smart TV 55\" (Ended)",
      category: "APPLIANCE" as const,
      categoryLabel: "Electronics",
      images: ["https://images.unsplash.com/photo-1593359677877-a4bb92f829d1?w=600"],
      serviceFee: 75,
      winnerIdx: 1,
      winningAmount: 88.5,
    },
    {
      title: "HP Pavilion Laptop (Ended)",
      category: "DIGITAL" as const,
      categoryLabel: "Laptops",
      images: ["local:laptop"],
      serviceFee: 75,
      winnerIdx: 2,
      winningAmount: 15.03,
    },
  ];

  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  for (const ea of endedAuctions) {
    const auction = await prisma.auctionItem.create({
      data: {
        auctionCode: formatAuctionCode(codeSeq++),
        title: ea.title,
        category: ea.category,
        categoryLabel: ea.categoryLabel,
        images: ea.images,
        serviceFee: ea.serviceFee,
        startTime: daysAgo(14),
        endTime: daysAgo(2),
        status: "ENDED",
        winnerUserId: winnerUsers[ea.winnerIdx].id,
        winningAmount: ea.winningAmount,
        resolvedAt: daysAgo(2),
      },
    });

    const winnerId = winnerUsers[ea.winnerIdx].id;
    const duplicateAmount = ea.winningAmount + 10.5;
    await prisma.bid.createMany({
      data: [
        { userId: winnerId, auctionItemId: auction.id, amount: ea.winningAmount },
        { userId: winnerUsers[(ea.winnerIdx + 1) % 3].id, auctionItemId: auction.id, amount: duplicateAmount },
        { userId: winnerUsers[(ea.winnerIdx + 2) % 3].id, auctionItemId: auction.id, amount: duplicateAmount },
        { userId: winnerUsers[(ea.winnerIdx + 1) % 3].id, auctionItemId: auction.id, amount: ea.winningAmount + 2 },
      ],
    });
  }

  console.log(`Seeded ${endedAuctions.length} ended auctions with winners.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
