import { Buffer } from "node:buffer";
import net from "node:net";
import {
  buildResponseMessage,
  buildMessage,
  parseMessage,
  parseGetMessagePayload,
  parseSetMessagePayload,
  MSG_TYPES,
  RESPONSE_STATUS,
} from "./utils.js";
import { MessageFramer } from "./message-framer.js";

export class ProtocolServer {
  constructor(port) {
    this.port = port;
    this.store = new Map(); // In-memory key-value store
    this.server = null;
  }

  async start() {
    // Create TCP server
    // Handle connections
    // Parse incoming messages
    // Process commands (GET, SET, DELETE, PING)
    // Send responses
    this.server = net.createServer((socket) => this.handleConnection(socket));
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Protocol server listening on port ${this.port}`);
        resolve();
      });
    });
  }

  handleConnection(socket) {
    const framer = new MessageFramer();

    socket.on("data", (data) => {
      framer.addData(data).forEach((messageBuffer) => {
        const message = parseMessage(messageBuffer);

        // Route to handler
        switch (message.type) {
          case MSG_TYPES.GET: {
            const { key } = parseGetMessagePayload(message.payload);
            this.handleGet(socket, message.requestId, key);
            break;
          }

          case MSG_TYPES.SET: {
            const { key, value } = parseSetMessagePayload(message.payload);
            this.handleSet(socket, message.requestId, key, value);
            break;
          }

          case MSG_TYPES.PING: {
            this.handlePing(socket, message.requestId);
            break;
          }

          default:
            // Unknown message type
            break;
        }
      });
    });
  }

  handleGet(socket, requestId, key) {
    // Look up key in store
    const value = this.store.get(key);
    // Build RESPONSE message
    const status = value ? RESPONSE_STATUS.SUCCESS : RESPONSE_STATUS.NOT_FOUND;
    const payload = value ? Buffer.from(value, "utf-8") : Buffer.alloc(0);
    const response = buildResponseMessage(requestId, status, payload);
    // Send to client
    socket.write(response);
  }

  handleSet(socket, requestId, key, value) {
    // Store key-value
    this.store.set(key, value);
    // Build RESPONSE message
    const response = buildResponseMessage(
      requestId,
      RESPONSE_STATUS.SUCCESS,
      Buffer.alloc(0)
    );
    // Send to client
    socket.write(response);
  }

  handlePing(socket, requestId) {
    // Send PONG response
    const response = buildMessage(MSG_TYPES.PONG, requestId, Buffer.alloc(0));
    socket.write(response);
  }
}
