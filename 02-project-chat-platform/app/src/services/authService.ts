import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/environment";
import dbClient from "../config/database";
import logger from "../utils/logger";
import { InternalServerError, UnauthorizedError } from "../utils/errors";
import { AuthPayload } from "../types";

class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly ALGORITHM = "HS256";

  async hashPassword(password: string): Promise<string> {
    try {
      const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);
      return passwordHash;
    } catch (error) {
      logger.error("Password hashing failed", { error });
      throw new InternalServerError("Failed to hash password");
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      logger.error("Password comparison failed", { error });
      throw new InternalServerError("Failed to compare password");
    }
  }

  async generateAccessToken(userId: string): Promise<string> {
    try {
      const accessToken = jwt.sign({ userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
        algorithm: AuthService.ALGORITHM,
      });
      return accessToken;
    } catch (error) {
      logger.error("Access token generation failed", { error });
      throw new InternalServerError("Failed to generate access token");
    }
  }

  async generateRefreshToken(userId: string): Promise<string> {
    try {
      const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
        algorithm: AuthService.ALGORITHM,
      });

      // Store refresh token in database
      await dbClient.query(
        "UPDATE users SET refresh_token = $1 WHERE id = $2",
        [refreshToken, userId]
      );

      return refreshToken;
    } catch (error) {
      logger.error("Refresh token generation failed", { error });
      throw new InternalServerError("Failed to generate refresh token");
    }
  }

  async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [AuthService.ALGORITHM],
      }) as AuthPayload;

      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        algorithms: [AuthService.ALGORITHM],
      }) as AuthPayload;

      // Verify refresh token exists in database
      const result = await dbClient.query(
        "SELECT id FROM users WHERE id = $1 AND refresh_token = $2",
        [decoded.userId, token]
      );

      if (result.rows.length === 0) {
        throw new Error("Refresh token not found or revoked");
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Refresh token not found or revoked");
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await dbClient.query(
        "UPDATE users SET refresh_token = NULL WHERE refresh_token = $1",
        [token]
      );
    } catch (error) {
      logger.error("Failed to revoke refresh token", { error });
      throw new InternalServerError("Failed to revoke token");
    }
  }
}

export default new AuthService();
