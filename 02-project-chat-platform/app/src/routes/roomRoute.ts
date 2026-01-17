import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import roomController from "../controllers/roomController";

const router = Router();

// All room routes require authentication
router.get("/", requireAuth, roomController.getRooms);
router.post("/", requireAuth, roomController.createRoom);
router.get("/:roomId/messages", requireAuth, roomController.getRoomMessages);

export default router;
