import net from "node:net";
import { MessageFramer } from "./message-framer.js";
import {
  buildGetMessage,
  buildMessage,
  buildSetMessage,
  MSG_TYPES,
  parseMessage,
} from "./utils.js";

export class ProtocolClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  connect() {
    // Create TCP connection
    this.socket = net.createConnection(
      { host: this.host, port: this.port },
      () => {
        console.log("Connected to protocol server");
      }
    );

    const framer = new MessageFramer();

    // Setup data handler
    this.socket.on("data", (data) => {
      framer.addData(data).forEach((messageBuffer) => {
        const message = parseMessage(messageBuffer);
        // Handle response
        const pending = this.pendingRequests.get(message.requestId);
        if (pending) {
          pending.resolve(message);
          this.pendingRequests.delete(message.requestId);
        }
      });
    });

    // Return promise
    return new Promise((resolve) => {
      this.socket.on("connect", resolve);
    });
  }

  send(requestId, message) {
    // Send over socket
    this.socket.write(message);
    // Return promise that resolves when response received
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
    });
  }

  async get(key) {
    const requestId = this.requestId++;

    // Build GET message
    const message = buildGetMessage(requestId, key);
    // Send and wait for response
    const response = await this.send(requestId, message);
    // Return value or null
    if (response.payload.length > 0) {
      return response.payload.toString("utf-8");
    } else {
      return null;
    }
  }

  async set(key, value) {
    const requestId = this.requestId++;

    // Build SET message
    const message = buildSetMessage(requestId, key, value);
    // Send and wait for response
    const response = await this.send(requestId, message);
    // Return success boolean
    return response.type === MSG_TYPES.RESPONSE;
  }

  async ping() {
    const requestId = this.requestId++;

    // Send PING
    const message = buildMessage(MSG_TYPES.PING, requestId, Buffer.alloc(0));
    // Wait for PONG
    const start = Date.now();
    const response = await this.send(requestId, message);
    const end = Date.now();
    // Return latency
    if (response.type === MSG_TYPES.PONG) {
      return end - start;
    } else {
      throw new Error("Invalid response to PING");
    }
  }
}
