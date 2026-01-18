import fs from "node:fs";
import path from "node:path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private logDir = "./logs";

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  private write(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output
    const consoleMethod =
      level === LogLevel.ERROR
        ? console.error
        : level === LogLevel.WARN
          ? console.warn
          : console.log;

    consoleMethod(formattedMessage);

    // File output
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(logFile, formattedMessage + "\n");
  }

  debug(message: string, meta?: any): void {
    this.write(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: any): void {
    this.write(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.write(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: any): void {
    this.write(LogLevel.ERROR, message, meta);
  }
}

export default new Logger();
