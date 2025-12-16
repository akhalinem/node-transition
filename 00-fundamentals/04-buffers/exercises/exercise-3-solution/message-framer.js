import { MAGIC } from "./utils.js";

export class MessageFramer {
  constructor() {
    this.buffer = Buffer.alloc(0);
  }

  addData(chunk) {
    // Append chunk to buffer
    this.buffer = Buffer.concat([this.buffer, chunk]);
    // Extract and return array of complete messages
    return this.extractMessages();
  }

  extractMessages() {
    const messages = [];

    while (this.buffer.length >= 11) {
      // Minimum header size
      // Read magic number
      const magic = this.buffer.readUInt16BE(0);
      if (magic !== MAGIC) {
        throw new Error("Invalid magic number");
      }

      // Read length of the message
      const length = this.buffer.readUInt32BE(2);
      if (this.buffer.length < length) {
        // Incomplete message, wait for more data
        break;
      }

      // Extract complete message
      const messageBuffer = this.buffer.subarray(0, length);
      messages.push(messageBuffer);

      // Remove processed message from buffer
      this.buffer = this.buffer.subarray(length);
    }

    return messages;
  }
}
