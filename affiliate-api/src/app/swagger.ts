import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Tag } from '../shared/constants';

export function setupSwagger(app: INestApplication) {

  const config = new DocumentBuilder()
    .setTitle('Affiliate API')
    .setDescription('API docs for MOT affiliate platform')
    .setVersion('0.1')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.tags = Object.values(Tag).map((name) => ({ name }));

  SwaggerModule.setup('api/docs', app, document);
}
