/**
 * Applies Chereta SQL when migrate deploy fails (P3005 / P1001 / missing columns).
 * Run: npm run db:repair-chereta
 */
import { execSync } from "child_process";
import path from "path";

const root = path.join(__dirname, "..");
const schema = "src/utils/prisma/schema.prisma";

const migrations = [
  "20260923900000_chereta_auction_base",
  "20260924000000_chereta_auction_fields",
  "20260924120000_chereta_chapa_payments",
  "20260924140000_auction_terms_acceptance",
  "20260925100000_auction_code_chr_string",
];

function run(cmd: string) {
  execSync(cmd, { cwd: root, stdio: "inherit", env: process.env });
}

for (const m of migrations) {
  const file = path.join(root, "src/utils/prisma/migrations", m, "migration.sql");
  console.log(`Executing ${m}...`);
  run(`npx prisma db execute --file "${file}" --schema "${schema}"`);
}

// Mark Chereta migrations as applied (safe after SQL repair; fixes P3005 on next deploy)
for (const m of migrations) {
  try {
    run(`npx prisma migrate resolve --applied ${m}`);
    console.log(`Marked applied: ${m}`);
  } catch {
    console.warn(`Could not mark ${m} as applied (may already exist in _prisma_migrations).`);
  }
}

console.log("\nChereta schema repair finished.");
console.log("Next: npm run seed:chereta && npm run dev");
