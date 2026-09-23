import { PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";

const prisma = new PrismaClient();

async function generateUniqueUserCode(): Promise<string> {
  let isUnique = false;
  let code = "";
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    code = randomInt(100000000, 999999999).toString();
    const existing = await prisma.user.findUnique({ where: { userCode: code } });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  if (!isUnique) throw new Error("Failed to generate unique user code");
  return code;
}

async function backfillUserCodes() {
  console.log("Starting backfill for missing userCode...");
  const users = await prisma.user.findMany({
    where: { userCode: null },
  });

  console.log(`Found ${users.length} users needing a userCode.`);

  for (const user of users) {
    try {
      const code = await generateUniqueUserCode();
      await prisma.user.update({
        where: { id: user.id },
        data: { userCode: code },
      });
      console.log(`Updated user ${user.id} with code ${code}`);
    } catch (error: any) {
      console.error(`Failed to update user ${user.id}:`, error.message);
    }
  }

  console.log("Backfill completed!");
}

backfillUserCodes()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
