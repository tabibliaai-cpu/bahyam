import { createClient, Client } from "@libsql/client";

let _db: Client | null = null;

export async function getDb(): Promise<Client> {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }

  _db = createClient({ url, authToken });
  return _db;
}

export async function db() {
  try {
    return await getDb();
  } catch {
    // Return a safe stub proxy for when DB is unavailable
    return {
      execute: async () => ({ rows: [] as any[] }),
    } as unknown as Client;
  }
}
