import { Response } from "express";
import {
  findUserByEmail,
  createUser,
  User,
  findUserByUsername,
  findUserById,
} from "../models/user";
import authService from "../services/authService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ValidationUtils } from "../utils/validator";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import logger from "../utils/logger";

class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, username, display_name, password } = req.body;

    // Validation
    if (!ValidationUtils.isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    if (!ValidationUtils.isValidPassword(password)) {
      throw new ValidationError(
        "Password must be at least 8 characters long and contain a mix of letters and numbers"
      );
    }
    if (!ValidationUtils.isValidUsername(username)) {
      throw new ValidationError(
        "Username must be alphanumeric and between 3 to 20 characters"
      );
    }

    // Check if email already exists
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError("Email already in use");
    }

    // Check if username already exists
    const existingUserByUsername = await findUserByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictError("Username already in use");
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
    const refreshToken = await authService.generateRefreshToken(createdUser.id);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth", // Only send to auth routes
    });

    // Return response with only access token
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
          display_name: createdUser.display_name,
        },
        accessToken,
      },
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Find user
    const userByEmail = await findUserByEmail(email);
    if (!userByEmail) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await authService.comparePassword(
      password,
      userByEmail.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate tokens
    const accessToken = await authService.generateAccessToken(userByEmail.id);
    const refreshToken = await authService.generateRefreshToken(userByEmail.id);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth", // Only send to auth routes
    });

    logger.info("User logged in", {
      userId: userByEmail.id,
      email: userByEmail.email,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: userByEmail.id,
          email: userByEmail.email,
          username: userByEmail.username,
          display_name: userByEmail.display_name,
        },
        accessToken,
      },
    });
  });

  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    // Verify refresh token
    const payload = await authService.verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = await authService.generateAccessToken(
      payload.userId
    );

    logger.debug("Token refreshed", { userId: payload.userId });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Extract userId from token to revoke it
      try {
        const payload = await authService.verifyRefreshToken(refreshToken);
        await authService.revokeRefreshToken(refreshToken);
        logger.info("User logged out", { userId: payload.userId });
      } catch (error) {
        // Token already invalid, just clear cookie
        logger.debug("Logout attempted with invalid token");
      }
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await findUserById(req.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
        },
      },
    });
  });
}

export default new AuthController();
