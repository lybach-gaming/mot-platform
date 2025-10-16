/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 8080;
  const reflector = app.get(Reflector);

  // NOTE: global nest setup
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  // Setup swagger in development by default; protected in production by environment
  try {
    setupSwagger(app);
  } catch (err) {
    // ignore if @nestjs/swagger is not installed in minimal dev environments
    const msg = err instanceof Error ? err.message : String(err);
    Logger.warn('Swagger setup skipped: ' + msg);
  }
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
