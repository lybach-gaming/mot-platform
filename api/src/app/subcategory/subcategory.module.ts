import { Module } from '@nestjs/common';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from '../web-seo/web-seo.module';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
  imports: [WebSeoModule, FaqModule, HelpersModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
  exports: [SubcategoryService],
})
export class SubcategoryModule {}
