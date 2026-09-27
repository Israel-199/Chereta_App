require("dotenv").config();
const { spawnSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL.replace("-pooler", "");
  console.log("DIRECT_DATABASE_URL set from DATABASE_URL (removed -pooler).");
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/runWithDirectUrl.js <command> [args...]");
  process.exit(1);
}

const result = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: require("path").join(__dirname, ".."),
});

process.exit(result.status ?? 1);
