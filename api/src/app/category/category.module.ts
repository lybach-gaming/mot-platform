import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from './../web-seo/web-seo.module';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
  imports: [WebSeoModule, FaqModule, HelpersModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
