const { execSync } = require('child_process');
const fs = require('fs');

console.log("Starting Prisma Migration Baseline Process...");

const dirs = fs.readdirSync('src/utils/prisma/migrations')
  .filter(d => fs.statSync(`src/utils/prisma/migrations/${d}`).isDirectory());

let successCount = 0;
for (const d of dirs) {
    try {
        console.log(`Resolving ${d}...`);
        execSync(`npx prisma migrate resolve --applied ${d}`, { stdio: 'inherit' });
        successCount++;
    } catch (e) {
        console.log(`Failed or already applied: ${d}`);
    }
}
console.log(`Successfully baselined ${successCount} migrations to the Neon DB.`);
