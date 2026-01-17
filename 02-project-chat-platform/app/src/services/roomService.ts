import * as RoomModel from "../models/room";
import * as MessageModel from "../models/message";

export async function ensureRoomExists(
  roomId: string
): Promise<RoomModel.Room> {
  let room = await RoomModel.findById(roomId);
  if (!room) {
    throw new Error(`Room with ID ${roomId} does not exist.`);
  }
  return room;
}

export async function ensureMemberExists(
  roomId: string,
  userId: string
): Promise<void> {
  const isMember = await RoomModel.isUserMember(roomId, userId);
  if (!isMember) {
    throw new Error(
      `User with ID ${userId} is not a member of room ${roomId}.`
    );
  }
}

export async function joinRoom(
  roomId: string,
  userId: string
): Promise<RoomModel.RoomMember> {
  await ensureRoomExists(roomId);
  const member = await RoomModel.addMemberToRoom(roomId, userId);
  return member;
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  await ensureRoomExists(roomId);
  await RoomModel.removeMemberFromRoom(roomId, userId);
}

export async function sendMessage(
  roomId: string,
  userId: string,
  content: string
): Promise<MessageModel.Message> {
  await ensureRoomExists(roomId);
  await ensureMemberExists(roomId, userId);
  const message = await MessageModel.createMessage({
    roomId,
    userId,
    content,
  });
  return message;
}

export async function getRecentMessages(
  roomId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageModel.Message[]> {
  await ensureRoomExists(roomId);
  const messages = await MessageModel.findMessagesByRoomId(roomId);
  return messages.slice(offset, offset + limit);
}
