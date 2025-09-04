import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from './../web-seo/web-seo.module';

@Module({
  imports: [WebSeoModule, FaqModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
