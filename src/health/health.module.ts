import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseHealthIndicator } from './database.health.js';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}
