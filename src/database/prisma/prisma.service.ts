import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationShutdown {
  readonly db = db;
  readonly orm = db.orm.public;

  async onModuleInit() {
    await this.db.connect();
  }

  async onApplicationShutdown() {
    await this.db.close();
  }
}
