import { Client } from "pg";
import { config } from "./environment";

// TODO: migrate to connection pool later
const dbClient = new Client({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
});

export default dbClient;
