import express from "express";
import path from "path";
import authRoute from "./routes/authRoute";
// import other routes when available

const app = express();

// Middleware
app.use(express.json());
// Serve static web client from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/api/auth", authRoute);
// app.use("/api/other", otherRoute); // Add other routes here

export default app;
