import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as RoomModel from "../models/room";
import * as roomService from "../services/roomService";

class RoomController {
  async getRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rooms = await RoomModel.getUserRooms(req.userId!);
      return res.status(200).json({ rooms });
    } catch (error) {
      next(error);
      return;
    }
  }

  async createRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Room name is required" });
      }

      const room = await RoomModel.createRoom(name.trim());
      return res.status(201).json({ room });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getRoomMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params as { roomId: string };
      const query = req.query as {
        limit?: string;
        offset?: string;
      };

      const limit = query.limit ? parseInt(query.limit, 10) : undefined;
      const offset = query.offset ? parseInt(query.offset, 10) : undefined;

      if (!roomId) {
        return res.status(400).json({ error: "roomId is required" });
      }

      // Ensure room exists and user is a member
      await roomService.ensureRoomExists(roomId);
      await roomService.ensureMemberExists(roomId, req.userId!);

      // Fetch recent messages (default limit 50)
      const messages = await roomService.getRecentMessages(
        roomId,
        limit,
        offset
      );

      return res.status(200).json({ messages });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default new RoomController();
