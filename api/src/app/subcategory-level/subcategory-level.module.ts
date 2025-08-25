import { Module } from '@nestjs/common';
import { SubcategoryLevelController } from './subcategory-level.controller';
import { SubcategoryLevelService } from './subcategory-level.service';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from './../web-seo/web-seo.module';

@Module({
  imports: [WebSeoModule, FaqModule],
  controllers: [SubcategoryLevelController],
  providers: [SubcategoryLevelService],
  exports: [SubcategoryLevelService],
})
export class SubcategoryLevelModule {}
