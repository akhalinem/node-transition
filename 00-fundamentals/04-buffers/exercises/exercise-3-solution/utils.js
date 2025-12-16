import { Buffer } from "node:buffer";

export const MAGIC = 0xbeef;
export const MSG_TYPES = {
  PING: 0x01,
  PONG: 0x02,
  GET: 0x03,
  SET: 0x04,
  DELETE: 0x05,
  RESPONSE: 0x06,
  ERROR: 0x07,
};
export const RESPONSE_STATUS = {
  SUCCESS: 0x00,
  NOT_FOUND: 0x01,
  ERROR: 0x02,
};

export function buildMessage(type, requestId, payload) {
  // Calculate total length
  const totalMessageLength = 11 + payload.length;
  // Create header buffer (11 bytes)
  const buffer = Buffer.alloc(totalMessageLength);
  // Write magic number (2 bytes, big-endian)
  buffer.writeUInt16BE(MAGIC, 0);
  // Write length (4 bytes, big-endian)
  buffer.writeUInt32BE(totalMessageLength, 2);
  // Write type (1 byte)
  buffer.writeUInt8(type, 6);
  // Write request ID (4 bytes, big-endian)
  buffer.writeUInt32BE(requestId, 7);
  // Concatenate with payload
  payload.copy(buffer, 11);
  // Return complete message buffer
  return buffer;
}

export function buildGetMessage(requestId, key) {
  // Create payload:
  //   - Key length (2 bytes, big-endian)
  //   - Key (bytes)
  const keyBuffer = Buffer.from(key, "utf-8");
  const payloadLength = 2 + keyBuffer.length;
  const payload = Buffer.alloc(payloadLength);
  payload.writeUInt16BE(keyBuffer.length, 0);
  keyBuffer.copy(payload, 2);
  // Return buildMessage(GET, requestId, payload)
  return buildMessage(MSG_TYPES.GET, requestId, payload);
}

export function buildSetMessage(requestId, key, value) {
  // Create payload:
  //   - Key length (2 bytes, big-endian)
  //   - Key (bytes)
  //   - Value (bytes)
  const keyBuffer = Buffer.from(key, "utf-8");
  const valueBuffer = Buffer.from(value, "utf-8");
  const payloadLength = 2 + keyBuffer.length + valueBuffer.length;
  const payload = Buffer.alloc(payloadLength);
  payload.writeUInt16BE(keyBuffer.length, 0);
  keyBuffer.copy(payload, 2);
  valueBuffer.copy(payload, 2 + keyBuffer.length);
  // Return buildMessage(SET, requestId, payload)
  return buildMessage(MSG_TYPES.SET, requestId, payload);
}

export function buildResponseMessage(requestId, status, data) {
  // Create payload:
  //   - Status (1 byte)
  //   - Data (variable)
  const payloadLength = 1 + data.length;
  const payload = Buffer.alloc(payloadLength);
  payload.writeUInt8(status, 0);
  data.copy(payload, 1);
  // Return buildMessage(RESPONSE, requestId, payload)
  return buildMessage(MSG_TYPES.RESPONSE, requestId, payload);
}

export function buildErrorMessage(requestId, errorCode, errorMessage) {
  // Create payload:
  //   - Error code (2 bytes, big-endian)
  //   - Error message (UTF-8 string)
  const errorMessageBuffer = Buffer.from(errorMessage, "utf-8");
  const payloadLength = 2 + errorMessageBuffer.length;
  const payload = Buffer.alloc(payloadLength);
  payload.writeUInt16BE(errorCode, 0);
  errorMessageBuffer.copy(payload, 2);
  // Return buildMessage(ERROR, requestId, payload)
  return buildMessage(MSG_TYPES.ERROR, requestId, payload);
}

export function parseMessage(buffer) {
  // Validate minimum length (11 bytes)
  if (buffer.length < 11) {
    throw new Error("Buffer too short to be a valid message");
  }
  // Read magic number
  const magic = buffer.readUInt16BE(0);
  // Validate magic number
  if (magic !== MAGIC) {
    throw new Error("Invalid magic number");
  }
  // Read length
  const length = buffer.readUInt32BE(2);
  // Read type
  const type = buffer.readUInt8(6);
  // Read request ID
  const requestId = buffer.readUInt32BE(7);
  // Extract payload
  const payload = buffer.subarray(11, length);
  // Return { type, requestId, payload }
  return {
    type,
    requestId,
    payload,
  };
}

export function parseSetMessagePayload(payload) {
  // Read key length (2 bytes)
  const keyLength = payload.readUInt16BE(0);
  // Extract key
  const key = payload.subarray(2, 2 + keyLength).toString("utf-8");
  // Extract value (rest of payload)
  const value = payload.subarray(2 + keyLength).toString("utf-8");
  // Return { key, value }
  return { key, value };
}

export function parseGetMessagePayload(payload) {
  // Read key length
  const keyLength = payload.readUInt16BE(0);
  // Extract key
  const key = payload.subarray(2, 2 + keyLength).toString("utf-8");
  // Return { key }
  return { key };
}

export function parseResponseMessagePayload(payload) {
  // Read status (1 byte)
  const status = payload.readUInt8(0);
  // Extract data (rest of payload)
  const data = payload.subarray(1);
  // Return { status, data }
  return { status, data };
}

export function parseErrorMessagePayload(payload) {
  // Read error code (2 bytes)
  const errorCode = payload.readUInt16BE(0);
  // Extract error message (rest of payload)
  const errorMessage = payload.subarray(2).toString("utf-8");
  // Return { errorCode, errorMessage }
  return { errorCode, errorMessage };
}
