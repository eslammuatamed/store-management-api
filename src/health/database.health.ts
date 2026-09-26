import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { PrismaService } from '../database/prisma/prisma.service.js';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  check() {
    return this.healthIndicatorService
      .check('database')
      .attempt(async () => {
        const plan = this.prisma.db.raw.sql`
          SELECT 1 AS "ok"
          LIMIT 1
        `
          .returnsRow({
            ok: 'pg/int4@1',
          })
          .build();

        await this.prisma.db.runtime().query(plan);
      })
      .withTimeout(1000);
  }
}
