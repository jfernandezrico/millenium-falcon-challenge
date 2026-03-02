import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export const createDatabase = (dbPath: string) => {
  const sqlite = new Database(dbPath, { readonly: true });
  return drizzle(sqlite, { schema });
};

export type AppDatabase = ReturnType<typeof createDatabase>;
