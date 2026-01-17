import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const payload = await authService.verifyToken(token);
      req.userId = payload.userId;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
