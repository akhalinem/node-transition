import { Request, Response, NextFunction } from "express";
import { findUserByEmail, createUser, User } from "../models/user";
import authService from "../services/authService";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, display_name, password } = req.body;

      // Check if email or username already exists
      const existingUserByEmail = await findUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password
      const passwordHash = await authService.hashPassword(password);

      // Create user
      const newUser: Omit<User, "id" | "created_at" | "updated_at"> = {
        email,
        username,
        display_name,
        password_hash: passwordHash,
      };
      const createdUser = await createUser(newUser);

      // Generate tokens
      const accessToken = await authService.generateAccessToken(createdUser.id);
      const refreshToken = await authService.generateRefreshToken(
        createdUser.id
      );

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth", // Only send to auth routes
      });

      // Return response with only access token
      return res.status(201).json({
        user: {
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
          display_name: createdUser.display_name,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Compare password
      const isPasswordValid = await authService.comparePassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate tokens
      const accessToken = await authService.generateAccessToken(user.id);
      const refreshToken = await authService.generateRefreshToken(user.id);

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth",
      });

      // Return response with only access token
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not found" });
      }

      // Verify refresh token
      const payload = await authService.verifyRefreshToken(refreshToken);

      // Generate new access token
      const newAccessToken = await authService.generateAccessToken(
        payload.userId
      );

      // Return new access token
      return res.status(200).json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.revokeRefreshToken(req.cookies.refreshToken);

      // Clear refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
      return;
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { findUserById } = require("../models/user");
      const user = await findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default new AuthController();
