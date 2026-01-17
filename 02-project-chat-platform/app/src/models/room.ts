import dbClient from "../config/database";

export interface Room {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  joined_at: Date;
}

export async function findById(id: string): Promise<Room | null> {
  const result = await dbClient.query<Room>(
    "SELECT * FROM rooms WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function createRoom(name: string): Promise<Room> {
  const result = await dbClient.query<Room>(
    "INSERT INTO rooms (name) VALUES ($1) RETURNING *",
    [name]
  );
  return result.rows[0];
}

export async function addMemberToRoom(
  roomId: string,
  userId: string
): Promise<RoomMember> {
  const result = await dbClient.query<RoomMember>(
    "INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) RETURNING *",
    [roomId, userId]
  );
  return result.rows[0];
}

export async function removeMemberFromRoom(
  roomId: string,
  userId: string
): Promise<void> {
  await dbClient.query(
    "DELETE FROM room_members WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );
}

export async function isUserMember(
  roomId: string,
  userId: string
): Promise<boolean> {
  const result = await dbClient.query<RoomMember>(
    "SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );
  return result.rows.length > 0;
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const result = await dbClient.query<RoomMember>(
    "SELECT * FROM room_members WHERE room_id = $1",
    [roomId]
  );
  return result.rows;
}

export async function getUserRooms(userId: string): Promise<Room[]> {
  const result = await dbClient.query<Room>(
    "SELECT rooms.* FROM rooms JOIN room_members ON rooms.id = room_members.room_id WHERE room_members.user_id = $1",
    [userId]
  );
  return result.rows;
}
