import 'reflect-metadata';
import { Logger, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  try {
    setupSwagger(app);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.warn('Swagger setup skipped: ' + msg);
  }

  const port = process.env.PORT || 8080;
  await app.listen(port as number);
  Logger.log(`🚀 Affiliate API running at http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

