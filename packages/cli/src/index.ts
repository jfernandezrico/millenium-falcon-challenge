#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { computeOdds } from '@mfc/backend/domain/use-cases/compute-odds';
import type { EmpireData } from '@mfc/backend/domain/models/empire';
import { createJsonConfigLoader } from '@mfc/backend/adapters/out/config/json-config-loader';
import { createDatabase } from '@mfc/backend/adapters/out/database/connection';
import { sqliteFindAllRoutes } from '@mfc/backend/adapters/out/repository/sqlite-route.repository';

type RawEmpireData = {
  countdown: number;
  bounty_hunters: { planet: string; day: number }[];
};

const parseEmpireFile = (filePath: string): EmpireData => {
  const absolutePath = resolve(filePath);
  const raw: RawEmpireData = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  return {
    countdown: raw.countdown,
    bountyHunters: raw.bounty_hunters.map((bh) => ({
      planet: bh.planet,
      day: bh.day,
    })),
  };
};

const main = () => {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: give-me-the-odds <millennium-falcon.json> <empire.json>');
    process.exit(1);
  }

  const [millenniumFalconPath, empirePath] = args as [string, string];

  const loadConfig = createJsonConfigLoader();
  const config = loadConfig(millenniumFalconPath);

  const db = createDatabase(config.routesDb);
  const findAllRoutes = sqliteFindAllRoutes(db);

  const empire = parseEmpireFile(empirePath);

  const log = {
    info: (msg: string, data?: Record<string, unknown>) =>
      console.error(`[INFO] ${msg}`, data ? JSON.stringify(data) : ''),
    warn: (msg: string, data?: Record<string, unknown>) =>
      console.error(`[WARN] ${msg}`, data ? JSON.stringify(data) : ''),
    error: (msg: string, data?: Record<string, unknown>) =>
      console.error(`[ERROR] ${msg}`, data ? JSON.stringify(data) : ''),
  };

  const odds = computeOdds(findAllRoutes, log)(config, empire);
  const percentage = Math.round(odds * 100);

  console.log(percentage);
};

main();
