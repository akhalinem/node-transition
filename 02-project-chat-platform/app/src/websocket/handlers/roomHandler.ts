import { Message } from "../../models/message";
import * as roomService from "../../services/roomService";
import { ConnectionManager } from "../connectionManager";

export async function handleJoinRoom(
  userId: string,
  data: { roomId: string },
  connectionManager: ConnectionManager
): Promise<Message[]> {
  if (!data.roomId) {
    throw new Error("roomId is required to join a room");
  }

  await roomService.joinRoom(data.roomId, userId);
  connectionManager.addUserToRoom(userId, data.roomId);

  // Optionally send recent history (last 50 messages)
  const recentMessages = await roomService.getRecentMessages(data.roomId);
  connectionManager.broadcastToRoom(data.roomId, {
    type: "user_joined",
    userId,
  });

  return recentMessages;
}

export async function handleLeaveRoom(
  userId: string,
  data: { roomId: string },
  connectionManager: ConnectionManager
): Promise<void> {
  if (!data.roomId) {
    throw new Error("roomId is required to leave a room");
  }

  await roomService.leaveRoom(data.roomId, userId);
  connectionManager.removeUserFromRoom(userId, data.roomId);

  connectionManager.broadcastToRoom(data.roomId, {
    type: "user_left",
    userId,
  });
}
