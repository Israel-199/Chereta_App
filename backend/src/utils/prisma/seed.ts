import prisma from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🧹 Clearing existing seed data...");

  // Delete auction-related records first if they have foreign keys
  await prisma.auctionItem.deleteMany();

  // Delete the seed admin accounts
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "Superadmin@gmail.com",
          "financeadmin@gmail.com",
          "Supportadmin@gmail.com",
        ],
      },
    },
  });

  console.log("✅ Existing seed data cleared.");

  const adminPasswordHash = await bcrypt.hash("password123!", 10);

  // Super Admin
  await prisma.user.create({
    data: {
      email: "Superadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // Finance Admin
  await prisma.user.create({
    data: {
      email: "financeadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Finance",
      lastName: "Admin",
      role: "FINANCE_ADMIN",
      status: "ACTIVE",
    },
  });

  // Customer Service Admin
  await prisma.user.create({
    data: {
      email: "Supportadmin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Support",
      lastName: "Admin",
      role: "CUSTOMER_SERVICE_ADMIN",
      status: "ACTIVE",
    },
  });

  // App config
  await prisma.appConfig.deleteMany();

  await prisma.appConfig.create({
    data: {
      appLive: true,
      launchDate: new Date(),
    },
  });

  const daysFromNow = (d: number) =>
    new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  // Create auctions
  await prisma.auctionItem.createMany({
    data: [
      {
        auctionCode: "CHR-001",
        title: "DUBAI 3-DAY TOUR PACKAGE ✈️",
        category: "DIGITAL",
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
        category: "APPLIANCE",
        categoryLabel: "Home Appliance",
        images: [
          "local:sofa",
          "local:sofa2",
          "local:sofa3",
        ],
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
        title: "16 kg La Mira Washing Machine",
        category: "APPLIANCE",
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
          dryingEfficiency: "Up to 90%",
        },
      },
    ],
  });

  console.log("✅ Chereta seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });