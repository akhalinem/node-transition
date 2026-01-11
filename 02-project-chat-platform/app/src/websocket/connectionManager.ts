import WebSocket from "ws";

interface UserConnection {
  userId: string;
  username: string;
  ws: WebSocket;
  rooms: Set<string>;
}

class ConnectionManager {
  private connections: Map<string, UserConnection> = new Map();

  addConnection(userId: string, username: string, ws: WebSocket): void {
    this.connections.set(userId, {
      userId,
      username,
      ws,
      rooms: new Set(),
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

  broadcastToRoom(roomId: string, message: string): void {
    const usersInRoom = this.getUsersInRoom(roomId);
    const messageString = JSON.stringify(message);

    usersInRoom.forEach((connection) => {
      connection.ws.send(messageString);
    });
  }
}

export default new ConnectionManager();
