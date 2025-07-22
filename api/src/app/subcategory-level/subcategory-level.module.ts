import { WebSeoModule } from './../web-seo/web-seo.module';
import { Module } from '@nestjs/common';
import { SubcategoryLevelController } from './subcategory-level.controller';
import { SubcategoryLevelService } from './subcategory-level.service';

@Module({
  imports: [WebSeoModule],
  controllers: [SubcategoryLevelController],
  providers: [SubcategoryLevelService],
  exports: [SubcategoryLevelService],
})
export class SubcategoryLevelModule {}
