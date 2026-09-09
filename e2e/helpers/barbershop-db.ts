import { createRequire } from "node:module";
import path from "node:path";

export async function queryEvidence(sql: string, values: string[]) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname)) throw new Error("Use a local, isolated DATABASE_URL for database assertions.");
  const requireApi = createRequire(path.resolve(process.env.E2E_API_DIR ?? "../api", "package.json"));
  const { Client } = requireApi("pg") as { Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>; end(): Promise<void>;
    query(sql: string, values: string[]): Promise<{ rows: Record<string, unknown>[] }>;
  } };
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try { return (await client.query(sql, values)).rows; } finally { await client.end(); }
}
