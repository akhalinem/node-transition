import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/environment";
import dbClient from "../config/database";

class AuthService {
  static readonly SALT_ROUNDS = 10;
  static readonly ALGORITHM = "HS256";

  async hashPassword(password: string): Promise<string> {
    const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);
    return passwordHash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async generateAccessToken(userId: string): Promise<string> {
    const accessToken = jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
      algorithm: AuthService.ALGORITHM,
    });

    return accessToken;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
      algorithm: AuthService.ALGORITHM,
    });
    await dbClient.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      userId,
    ]);

    return refreshToken;
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [AuthService.ALGORITHM],
      }) as {
        userId: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        algorithms: [AuthService.ALGORITHM],
      }) as {
        userId: string;
      };

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
      throw new Error("Invalid refresh token");
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await dbClient.query(
      "UPDATE users SET refresh_token = NULL WHERE refresh_token = $1",
      [token]
    );
  }
}

export default new AuthService();
