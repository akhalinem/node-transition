import dbClient from "../config/database";

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export interface CreateMessageInput {
  roomId: string;
  userId: string;
  content: string;
}

export async function createMessage({
  roomId,
  userId,
  content,
}: CreateMessageInput): Promise<Message> {
  const result = await dbClient.query<Message>(
    "INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
    [roomId, userId, content]
  );

  return result.rows[0];
}

export async function findMessagesByRoomId(roomId: string): Promise<Message[]> {
  const result = await dbClient.query<Message>(
    "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC",
    [roomId]
  );

  return result.rows;
}
