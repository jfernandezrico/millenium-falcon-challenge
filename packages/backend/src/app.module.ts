import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { createJsonConfigLoader } from './adapters/out/config/json-config-loader.js';
import { createDatabase } from './adapters/out/database/connection.js';
import { sqliteFindAllRoutes } from './adapters/out/repository/sqlite-route.repository.js';
import type { MillenniumFalconConfig } from './domain/models/millennium-falcon-config.js';
import type { FindAllRoutes } from './domain/ports/route-repository.port.js';
import { OddsModule } from './adapters/in/odds/odds.module.js';
import { HealthController } from './adapters/in/health/health.controller.js';

const configProvider = {
  provide: 'MILLENNIUM_FALCON_CONFIG',
  useFactory: (): MillenniumFalconConfig => {
    const configPath = process.env['MILLENNIUM_FALCON_CONFIG'] ?? './millennium-falcon.json';
    const loadConfig = createJsonConfigLoader();
    return loadConfig(configPath);
  },
};

const findAllRoutesProvider = {
  provide: 'FIND_ALL_ROUTES',
  useFactory: (config: MillenniumFalconConfig): FindAllRoutes => {
    const db = createDatabase(config.routesDb);
    return sqliteFindAllRoutes(db);
  },
  inject: ['MILLENNIUM_FALCON_CONFIG'],
};

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    OddsModule,
  ],
  controllers: [HealthController],
  providers: [configProvider, findAllRoutesProvider],
  exports: ['MILLENNIUM_FALCON_CONFIG', 'FIND_ALL_ROUTES'],
})
export class AppModule {}
