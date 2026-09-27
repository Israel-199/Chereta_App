import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Backend is alive 🚀" });
});

import { syncExpiredAuctions } from "./module/chereta/chereta.service";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  syncExpiredAuctions().catch(() => {});
  setInterval(() => {
    syncExpiredAuctions().catch(() => {});
  }, 30_000);
});
