import WebSocket from "ws";
import { config } from "../config/environment";
import { ClientMessage, ServerMessage } from "./events";
import { handleAuthentication, requireAuth } from "./middleware/wsAuth";
import connectionManager from "./connectionManager";

interface AuthenticatedConnection extends WebSocket {
  userId?: string;
  username?: string;
  isAuthenticated?: boolean;
  authTimeout?: NodeJS.Timeout;
}

export function createWebSocketServer(): WebSocket.Server {
  const wsServer = new WebSocket.Server({
    port: config.wsPort,
  });

  console.log(`🔌 WebSocket server started on port ${config.wsPort}`);

  wsServer.on("connection", (connection: AuthenticatedConnection) => {
    console.log("🔗 New WebSocket connection");

    // Set authentication timeout (5 seconds)
    connection.authTimeout = setTimeout(() => {
      if (!connection.isAuthenticated) {
        console.log("⏰ Authentication timeout, closing connection");
        const response: ServerMessage = {
          type: "auth_error",
          message: "Authentication timeout",
        };
        connection.send(JSON.stringify(response));
        connection.close(4001, "Authentication timeout");
      }
    }, 5_000);

    // Handle incoming messages
    connection.on("message", async (data) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());

        // Handle authentication
        if (message.type === "authenticate") {
          const success = await handleAuthentication(connection, message);
          if (success && connection.authTimeout) {
            clearTimeout(connection.authTimeout);
          }
          return;
        }

        // All other messages require authentication
        if (!requireAuth(connection)) {
          const response: ServerMessage = {
            type: "error",
            message: "Not authenticated",
          };
          connection.send(JSON.stringify(response));
          return;
        }

        // Handle other message types
        switch (message.type) {
          case "join_room":
            console.log("📨 Message received (not yet implemented):", message);
            break;

          case "leave_room":
            console.log("📨 Message received (not yet implemented):", message);
            break;

          case "send_message":
            console.log("📨 Message received (not yet implemented):", message);
            break;

          default:
            console.log("⚠️ Unknown message type:", message);
            const response: ServerMessage = {
              type: "error",
              message: "Unknown message type",
            };
            connection.send(JSON.stringify(response));
            break;
        }
      } catch (e) {
        console.error("❗ Error processing message:", e);
        const response: ServerMessage = {
          type: "error",
          message: "Invalid message format",
        };
        connection.send(JSON.stringify(response));
      }
    });

    // Handle connection close
    connection.on("close", () => {
      if (connection.authTimeout) {
        clearTimeout(connection.authTimeout);
      }

      if (connection.userId) {
        connectionManager.removeConnection(connection.userId);
        console.log(
          `🔌 WebSocket connection closed for user ${connection.userId}`
        );
      } else {
        console.log("🔌 WebSocket connection closed for unauthenticated user");
      }
    });

    connection.on("error", (error) => {
      console.error("❗ WebSocket error:", error);
    });
  });

  return wsServer;
}
