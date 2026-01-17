import WebSocket from "ws";
import { findUserById } from "../../models/user";
import { getUserRooms } from "../../models/room";
import authService from "../../services/authService";
import { ClientMessage, ServerMessage } from "../events";
import connectionManager from "../connectionManager";

interface AuthenticatedConnection extends WebSocket {
  userId?: string;
  username?: string;
  isAuthenticated?: boolean;
}

export async function handleAuthentication(
  connection: AuthenticatedConnection,
  message: ClientMessage
): Promise<boolean> {
  if (message.type !== "authenticate") {
    return false;
  }

  try {
    const payload = await authService.verifyToken(message.token);
    const user = await findUserById(payload.userId);
    const rooms = await getUserRooms(payload.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user.id;
    const username = user.username;

    // Mark WebSocket as authenticated
    connection.userId = userId;
    connection.username = username;
    connection.isAuthenticated = true;

    // Add to connection manager
    connectionManager.addConnection(user, rooms, connection);

    // Send success message
    const response: ServerMessage = {
      type: "authenticated",
      userId,
      username,
    };
    connection.send(JSON.stringify(response));

    console.log(`User ${userId} authenticated via WebSocket`);
    return true;
  } catch (e) {
    const response: ServerMessage = {
      type: "auth_error",
      message: "Invalid or expired token",
    };
    connection.send(JSON.stringify(response));
    console.log("WebSocket authentication failed:", e);
    return false;
  }
}

export function requireAuth(connection: AuthenticatedConnection): boolean {
  return connection.isAuthenticated === true;
}
