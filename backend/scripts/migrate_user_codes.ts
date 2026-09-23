import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting user code migration...");
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // First, find the maximum HQ number already assigned to avoid conflicts
  const hqUsers = users.filter(u => u.userCode && u.userCode.startsWith("HQ"));
  let maxCounter = 0;
  for (const u of hqUsers) {
    const numericPart = parseInt(u.userCode!.substring(2), 10);
    if (!isNaN(numericPart) && numericPart > maxCounter) {
      maxCounter = numericPart;
    }
  }

  let counter = maxCounter > 0 ? maxCounter + 1 : 1;

  for (const user of users) {
    const isAlreadyMigrated = user.userCode && user.userCode.startsWith("HQ") && !isNaN(parseInt(user.userCode.substring(2), 10));
    
    if (!isAlreadyMigrated) {
       // Just to be bulletproof on uniqueness
       let newCode = "";
       let unique = false;
       while (!unique && counter < 1000000) {
         newCode = `HQ${counter.toString().padStart(3, '0')}`;
         const existing = await prisma.user.findUnique({ where: { userCode: newCode } });
         if (!existing) {
           unique = true;
         } else {
           counter++;
         }
       }

       console.log(`Migrating user ${user.id} (old code: ${user.userCode || "none"}) -> ${newCode}`);
       await prisma.user.update({
         where: { id: user.id },
         data: { userCode: newCode }
       });
       counter++;
    }
  }

  console.log("Migration finished successfully.");
}

migrate()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
