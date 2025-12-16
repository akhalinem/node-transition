import { ProtocolServer } from "./server.js";
import { ProtocolClient } from "./client.js";

async function runTests() {
  const server = new ProtocolServer(3000);
  console.log("Starting server...");
  await server.start();
  console.log("Server started.");

  const client = new ProtocolClient("localhost", 3000);
  await client.connect();

  console.log("Testing PING...");
  const latency = await client.ping();
  console.log(`✅ PING/PONG: ${latency}ms`);

  console.log("Testing SET...");
  await client.set("name", "Alice");
  console.log("✅ SET successful");

  console.log("Testing GET...");
  const value = await client.get("name");
  console.log(`✅ GET: ${value}`);

  console.log("Testing GET (not found)...");
  const missing = await client.get("nonexistent");
  console.log(`✅ GET (missing): ${missing}`);

  // More tests...
}

await runTests();
