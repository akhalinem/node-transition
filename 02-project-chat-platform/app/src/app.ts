import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute";
import roomRoute from "./routes/roomRoute";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());
// Serve static web client from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);

export default app;
