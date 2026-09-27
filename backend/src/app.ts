import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import axios from "axios";
require("dotenv").config();

import authRoutes from "./module/auth/auth.route";
import userRoutes from "./module/user/user.route";
import cheretaRoutes from "./module/chereta/chereta.route";
import errorHandler from "./middleware/errorHandler";
import configRoutes from "./module/config/config.route";
import paymentRoutes from "./module/payment/payment.routes";
import supportRoutes from "./module/support/support.route";
import adminRoutes from "./module/admin/admin.route";

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "https://habesha-equb-app.onrender.com",
      ];

      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /^https:\/\/(\w+\.)?novaexams\.com$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const limiter = rateLimit({ windowMs: 15 * 1000 * 60, max: 1000 }); 
app.use(limiter);

app.use(
  "/profile_photos",
  express.static(path.join(process.cwd(), "profile_photos")),
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chereta", cheretaRoutes);
app.use("/api/config", configRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

const BACKEND_URL =
  process.env.BACKEND_URL || "https://habesha-equb-app-23p8.onrender.com/";
setInterval(
  () => {
    axios
      .get(BACKEND_URL)
      .then(() => console.log("Pinged backend to stay awake"))
      .catch((err) => console.error("Ping failed:", err.message));
  },
  14 * 60 * 1000,
);

export default app;
