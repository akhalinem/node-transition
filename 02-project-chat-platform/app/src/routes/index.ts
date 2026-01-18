import { Router } from "express";
import authRoute from "./authRoute";
import roomRoute from "./roomRoute";

const router = Router();

// API Routes
router.use("/auth", authRoute);
router.use("/rooms", roomRoute);

export default router;
