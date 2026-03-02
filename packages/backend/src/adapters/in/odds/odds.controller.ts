import { Controller, Post, Body, Inject, HttpCode, UsePipes } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { computeOdds } from '../../../domain/use-cases/compute-odds.js';
import type { MillenniumFalconConfig } from '../../../domain/models/millennium-falcon-config.js';
import type { FindAllRoutes } from '../../../domain/ports/route-repository.port.js';
import type { EmpireData } from '../../../domain/models/empire.js';
import { empireDtoSchema, type EmpireDto } from './dto/empire.dto.js';
import { createZodValidationPipe } from '../pipes/zod-validation.pipe.js';

@Controller('api')
export class OddsController {
  private readonly calculateOdds: (config: MillenniumFalconConfig, empire: EmpireData) => number;

  constructor(
    @Inject('MILLENNIUM_FALCON_CONFIG')
    private readonly config: MillenniumFalconConfig,
    @Inject('FIND_ALL_ROUTES')
    findAllRoutes: FindAllRoutes,
    @InjectPinoLogger(OddsController.name)
    private readonly logger: PinoLogger,
  ) {
    this.calculateOdds = computeOdds(findAllRoutes, {
      info: (msg, data) => this.logger.info(data ?? {}, msg),
      warn: (msg, data) => this.logger.warn(data ?? {}, msg),
      error: (msg, data) => this.logger.error(data ?? {}, msg),
    });
  }

  @Post('odds')
  @HttpCode(200)
  @UsePipes(createZodValidationPipe(empireDtoSchema))
  getOdds(@Body() empireDto: EmpireDto) {
    const empireData: EmpireData = {
      countdown: empireDto.countdown,
      bountyHunters: empireDto.bounty_hunters.map((bh) => ({
        planet: bh.planet,
        day: bh.day,
      })),
    };

    const odds = this.calculateOdds(this.config, empireData);

    return { odds };
  }
}
