import * as roomService from "../../services/roomService";
import { ConnectionManager } from "../connectionManager";

export async function handleSendMessage(
  userId: string,
  data: { roomId: string; content: string },
  connectionManager: ConnectionManager
): Promise<void> {
  if (!data.roomId || !data.content.trim()) {
    throw new Error("roomId and content are required to send a message");
  }

  const message = await roomService.sendMessage(
    data.roomId,
    userId,
    data.content.trim()
  );

  // Broadcast the new message to all room members
  connectionManager.broadcastToRoom(data.roomId, {
    type: "new_message",
    message: {
      id: message.id,
      roomId: message.room_id,
      userId: message.user_id,
      content: message.content,
      createdAt: message.created_at,
    },
  });
}
