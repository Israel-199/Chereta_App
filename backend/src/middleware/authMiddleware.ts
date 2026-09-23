import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "../utils/prisma/prisma";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;

    // Track active interactions for mobile users
    res.on("finish", () => {
      // Only track mutations to avoid flooding DB with GET requests
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
        if (decoded && decoded.id && decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN" && decoded.role !== "FINANCE_ADMIN" && decoded.role !== "CUSTOMER_SERVICE_ADMIN") {
          let action = `${req.method}_${req.originalUrl.split('?')[0].split('/').pop()?.toUpperCase()}`;
          if (action.endsWith('_')) action = action.slice(0, -1);
          
          prisma.activityLog.create({
            data: {
              userId: decoded.id,
              action: action,
              ipAddress: req.ip || req.socket?.remoteAddress || "Unknown",
              userAgent: req.headers["user-agent"] || "Mobile App"
            }
          }).catch((err: any) => console.error("Activity Log Error:", err));
        }
      }
    });

    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN", "CUSTOMER_SERVICE_ADMIN"];
  
  if (!user || !adminRoles.includes(user.role)) {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || (!roles.includes(user.role) && user.role !== "ADMIN")) {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    }
    next();
  };
}
