import dbClient from "../config/database";

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export interface MessageWithUserInfo extends Message {
  username: string;
  user_display_name: string;
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

export async function findMessagesByRoomId(
  roomId: string
): Promise<MessageWithUserInfo[]> {
  const result = await dbClient.query<MessageWithUserInfo>(
    `
    SELECT m.*, u.username, u.display_name AS user_display_name
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = $1
    ORDER BY m.created_at ASC
  `,
    [roomId]
  );

  return result.rows;
}
