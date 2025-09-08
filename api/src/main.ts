/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app/app.module';
import basicAuth from 'express-basic-auth';
import cookieParser from 'cookie-parser';
import '../env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'warn', 'error']
        : ['debug', 'log', 'warn', 'error'],
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors();
  app.use(cookieParser());
  app.use(compression({ threshold: 1024 }));

  app.useGlobalPipes(
    // Add any global validation pipes here if needed
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Master of Trivia API')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, config);

  app.use(
    ['/api/swagger', '/api/swagger-json'],
    basicAuth({
      users: { admin: 'newmotbackend' },
      challenge: true,
    })
  );

  SwaggerModule.setup('/api/swagger', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3333;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
