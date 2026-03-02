import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { LoadConfig } from '../../../domain/ports/config-loader.port.js';
import type { MillenniumFalconConfig } from '../../../domain/models/millennium-falcon-config.js';

type RawConfig = {
  autonomy: number;
  departure: string;
  arrival: string;
  routes_db: string;
};

const resolveDbPath = (configDir: string, routesDb: string): string => {
  if (routesDb.startsWith('/')) return routesDb;
  return resolve(configDir, routesDb);
};

export const createJsonConfigLoader = (): LoadConfig =>
  (filePath: string): MillenniumFalconConfig => {
    const absolutePath = resolve(filePath);
    const raw: RawConfig = JSON.parse(readFileSync(absolutePath, 'utf-8'));
    const configDir = dirname(absolutePath);

    return {
      autonomy: raw.autonomy,
      departure: raw.departure,
      arrival: raw.arrival,
      routesDb: resolveDbPath(configDir, raw.routes_db),
    };
  };
