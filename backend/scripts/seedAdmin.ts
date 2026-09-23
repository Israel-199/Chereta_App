import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "Israel@gmail.com";
  const password = "DevIsrael";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: "ACTIVE"
    },
    create: {
      email,
      passwordHash,
      role: Role.ADMIN,
      firstName: "Israel",
      lastName: "Admin",
      status: "ACTIVE"
    }
  });

  console.log("Admin seeded:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
