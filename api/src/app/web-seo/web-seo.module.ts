import { Module } from '@nestjs/common';
import { WebSeoService } from './web-seo.service';

@Module({
  providers: [WebSeoService],
  exports: [WebSeoService],
})
export class WebSeoModule {}
