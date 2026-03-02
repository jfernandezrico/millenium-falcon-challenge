import type { FindAllRoutes } from '../../../domain/ports/route-repository.port.js';
import type { Route } from '../../../domain/models/route.js';
import type { AppDatabase } from '../database/connection.js';
import { routes } from '../database/schema.js';

export const sqliteFindAllRoutes = (db: AppDatabase): FindAllRoutes =>
  () => {
    const rows = db.select().from(routes).all();
    return rows.map((row): Route => ({
      origin: row.origin,
      destination: row.destination,
      travelTime: row.travelTime,
    }));
  };
