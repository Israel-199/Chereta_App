import { Request } from "express";
import jwt from "jsonwebtoken";

export function getOptionalUserId(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string };
    return decoded.id;
  } catch {
    return undefined;
  }
}
