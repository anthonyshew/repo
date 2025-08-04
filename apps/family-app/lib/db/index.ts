import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export * from "./schema";
