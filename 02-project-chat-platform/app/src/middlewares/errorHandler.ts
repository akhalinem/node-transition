import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError } from "../utils/errors";

export function errorHandler(error: Error, req: Request, res: Response): void {
  logger.error("Unhandled error", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Unknown error
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
