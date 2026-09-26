import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { setupSwagger } from './config/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
