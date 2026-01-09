import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/environment";

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
}

export default new AuthService();
