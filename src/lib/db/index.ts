import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a proxy that throws on actual queries but allows imports during build
    return new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
      get(_target, prop) {
        if (prop === "query" || prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
          throw new Error(
            "DATABASE_URL is not set. Please configure it in .env.local"
          );
        }
        return undefined;
      },
    });
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = createDb();

export type DB = typeof db;
