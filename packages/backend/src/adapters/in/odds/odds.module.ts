import { Module } from '@nestjs/common';
import { OddsController } from './odds.controller.js';

@Module({
  controllers: [OddsController],
})
export class OddsModule {}
