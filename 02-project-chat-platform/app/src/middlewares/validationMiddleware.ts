import { Request, Response, NextFunction } from "express";

// Simple regex for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Middleware to validate registration data
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, username } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  if (!username || !/^[a-zA-Z0-9]{3,50}$/.test(username)) {
    return res.status(400).json({
      error:
        "Username must be alphanumeric and between 3 to 50 characters long",
    });
  }

  next();
  return;
};

// Middleware to validate login data
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  next();
  return;
};
