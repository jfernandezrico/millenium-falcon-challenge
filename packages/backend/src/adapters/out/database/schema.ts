import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const routes = sqliteTable('ROUTES', {
  origin: text('ORIGIN').notNull(),
  destination: text('DESTINATION').notNull(),
  travelTime: integer('TRAVEL_TIME').notNull(),
});
