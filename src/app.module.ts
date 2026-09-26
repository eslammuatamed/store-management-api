import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AccessControlModule } from './modules/access-control/access-control.module.js';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor.js';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { HealthModule } from './health/health.module.js';

const interceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: BigIntSerializerInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ApiResponseInterceptor,
  },
];

const pipes = [
  {
    provide: APP_PIPE,
    useClass: StandardSchemaValidationPipe,
  },
];

const filters = [
  {
    provide: APP_FILTER,
    useClass: ApiExceptionFilter,
  },
];

@Module({
  imports: [DatabaseModule, AccessControlModule, HealthModule],
  controllers: [AppController],
  providers: [AppService, ...interceptors, ...pipes, ...filters],
})
export class AppModule {}
