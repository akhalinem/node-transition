import express, { Express } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/environment";
import { errorHandler } from "./middlewares/errorHandler";
import apiRoutes from "./routes";

const app: Express = express();

// Trust proxy (if behind a reverse proxy)
app.set("trust proxy", 1);

// Middleware: CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true, // Allow cookies
  })
);

// Middleware: Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: Cookie parsing
app.use(cookieParser());

// Middleware: Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Middleware: Request logging
app.use((req, _, next) => {
  console.debug(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
