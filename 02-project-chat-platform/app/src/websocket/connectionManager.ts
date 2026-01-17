import WebSocket from "ws";
import { ServerMessage } from "./events";
import { User } from "../models/user";
import { Room } from "../models/room";

interface UserConnection {
  userId: string;
  username: string;
  ws: WebSocket;
  rooms: Set<string>;
}

export class ConnectionManager {
  private connections: Map<string, UserConnection> = new Map();

  addConnection(user: User, rooms: Room[], ws: WebSocket): void {
    this.connections.set(user.id, {
      userId: user.id,
      username: user.username,
      ws,
      rooms: new Set(rooms.map((room) => room.id)),
    });
  }

  removeConnection(userId: string): void {
    this.connections.delete(userId);
  }

  getConnection(userId: string): UserConnection | undefined {
    return this.connections.get(userId);
  }

  addUserToRoom(userId: string, roomId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.rooms.add(roomId);
    }
  }

  removeUserFromRoom(userId: string, roomId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.rooms.delete(roomId);
    }
  }

  getUsersInRoom(roomId: string): UserConnection[] {
    const userConnections: UserConnection[] = [];
    this.connections.forEach((connection) => {
      if (connection.rooms.has(roomId)) {
        userConnections.push(connection);
      }
    });

    return userConnections;
  }

  broadcastToRoom(roomId: string, message: ServerMessage): void {
    const usersInRoom = this.getUsersInRoom(roomId);
    const messageString = JSON.stringify(message);

    usersInRoom.forEach((connection) => {
      connection.ws.send(messageString);
    });
  }
}

export default new ConnectionManager();
