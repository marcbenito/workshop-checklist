import { Pool } from "pg";

// Pool singleton reutilitzat entre invocacions (evita esgotar connexions en
// dev amb hot-reload i en serverless). Mai s'importa des del client.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
