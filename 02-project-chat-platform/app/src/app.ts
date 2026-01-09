import express from "express";
import authRoute from "./routes/authRoute";
// import other routes when available

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
// app.use("/api/other", otherRoute); // Add other routes here

export default app;
