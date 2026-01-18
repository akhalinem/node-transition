import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import authService from "../services/authService";
import { asyncHandler } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = asyncHandler(
  async (req: AuthRequest, _: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("No token provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Invalid token format");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const payload = await authService.verifyToken(token);
      req.userId = payload.userId;
      next();
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
);
