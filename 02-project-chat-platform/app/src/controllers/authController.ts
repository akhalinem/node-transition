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

      // Return response
      return res.status(201).json({
        user: {
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
        },
        accessToken,
        refreshToken,
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

      // Return response
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default new AuthController();
